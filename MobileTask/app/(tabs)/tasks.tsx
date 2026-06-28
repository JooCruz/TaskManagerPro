import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { MessageSquare, Send, X, CheckCircle, Plus, Minus, Star, Paperclip, FileText, ExternalLink } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config/environment';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

const isWeb = Platform.OS === 'web';

const mostrarAlerta = (titulo: string, mensagem: string) => {
  if (Platform.OS === 'web') alert(`${titulo}\n\n${mensagem}`);
  else Alert.alert(titulo, mensagem);
};

export default function TaskDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const headerTitleSize = isMobile ? 22 : 32;
  const taskTitleSize = isMobile ? 16 : 18;
  const modalTitleSize = isMobile ? 18 : 20;

  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [commentModal, setCommentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [listaComentarios, setListaComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const [uploadingDoc, setUploadingDoc] = useState<number | null>(null);
  const [documentos, setDocumentos] = useState<{ [tarefaId: number]: any[] }>({});

  useEffect(() => { fetchTarefas(); }, []);

  const fetchTarefas = async () => {
    const userData = await AsyncStorage.getItem('user_data');
    if (userData && userData !== 'undefined') {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      try {
        const meuId = parsed.id || parsed.user_id; 
        const endpoint = parsed.role === 'manager' 
          ? `get_manager_tasks?departamento_id=${parsed.departamento_id}`
          : `get_my_tasks?user_id=${meuId}`;

        const res = await fetch(getApiUrl(endpoint));
        const data = await res.json();
        if (data.status === 'sucesso') {
          setTarefas(data.tarefas);
          data.tarefas.forEach((t: any) => fetchDocumentos(t.id));
        }
      } catch (e) { console.error(e); }
    }
    setLoading(false);
  };

  const fetchDocumentos = async (tarefaId: number) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-documents')
        .list(`tarefa-${tarefaId}/`);
      
      if (!error && data) {
        setDocumentos(prev => ({ ...prev, [tarefaId]: data }));
      }
    } catch (e) { console.error(e); }
  };

  const handleUploadDocumento = async (tarefaId: number) => {
    if (!isWeb) {
      mostrarAlerta("Aviso", "Upload de documentos só disponível na versão web.");
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("Ficheiro demasiado grande. Máximo 10MB.");
        return;
      }

      setUploadingDoc(tarefaId);
      try {
        const fileName = `tarefa-${tarefaId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('task-documents')
          .upload(fileName, file);

        if (error) {
          alert(`Erro ao fazer upload: ${error.message}`);
        } else {
          alert("Documento submetido com sucesso!");
          fetchDocumentos(tarefaId);
        }
      } catch (e) {
        alert("Erro ao fazer upload do documento.");
      } finally {
        setUploadingDoc(null);
      }
    };
    input.click();
  };

  const handleVerDocumento = async (tarefaId: number, fileName: string) => {
    const { data } = supabase.storage
      .from('task-documents')
      .getPublicUrl(`tarefa-${tarefaId}/${fileName}`);
    
    if (isWeb) {
      window.open(data.publicUrl, '_blank');
    } else {
      mostrarAlerta("Link", data.publicUrl);
    }
  };

  const handleToggleImportante = async (tarefaId: number) => {
    try {
      await fetch(getApiUrl('toggle_importante'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: tarefaId })
      });
      fetchTarefas();
    } catch (e) { console.error(e); }
  };

  const handleUpdateProgress = async (tarefaId: number, currentProgress: number, amount: number) => {
    if (user?.role === 'manager') return;
    let newProgress = Number(currentProgress) + amount;
    if (newProgress > 100) newProgress = 100;
    if (newProgress < 0) newProgress = 0;
    try {
      const res = await fetch(getApiUrl('update_task_progress'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: tarefaId, progresso: newProgress })
      });
      const data = await res.json();
      if(data.status === 'sucesso') fetchTarefas();
    } catch (e) { mostrarAlerta("Erro", "Falha ao atualizar."); }
  };

  const openComments = (tarefa: any) => {
    setSelectedTask(tarefa);
    setCommentModal(true);
    fetchComentarios(tarefa.id);
  };

  const fetchComentarios = async (tarefaId: number) => {
    setLoadingComments(true);
    try {
      const res = await fetch(getApiUrl(`get_comments?tarefa_id=${tarefaId}`));
      const data = await res.json();
      if (data.status === 'sucesso') setListaComentarios(data.comentarios || []);
    } catch (e) { console.error(e); }
    setLoadingComments(false);
  };

  const handleSendComment = async () => {
    const comentarioLimpo = novoComentario.trim();
    const meuId = user?.id || user?.user_id;

    if (!comentarioLimpo || sendingComment) return;
    if (!selectedTask?.id || !meuId) {
      mostrarAlerta("Erro", "Não foi possível identificar a tarefa ou o utilizador.");
      return;
    }

    setSendingComment(true);
    try {
      const res = await fetch(getApiUrl('add_comment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: selectedTask.id, user_id: meuId, comentario: comentarioLimpo })
      });
      const data = await res.json();
      if (data.status === 'sucesso') {
        setNovoComentario('');
        await fetchComentarios(selectedTask.id);
      } else {
        mostrarAlerta("Erro", data.mensagem || data.message || "Não foi possível enviar o comentário.");
      }
    } catch (e) {
      mostrarAlerta("Erro", "Falha ao ligar ao servidor.");
    } finally {
      setSendingComment(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3B82F6" /></View>;

  return (
    <View style={styles.pageWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false} bounces={false}>
        <View style={styles.innerWrapper}>
          <View style={styles.headerArea}>
            <Text style={[styles.headerTitle, { fontSize: headerTitleSize }]}>{user?.role === 'manager' ? 'Tarefas da Equipa' : 'Minhas Tarefas'}</Text>
            <Text style={styles.headerSubtitle}>{user?.role === 'manager' ? 'Monitoriza o progresso da tua equipa' : 'Gerencia o teu trabalho diário'}</Text>
          </View>

          <View style={styles.tasksWrapper}>
            {tarefas.length > 0 ? tarefas.map((t) => (
              <View key={t.id} style={[styles.taskCard, isMobile && { padding: 18 }]}>
                <View style={styles.cardTop}>
                  <TouchableOpacity onPress={() => handleToggleImportante(t.id)}>
                    <Star size={24} color={t.importante == 1 ? "#ECC94B" : "#E2E8F0"} fill={t.importante == 1 ? "#ECC94B" : "transparent"} />
                  </TouchableOpacity>
                  <Text style={styles.dateText}>{t.data_entrega}</Text>
                </View>

                <Text style={[styles.taskTitle, { fontSize: taskTitleSize }]}>{t.titulo}</Text>
                
                {user?.role === 'manager' && (
                  <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 15, fontWeight: '600' }}>
                    Responsável: <Text style={{ color: '#3B82F6' }}>{t.funcionario_nome || 'Membro'}</Text>
                  </Text>
                )}
                
                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progresso</Text>
                    <Text style={styles.progressPercent}>{t.progresso}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${t.progresso}%` }]} />
                  </View>
                </View>

                {/* DOCUMENTOS */}
                <View style={styles.documentosSection}>
                  <View style={styles.documentosHeader}>
                    <Text style={styles.documentosLabel}>DOCUMENTOS</Text>
                    {user?.role !== 'manager' && (
                      <TouchableOpacity 
                        style={styles.uploadBtn} 
                        onPress={() => handleUploadDocumento(t.id)}
                        disabled={uploadingDoc === t.id}
                      >
                        {uploadingDoc === t.id ? (
                          <ActivityIndicator size="small" color="#1e40af" />
                        ) : (
                          <>
                            <Paperclip size={14} color="#1e40af" />
                            <Text style={styles.uploadBtnText}>Submeter</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {documentos[t.id] && documentos[t.id].length > 0 ? (
                    <View style={styles.documentosList}>
                      {documentos[t.id].map((doc, i) => (
                        <TouchableOpacity 
                          key={i} 
                          style={styles.documentoItem}
                          onPress={() => handleVerDocumento(t.id, doc.name)}
                        >
                          <FileText size={14} color="#3b82f6" />
                          <Text style={styles.documentoNome} numberOfLines={1}>
                            {doc.name.replace(/^\d+-/, '')}
                          </Text>
                          <ExternalLink size={12} color="#94a3b8" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.semDocumentos}>Sem documentos submetidos</Text>
                  )}
                </View>

                <View style={[styles.cardActions, isMobile && { flexDirection: 'column', gap: 15 }]}>
                  {user?.role !== 'manager' ? (
                    t.progresso < 100 ? (
                      <View style={styles.stepper}>
                        <TouchableOpacity onPress={() => handleUpdateProgress(t.id, t.progresso, -10)} style={styles.stepBtn}><Minus size={18} color="#4A5568" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdateProgress(t.id, t.progresso, 10)} style={styles.stepBtn}><Plus size={18} color="#4A5568" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdateProgress(t.id, t.progresso, 100)} style={styles.doneBtn}><CheckCircle size={20} color="white" /></TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.completedBadge}>
                        <CheckCircle size={18} color="#10B981" />
                        <Text style={styles.completedText}>Concluída</Text>
                      </View>
                    )
                  ) : (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Modo de Leitura</Text>
                    </View>
                  )}

                  <TouchableOpacity style={[styles.feedbackBtn, isMobile && { width: '100%' }]} onPress={() => openComments(t)}>
                    <MessageSquare size={18} color="#3B82F6" />
                    <Text style={styles.feedbackText}>Comentários</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )) : (
              <View style={styles.emptyState}>
                <CheckCircle size={40} color="#10B981" />
                <Text style={styles.emptyText}>Sem tarefas pendentes.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={commentModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
          style={[styles.overlay, isMobile && styles.overlayMobile]}
        >
          <View style={[styles.modalCard, isMobile && { width: '100%', height: '90%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginTop: 'auto' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: modalTitleSize }]}>Comentários</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}><X size={24} color="#94A3B8" /></TouchableOpacity>
            </View>

            <ScrollView
              style={styles.commentsList}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {loadingComments ? (
                <ActivityIndicator size="small" color="#3B82F6" style={{ marginTop: 20 }} />
              ) : listaComentarios.length > 0 ? (
                listaComentarios.map((c, index) => {
                  const isMe = c.user_id == (user?.id || user?.user_id);
                  return (
                    <View key={index} style={[styles.commentBubble, isMe ? styles.myComment : styles.otherComment]}>
                      {!isMe && <Text style={styles.commentAuthor}>{c.nome_user || 'Utilizador'}</Text>}
                      <Text style={[styles.commentText, isMe && { color: 'white' }]}>{c.comentario}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noCommentsText}>Ainda não há comentários.</Text>
              )}
            </ScrollView>

            <View style={styles.commentInputArea}>
              <TextInput 
                style={styles.commentInput} 
                placeholder="Escreve um comentário..." 
                placeholderTextColor="#64748b"
                value={novoComentario} 
                onChangeText={setNovoComentario} 
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, sendingComment && styles.sendBtnDisabled]}
                onPress={handleSendComment}
                disabled={sendingComment}
              >
                {sendingComment ? <ActivityIndicator size="small" color="white" /> : <Send size={18} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#fafbfc', maxWidth: '100%', overflow: 'hidden' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  innerWrapper: { width: '100%', maxWidth: 1000, padding: 24 },
  headerArea: { marginBottom: 32 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 15, color: '#64748b', marginTop: 6, fontWeight: '500' },
  tasksWrapper: { gap: 16 },
  taskCard: { backgroundColor: 'white', borderRadius: 12, padding: 22, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dateText: { fontSize: 12, fontWeight: '700', color: '#000000', backgroundColor: '#f8fafc', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  taskTitle: { fontSize: 18, fontWeight: '800', color: '#000000', marginBottom: 6, letterSpacing: -0.2 },
  progressSection: { marginBottom: 16 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap' },
  progressLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 },
  progressPercent: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  progressBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1e40af', borderRadius: 4 },
  documentosSection: { marginBottom: 16, padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  documentosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  documentosLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  uploadBtnText: { fontSize: 12, fontWeight: '700', color: '#1e40af' },
  documentosList: { gap: 8 },
  documentoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  documentoNome: { flex: 1, fontSize: 13, color: '#1e293b', fontWeight: '500' },
  semDocumentos: { fontSize: 12, color: '#94a3b8', fontWeight: '500', textAlign: 'center', paddingVertical: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16 },
  stepper: { flexDirection: 'row', gap: 10, width: 'auto' },
  stepBtn: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0' },
  doneBtn: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#ecfdf5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  completedText: { color: '#059669', fontWeight: '700', fontSize: 14 },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dbeafe', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, flexShrink: 1 },
  feedbackText: { color: '#1e40af', fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 48, backgroundColor: 'white', borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyText: { marginTop: 16, fontSize: 15, color: '#64748b', fontWeight: '600', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  overlayMobile: { justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', width: '90%', maxWidth: 520, borderRadius: 16, overflow: 'hidden', elevation: 8, maxHeight: '90%', minHeight: 320 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fafbfc' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  commentsList: { flex: 1, minHeight: 0, padding: 20, backgroundColor: '#fafbfc' },
  noCommentsText: { textAlign: 'center', color: '#94a3b8', marginTop: 24, fontWeight: '500' },
  commentBubble: { padding: 13, borderRadius: 12, marginBottom: 12, maxWidth: '85%' },
  myComment: { backgroundColor: '#1e40af', alignSelf: 'flex-end', borderBottomRightRadius: 3 },
  otherComment: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  commentAuthor: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 5 },
  commentText: { fontSize: 14, color: '#1e293b', lineHeight: 20 },
  commentInputArea: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'flex-end', flexWrap: 'wrap' },
  commentInput: { flex: 1, minWidth: 0, flexShrink: 1, backgroundColor: '#f8fafc', minHeight: 48, maxHeight: 120, borderRadius: 18, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 14, color: '#000000', borderWidth: 1.5, borderColor: '#e2e8f0', textAlignVertical: 'top' },
  sendBtn: { width: 42, height: 42, borderRadius: 20, backgroundColor: '#1e40af', justifyContent: 'center', alignItems: 'center', marginLeft: 10, elevation: 2 },
  sendBtnDisabled: { opacity: 0.65 }
});