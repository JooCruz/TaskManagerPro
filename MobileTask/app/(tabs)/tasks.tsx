import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Alert, Dimensions, Modal, TextInput, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { MessageSquare, Send, X, CheckCircle, Plus, Minus, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

export default function TaskDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [commentModal, setCommentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [listaComentarios, setListaComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const getUrl = (endpoint: string) => isWeb 
    ? `http://localhost/taskmanager_api/${endpoint}` 
    : `http://172.20.10.5/taskmanager_api/${endpoint}`;

  useEffect(() => { fetchTarefas(); }, []);

  const fetchTarefas = async () => {
    const userData = await AsyncStorage.getItem('user_data');
    if (userData && userData !== 'undefined') {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      try {
        const meuId = parsed.id || parsed.user_id; 
        const endpoint = parsed.role === 'manager' 
          ? `get_manager_tasks.php?departamento_id=${parsed.departamento_id}`
          : `get_my_tasks.php?user_id=${meuId}`;

        const res = await fetch(getUrl(endpoint));
        const data = await res.json();
        if (data.status === 'sucesso') setTarefas(data.tarefas);
      } catch (e) { console.error(e); }
    }
    setLoading(false);
  };

  const handleToggleImportante = async (tarefaId: number) => {
    try {
      await fetch(getUrl('toggle_importante.php'), {
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
      const res = await fetch(getUrl('update_task_progress.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: tarefaId, progresso: newProgress })
      });
      const data = await res.json();
      if(data.status === 'sucesso') fetchTarefas();
    } catch (e) { Alert.alert("Erro", "Falha ao atualizar."); }
  };

  const openComments = (tarefa: any) => {
    setSelectedTask(tarefa);
    setCommentModal(true);
    fetchComentarios(tarefa.id);
  };

  const fetchComentarios = async (tarefaId: number) => {
    setLoadingComments(true);
    try {
      const res = await fetch(getUrl(`get_comments.php?tarefa_id=${tarefaId}`));
      const data = await res.json();
      if (data.status === 'sucesso') setListaComentarios(data.comentarios || []);
    } catch (e) { console.error(e); }
    setLoadingComments(false);
  };

  const handleSendComment = async () => {
    if (!novoComentario.trim()) return;
    try {
      const meuId = user.id || user.user_id;
      const res = await fetch(getUrl('add_comment.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: selectedTask.id, user_id: meuId, comentario: novoComentario })
      });
      const data = await res.json();
      if (data.status === 'sucesso') {
        setNovoComentario('');
        fetchComentarios(selectedTask.id);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3B82F6" /></View>;

  return (
    <View style={styles.pageWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={false} bounces={false}>
        <View style={styles.innerWrapper}>
          <View style={styles.headerArea}>
             <Text style={styles.headerTitle}>{user?.role === 'manager' ? 'Tarefas da Equipa' : 'Minhas Tarefas'}</Text>
             <Text style={styles.headerSubtitle}>{user?.role === 'manager' ? 'Monitoriza o progresso da tua equipa' : 'Gerencia o teu trabalho diário'}</Text>
          </View>

          <View style={styles.tasksWrapper}>
            {tarefas.length > 0 ? tarefas.map((t) => (
              <View key={t.id} style={styles.taskCard}>
                <View style={styles.cardTop}>
                  <TouchableOpacity onPress={() => handleToggleImportante(t.id)}>
                     <Star size={24} color={t.importante == 1 ? "#ECC94B" : "#E2E8F0"} fill={t.importante == 1 ? "#ECC94B" : "transparent"} />
                  </TouchableOpacity>
                  <Text style={styles.dateText}>{t.data_entrega}</Text>
                </View>

                <Text style={styles.taskTitle}>{t.titulo}</Text>
                
                {/* CORREÇÃO CIRÚRGICA: A usar 'funcionario_nome' vindo do teu PHP */}
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

      {/* MODAL DE COMENTÁRIOS */}
      <Modal visible={commentModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={[styles.modalCard, isMobile && { width: '100%', height: '90%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginTop: 'auto' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentários</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}><X size={24} color="#94A3B8" /></TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList} contentContainerStyle={{ paddingBottom: 20 }}>
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
                value={novoComentario} 
                onChangeText={setNovoComentario} 
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendComment}>
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#F8FAFC', maxWidth: '100%', overflow: 'hidden' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  innerWrapper: { width: '100%', maxWidth: 1000, padding: 20 },
  headerArea: { marginBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 15, color: '#64748B', marginTop: 4 },
  tasksWrapper: { gap: 15 },
  taskCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 13, fontWeight: '700', color: '#94A3B8', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  taskTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 5 },
  progressSection: { marginBottom: 20 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 },
  progressPercent: { fontSize: 13, fontWeight: '900', color: '#1E293B' },
  progressBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  stepper: { flexDirection: 'row', gap: 10, width: 'auto' },
  stepBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  doneBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  completedText: { color: '#10B981', fontWeight: 'bold' },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EFF6FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  feedbackText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyText: { marginTop: 15, fontSize: 15, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: 'white', width: '90%', maxWidth: 500, height: 600, borderRadius: 24, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  commentsList: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  noCommentsText: { textAlign: 'center', color: '#94A3B8', marginTop: 20 },
  commentBubble: { padding: 15, borderRadius: 16, marginBottom: 15, maxWidth: '85%' },
  myComment: { backgroundColor: '#3B82F6', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  otherComment: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  commentAuthor: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 4 },
  commentText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },
  commentInputArea: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F1F5F9', alignItems: 'center' },
  commentInput: { flex: 1, backgroundColor: '#F8FAFC', minHeight: 45, maxHeight: 100, borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  sendBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});