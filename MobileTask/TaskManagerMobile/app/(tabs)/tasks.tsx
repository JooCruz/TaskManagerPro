import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { User, MessageSquare, Send, X, CheckCircle, Plus, Minus, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TaskDashboard() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [commentModal, setCommentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [listaComentarios, setListaComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');

  const getUrl = (endpoint: string) => Platform.OS === 'web' ? `http://localhost/taskmanager_api/${endpoint}` : `http://172.20.10.5/taskmanager_api/${endpoint}`;

  useEffect(() => { fetchTarefas(); }, []);

  const fetchTarefas = async () => {
    const userData = await AsyncStorage.getItem('user_data');
    if (userData) {
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
      const res = await fetch(getUrl('toggle_importante.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarefa_id: tarefaId })
      });
      const data = await res.json();
      if (data.status === 'sucesso') fetchTarefas();
    } catch (e) { console.error(e); }
  };

  const handleUpdateProgress = async (tarefaId: number, currentProgress: number, amount: number) => {
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
      if (data.status === 'sucesso') fetchTarefas();
    } catch (e) { Alert.alert("Erro", "Falha de rede."); }
  };

  const fetchComentarios = async (tarefaId: number) => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(getUrl(`get_comments.php?tarefa_id=${tarefaId}&t=${timestamp}`));
      const data = await res.json();
      if (data.status === 'sucesso') setListaComentarios(data.comentarios);
    } catch (e) { console.error(e); }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      const meuId = user?.id || user?.user_id;
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
    } catch (e) { Alert.alert("Erro", "Falha ao enviar."); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3182CE" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerArea}>
           <Text style={styles.headerTitle}>Gestão de Tarefas</Text>
           <Text style={styles.headerSubtitle}>Acompanha o progresso da tua equipa</Text>
        </View>

        {tarefas.map((t) => (
          <View key={t.id} style={styles.taskCard}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <TouchableOpacity onPress={() => handleToggleImportante(t.id)}>
                   <Star size={22} color={t.importante == 1 ? "#ECC94B" : "#E2E8F0"} fill={t.importante == 1 ? "#ECC94B" : "transparent"} />
                </TouchableOpacity>
                <View style={[styles.statusBadge, t.status === 'Concluída' && styles.statusBadgeDone]}>
                  <Text style={[styles.statusText, t.status === 'Concluída' && styles.statusTextDone]}>{t.status}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{t.data_entrega}</Text>
            </View>

            <Text style={styles.taskTitle}>{t.titulo}</Text>
            
            <View style={styles.userRow}>
              <User size={14} color="#A0AEC0" />
              <Text style={styles.userLabel}>{user?.role === 'manager' ? t.funcionario_nome : t.criador_nome}</Text>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Progresso</Text>
                <Text style={styles.progressPercent}>{t.progresso}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${t.progresso}%` }]} />
              </View>
            </View>

            <View style={styles.cardActions}>
              {user?.role === 'user' && t.progresso < 100 ? (
                <View style={styles.stepper}>
                  <TouchableOpacity onPress={() => handleUpdateProgress(t.id, t.progresso, -10)} style={styles.stepBtn}><Minus size={16} color="#4A5568" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateProgress(t.id, t.progresso, 10)} style={styles.stepBtn}><Plus size={16} color="#4A5568" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleUpdateProgress(t.id, t.progresso, 100)} style={styles.doneBtn}><CheckCircle size={18} color="white" /></TouchableOpacity>
                </View>
              ) : <View />}

              <TouchableOpacity style={styles.feedbackBtn} onPress={() => { setSelectedTask(t); setCommentModal(true); fetchComentarios(t.id); }}>
                <MessageSquare size={18} color="#3182CE" />
                <Text style={styles.feedbackText}>Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODAL COMENTÁRIOS */}
      <Modal visible={commentModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Feedback da Tarefa</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}><X size={24} color="#A0AEC0" /></TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {listaComentarios.map((c) => {
                const isMine = Number(c.user_id) === Number(user?.id || user?.user_id);
                return (
                  <View key={c.id} style={[styles.chatBox, isMine ? styles.chatMine : styles.chatTheirs]}>
                    <Text style={styles.chatName}>{c.nome}</Text>
                    <Text style={styles.chatText}>{c.comentario}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput style={styles.inputField} placeholder="Escreve uma mensagem..." value={novoComentario} onChangeText={setNovoComentario} />
              <TouchableOpacity style={styles.sendBtn} onPress={enviarComentario}><Send size={20} color="white" /></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, maxWidth: 800, alignSelf: 'center', width: '100%' },
  headerArea: { marginBottom: 25 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#2D3748' },
  headerSubtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  
  taskCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusBadge: { backgroundColor: '#EBF8FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusBadgeDone: { backgroundColor: '#F0FFF4' },
  statusText: { fontSize: 11, fontWeight: 'bold', color: '#3182CE', textTransform: 'uppercase' },
  statusTextDone: { color: '#38A169' },
  dateText: { fontSize: 12, fontWeight: '700', color: '#A0AEC0' },
  
  taskTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  userLabel: { fontSize: 14, color: '#718096', fontWeight: '500' },
  
  progressSection: { marginBottom: 20 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: 'bold', color: '#4A5568', textTransform: 'uppercase' },
  progressPercent: { fontSize: 12, fontWeight: '800', color: '#2D3748' },
  progressBg: { height: 8, backgroundColor: '#EDF2F7', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3182CE', borderRadius: 4 },
  
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EDF2F7', paddingTop: 15 },
  stepper: { flexDirection: 'row', gap: 10 },
  stepBtn: { backgroundColor: '#F7FAFC', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  doneBtn: { backgroundColor: '#38A169', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackText: { color: '#3182CE', fontWeight: 'bold', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(26, 32, 44, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748' },
  chatBox: { padding: 15, borderRadius: 15, marginBottom: 12, maxWidth: '85%' },
  chatMine: { backgroundColor: '#EBF8FF', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  chatTheirs: { backgroundColor: '#F7FAFC', alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#EDF2F7' },
  chatName: { fontSize: 10, fontWeight: 'bold', color: '#718096', marginBottom: 4, textTransform: 'uppercase' },
  chatText: { fontSize: 15, color: '#2D3748', lineHeight: 20 },
  chatInputRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 15 },
  inputField: { flex: 1, backgroundColor: '#F7FAFC', borderRadius: 15, paddingHorizontal: 20, height: 50, borderWidth: 1, borderColor: '#E2E8F0' },
  sendBtn: { backgroundColor: '#3182CE', width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4 }
});