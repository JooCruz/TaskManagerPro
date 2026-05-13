import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, useWindowDimensions } from 'react-native';
import { Plus, AlertCircle, Star, CheckCircle, Clock, TrendingUp, X, User, Calendar as CalendarIcon, Clock3, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

const formatarDataSQL = (texto: string) => {
  const c = texto.replace(/\D/g, ''); 
  if (c.length <= 4) return c;
  if (c.length <= 6) return `${c.slice(0, 4)}-${c.slice(4, 6)}`;
  return `${c.slice(0, 4)}-${c.slice(4, 6)}-${c.slice(6, 8)}`;
};

const formatarHoraSQL = (texto: string) => {
  const c = texto.replace(/\D/g, ''); 
  if (c.length <= 2) return c;
  return `${c.slice(0, 2)}:${c.slice(2, 4)}`;
};

export default function ExploreDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  
  const [modalCreate, setModalCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [horaEntrega, setHoraEntrega] = useState('09:00');

  const getUrl = (endpoint: string) => isWeb 
    ? `http://localhost/taskmanager_api/${endpoint}` 
    : `http://172.20.10.5/taskmanager_api/${endpoint}`;

  useEffect(() => {
    const loadData = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData && userData !== 'undefined') {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        if (parsed.role === 'manager') fetchTeam(parsed.departamento_id);
        fetchDashboardData(parsed.id || parsed.user_id, parsed.role, parsed.departamento_id);
      }
    };
    loadData();
  }, []);

  const fetchDashboardData = async (userId: number, role: string, deptId: number) => {
    try {
      const endpoint = role === 'manager' ? `get_manager_tasks.php?departamento_id=${deptId}` : `get_my_tasks.php?user_id=${userId}`;
      const res = await fetch(getUrl(endpoint));
      const data = await res.json();
      if (data.status === 'sucesso') setTarefas(data.tarefas);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchTeam = async (deptId: number) => {
    try {
      const res = await fetch(getUrl(`get_team.php?departamento_id=${deptId}`));
      const data = await res.json();
      if (data.status === 'sucesso') setTeam(data.team);
    } catch (e) { console.error(e); }
  };

  const handleCreateTask = async () => {
    if (!titulo || !selectedUser?.id || dataEntrega.length < 10) { 
      Alert.alert("Aviso", "Preenche o título, a data e seleciona um membro."); 
      return; 
    }
    const payload = {
      empresa_id: user?.empresa_id || 1,
      departamento_id: user?.departamento_id || 1,
      criador_id: user?.id || user?.user_id,
      atribuida_a: selectedUser.id,
      titulo, descricao: descricao || "",
      data_entrega: dataEntrega, hora_entrega: horaEntrega || "09:00"
    };
    try {
      const res = await fetch(getUrl('create_task.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'sucesso') {
        Alert.alert("Sucesso", "Tarefa criada!");
        setModalCreate(false); setTitulo(''); setDescricao(''); setDataEntrega(''); setHoraEntrega('09:00');
        fetchDashboardData(user.id || user.user_id, user.role, user.departamento_id);
      }
    } catch (e) { Alert.alert("Erro", "Falha ao ligar ao servidor."); }
  };

  const concluidas = tarefas.filter(t => t.progresso == 100);
  const pendentes = tarefas.filter(t => t.progresso < 100);
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const atrasadas = pendentes.filter(t => new Date(t.data_entrega) < hoje);
  const importantes = tarefas.filter(t => t.importante == 1 || t.importante == "1");

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3B82F6" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView 
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        contentContainerStyle={[styles.scrollContent, { padding: isMobile ? 15 : 40 }]}
      >
        <View style={[styles.headerRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 15 }]}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.nome}! 👋</Text>
            <Text style={styles.subGreeting}>Resumo da sua produtividade</Text>
          </View>
          <View style={[styles.headerActions, isMobile && { width: '100%' }]}>
            
            {user?.role === 'manager' && (
              <TouchableOpacity style={[styles.addBtn, isMobile && { flex: 1 }]} onPress={() => setModalCreate(true)}>
                <Plus size={20} color="white" />
                <Text style={styles.addBtnText}>Nova Tarefa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.kpiRow, isMobile && { flexDirection: 'column' }]}>
          <View style={[styles.kpiCard, { borderLeftColor: '#10B981' }]}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>Concluídas</Text><CheckCircle size={22} color="#10B981" /></View>
            <Text style={styles.kpiValue}>{concluidas.length}</Text>
          </View>
          <View style={[styles.kpiCard, { borderLeftColor: '#F59E0B' }]}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>Pendentes</Text><Clock size={22} color="#F59E0B" /></View>
            <Text style={styles.kpiValue}>{pendentes.length}</Text>
          </View>
          <View style={[styles.kpiCard, { borderLeftColor: '#3B82F6' }]}>
            <View style={styles.kpiTop}><Text style={styles.kpiLabel}>Eficiência</Text><TrendingUp size={22} color="#3B82F6" /></View>
            <Text style={styles.kpiValue}>{tarefas.length > 0 ? Math.round((concluidas.length/tarefas.length)*100) : 0}%</Text>
          </View>
        </View>

        <View style={[styles.bottomGrid, isMobile && { flexDirection: 'column' }]}>
          <View style={styles.gridColumn}>
            <Text style={styles.sectionTitle}>⚠️ Alertas Urgentes</Text>
            {atrasadas.length > 0 ? atrasadas.map(t => (
              <View key={t.id} style={styles.alertCard}>
                <AlertCircle size={24} color="#EF4444" />
                <View style={{flex: 1, marginLeft: 15}}>
                  <Text style={styles.alertDesc} numberOfLines={1}>{t.titulo}</Text>
                  <Text style={styles.alertDate}>Atrasada desde {t.data_entrega}</Text>
                </View>
              </View>
            )) : (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>Tudo em dia! ✅</Text></View>
            )}
          </View>

          <View style={styles.gridColumn}>
            <Text style={styles.sectionTitle}>⭐ Tarefas Favoritas</Text>
            {importantes.map(t => (
              <View key={t.id} style={styles.favCard}>
                <Text style={styles.favTitle}>{t.titulo}</Text>
                <View style={styles.favProgressRow}>
                  <View style={styles.favBarBg}><View style={[styles.favBarFill, { width: `${t.progresso}%` }]} /></View>
                  <Text style={styles.favPercent}>{t.progresso}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalCreate} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, isMobile && { width: '95%', padding: 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atribuir Tarefa</Text>
              <TouchableOpacity onPress={() => setModalCreate(false)}><X size={24} color="#94A3B8" /></TouchableOpacity>
            </View>

            <Text style={styles.label}>SELECIONAR MEMBRO</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
              {team
                .filter(m => m.id !== (user?.id || user?.user_id)) // FILTRO AQUI: Esconde o manager atual
                .map(m => (
                <TouchableOpacity 
                  key={m.id} 
                  style={[styles.userChip, selectedUser?.id === m.id && styles.userChipActive]}
                  onPress={() => setSelectedUser(m)}
                >
                  <Text style={[styles.userChipText, selectedUser?.id === m.id && {color: 'white'}]}>{m.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputWrapper}>
              <TextInput style={styles.textInput} placeholder="Título da tarefa" value={titulo} onChangeText={setTitulo} />
            </View>

            <View style={[styles.modalRow, isMobile && { flexDirection: 'column' }]}>
              <View style={[styles.inputWrapper, {flex: 1}, !isMobile && {marginRight: 10}]}>
                <CalendarIcon size={16} color="#94A3B8" style={{marginLeft: 10}}/>
                <TextInput 
                  style={styles.textInput} placeholder="AAAA-MM-DD" value={dataEntrega} 
                  onChangeText={(t) => setDataEntrega(formatarDataSQL(t))} keyboardType="numeric" maxLength={10}
                />
              </View>
              <View style={[styles.inputWrapper, {flex: 1}]}>
                <Clock3 size={16} color="#94A3B8" style={{marginLeft: 10}}/>
                <TextInput 
                  style={styles.textInput} placeholder="HH:MM" value={horaEntrega} 
                  onChangeText={(t) => setHoraEntrega(formatarHoraSQL(t))} keyboardType="numeric" maxLength={5}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTask}>
              <Text style={styles.saveBtnText}>Criar Tarefa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greeting: { fontSize: 34, fontWeight: '900', color: '#1E293B' },
  subGreeting: { fontSize: 15, color: '#64748B', marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 12 },
  addBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, gap: 10 },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  exportText: { color: '#64748B', fontWeight: '700' },
  kpiRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  kpiCard: { flex: 1, backgroundColor: 'white', padding: 24, borderRadius: 24, borderLeftWidth: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  kpiTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  kpiLabel: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  kpiValue: { fontSize: 36, fontWeight: '900', color: '#1E293B' },
  bottomGrid: { flexDirection: 'row', gap: 30 },
  gridColumn: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 15 },
  alertCard: { backgroundColor: '#FFF5F5', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#EF4444' },
  alertDesc: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  alertDate: { fontSize: 12, color: '#EF4444', marginTop: 2 },
  favCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 12, elevation: 1 },
  favTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  favProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favBarBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  favBarFill: { height: '100%', backgroundColor: '#3B82F6' },
  favPercent: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: 'white', width: '90%', maxWidth: 500, padding: 35, borderRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 11, fontWeight: '900', color: '#94A3B8', marginBottom: 12, letterSpacing: 1.5 },
  userChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', marginRight: 10 },
  userChipActive: { backgroundColor: '#3B82F6' },
  userChipText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15, height: 55 },
  textInput: { flex: 1, paddingHorizontal: 15, fontSize: 15, color: '#1E293B', height: '100%' },
  modalRow: { flexDirection: 'row' },
  saveBtn: { backgroundColor: '#1E293B', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  emptyCard: { padding: 20, backgroundColor: '#F1F5F9', borderRadius: 16, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' }
});