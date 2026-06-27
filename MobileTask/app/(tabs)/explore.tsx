import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { Plus, AlertCircle, Star, CheckCircle, Clock, TrendingUp, X, User, Calendar as CalendarIcon, Clock3, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config/environment';

const isWeb = Platform.OS === 'web';

const formatarDataEntrega = (texto: string) => {
  const c = texto.replace(/\D/g, ''); 
  if (c.length <= 2) return c;
  if (c.length <= 4) return `${c.slice(0, 2)}-${c.slice(2, 4)}`;
  return `${c.slice(0, 2)}-${c.slice(2, 4)}-${c.slice(4, 8)}`;
};

const converterDataParaSQL = (data: string) => {
  const [dia, mes, ano] = data.split('-');
  if (!dia || !mes || !ano || ano.length !== 4) return null;

  const diaNumero = Number(dia);
  const mesNumero = Number(mes);
  if (diaNumero < 1 || diaNumero > 31 || mesNumero < 1 || mesNumero > 12) return null;

  return `${ano}-${mes}-${dia}`;
};

const formatarHoraSQL = (texto: string) => {
  const c = texto.replace(/\D/g, ''); 
  if (c.length <= 2) return c;
  return `${c.slice(0, 2)}:${c.slice(2, 4)}`;
};

export default function ExploreDashboard() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  // Responsive font sizes
  const modalTitleSize = isMobile ? 18 : 24;

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
      const endpoint = role === 'manager' ? `get_manager_tasks?departamento_id=${deptId}` : `get_my_tasks?user_id=${userId}`;
      const res = await fetch(getApiUrl(endpoint));
      const data = await res.json();
      if (data.status === 'sucesso') setTarefas(data.tarefas);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchTeam = async (deptId: number) => {
    try {
      const res = await fetch(getApiUrl(`get_team?departamento_id=${deptId}`));
      const data = await res.json();
      if (data.status === 'sucesso') setTeam(data.team);
    } catch (e) { console.error(e); }
  };

  const handleCreateTask = async () => {
    if (!titulo || !selectedUser?.id || dataEntrega.length < 10) { 
      Alert.alert("Aviso", "Preenche o título, a data e seleciona um membro."); 
      return; 
    }
    const dataEntregaSQL = converterDataParaSQL(dataEntrega);
    if (!dataEntregaSQL) {
      Alert.alert("Aviso", "A data deve estar no formato DD-MM-AAAA.");
      return;
    }

    const payload = {
      empresa_id: user?.empresa_id || 1,
      departamento_id: user?.departamento_id || 1,
      criador_id: user?.id || user?.user_id,
      atribuida_a: selectedUser.id,
      titulo, descricao: descricao || "",
      data_entrega: dataEntregaSQL, hora_entrega: horaEntrega || "09:00"
    };
    try {
      const res = await fetch(getApiUrl('create_task'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'sucesso') {
        Alert.alert("Sucesso", "Tarefa criada!");
        setModalCreate(false); setTitulo(''); setDescricao(''); setDataEntrega(''); setHoraEntrega('09:00');
        fetchDashboardData(user.id || user.user_id, user.role, user.departamento_id);
      } else {
        Alert.alert("Erro", data.mensagem || data.message || "Não foi possível criar a tarefa.");
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 95 : 0}
          style={[styles.overlay, isMobile && styles.overlayMobile]}
        >
          <View style={[styles.modal, isMobile && styles.modalMobile, isMobile && { maxHeight: Math.max(420, height - 32) }]}>
            <View style={[styles.modalHeader, isMobile && styles.modalHeaderMobile]}>
              <Text style={[styles.modalTitle, { fontSize: modalTitleSize }]}>Atribuir Tarefa</Text>
              <TouchableOpacity onPress={() => setModalCreate(false)}><X size={24} color="#94A3B8" /></TouchableOpacity>
            </View>
            <ScrollView
              style={[styles.modalBody, isMobile && styles.modalBodyMobile]}
              contentContainerStyle={[styles.modalBodyContent, isMobile && styles.modalBodyContentMobile]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

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
              <TextInput
                style={styles.textInput}
                placeholder="Título da tarefa"
                placeholderTextColor="#000000"
                value={titulo}
                onChangeText={setTitulo}
                returnKeyType="next"
              />
            </View>

            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Descrição da tarefa (opcional)"
                placeholderTextColor="#64748b"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                textAlignVertical="top"
                numberOfLines={4}
                returnKeyType="next"
              />
            </View>

            <View style={[styles.dateTimeGrid, isMobile && styles.dateTimeGridMobile]}>
              <View style={[styles.dateTimeField, !isMobile && styles.dateTimeFieldLeft, isMobile && styles.dateTimeFieldMobile]}>
                <Text style={styles.fieldLabel}>DATA</Text>
                <View style={styles.dateTimeControl}>
                  <CalendarIcon size={20} color="#64748B" style={styles.inputIcon}/>
                  <TextInput
                    style={styles.dateTimeTextInput}
                    placeholder="DD-MM-AAAA"
                    placeholderTextColor="#000000"
                    value={dataEntrega}
                    onChangeText={(t) => setDataEntrega(formatarDataEntrega(t))}
                    keyboardType="numeric"
                    maxLength={10}
                    allowFontScaling={false}
                    returnKeyType="next"
                  />
                </View>
              </View>
              <View style={[styles.dateTimeField, isMobile && styles.dateTimeFieldMobile]}>    
                <Text style={styles.fieldLabel}>HORA</Text>
                <View style={styles.dateTimeControl}>
                  <Clock3 size={20} color="#64748B" style={styles.inputIcon}/>
                  <TextInput
                    style={styles.dateTimeTextInput}
                    placeholder="HH:MM"
                    placeholderTextColor="#000000"
                    value={horaEntrega}
                    onChangeText={(t) => setHoraEntrega(formatarHoraSQL(t))}
                    keyboardType="numeric"
                    maxLength={5}
                    allowFontScaling={false}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTask}>
              <Text style={styles.saveBtnText}>Criar Tarefa</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  greeting: { fontSize: 36, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subGreeting: { fontSize: 15, color: '#64748b', marginTop: 6, fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 13 },
  addBtn: { backgroundColor: '#1e40af', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 9, gap: 10, elevation: 2, shadowColor: '#1e40af', shadowOpacity: 0.25, shadowRadius: 8 },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#e2e8f0', gap: 8 },
  exportText: { color: '#64748b', fontWeight: '700', fontSize: 13 },
  kpiRow: { flexDirection: 'row', gap: 18, marginBottom: 32 },
  kpiCard: { flex: 1, backgroundColor: 'white', padding: 24, borderRadius: 12, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  kpiTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kpiLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 },
  kpiValue: { fontSize: 40, fontWeight: '800', color: '#0f172a', letterSpacing: -0.8 },
  bottomGrid: { flexDirection: 'row', gap: 28 },
  gridColumn: { flex: 1 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 18, letterSpacing: -0.3 },
  alertCard: { backgroundColor: '#fef2f2', padding: 18, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 13, borderLeftWidth: 4, borderLeftColor: '#dc2626' },
  alertDesc: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  alertDate: { fontSize: 12, color: '#dc2626', marginTop: 3, fontWeight: '600' },
  favCard: { backgroundColor: 'white', padding: 22, borderRadius: 10, marginBottom: 13, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
  favTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 14, letterSpacing: -0.2 },
  favProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  favBarBg: { flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  favBarFill: { height: '100%', backgroundColor: '#1e40af' },
  favPercent: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  overlayMobile: { justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 16 },
  modal: { backgroundColor: 'white', width: '100%', maxWidth: 520, padding: 32, borderRadius: 16, elevation: 8, maxHeight: '90%' },
  modalMobile: { width: '100%', padding: 18, borderRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalHeaderMobile: { marginBottom: 18 },
  modalBody: { width: '100%', minHeight: 0 },
  modalBodyMobile: { flexGrow: 0, flexShrink: 1 },
  modalBodyContent: { paddingBottom: 28 },
  modalBodyContentMobile: { paddingBottom: 18 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 11, letterSpacing: 0.4, textTransform: 'uppercase' },
  userChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f8fafc', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  userChipActive: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  userChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 9, borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 16, minHeight: 58, paddingHorizontal: 14 },
  inputIcon: { marginLeft: 12 },
  textInput: { flex: 1, fontSize: 15, color: '#000000', minHeight: 56, fontWeight: '500' },
  textAreaWrapper: { backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', padding: 14, marginBottom: 16 },
  textAreaInput: { minHeight: 92, fontSize: 15, color: '#0f172a', fontWeight: '500' },
  dateTimeGrid: { flexDirection: 'row', marginBottom: 18, gap: 14, flexWrap: 'wrap' },
  dateTimeGridMobile: { flexDirection: 'column', marginBottom: 14, gap: 14, flexWrap: 'nowrap' },
  dateTimeField: { flex: 1, minWidth: 0 },
  dateTimeFieldLeft: { marginRight: 12 },
  dateTimeFieldMobile: { width: '100%', minWidth: 0, marginRight: 0, marginBottom: 0, flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 7, letterSpacing: 0.4 },
  dateTimeControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 9, borderWidth: 1.5, borderColor: '#e2e8f0', minHeight: 58, width: '100%', overflow: 'hidden' },
  dateTimeTextInput: { flex: 1, minWidth: 0, paddingHorizontal: 12, fontSize: 15, color: '#000000', minHeight: 56, fontWeight: '600' },
  saveBtn: { backgroundColor: '#1e40af', padding: 16, borderRadius: 9, alignItems: 'center', marginTop: 8, elevation: 2, shadowColor: '#1e40af', shadowOpacity: 0.25, shadowRadius: 8 },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 },
  emptyCard: { padding: 28, backgroundColor: '#fafbfc', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' }
});
