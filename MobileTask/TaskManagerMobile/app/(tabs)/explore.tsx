import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Bell, AlertCircle, Star, Lightbulb, CheckCircle, Clock, TrendingUp, Timer, Download } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function ExploreDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tarefas, setTarefas] = useState<any[]>([]);

  const getUrl = (endpoint: string) => isWeb ? `http://localhost/taskmanager_api/${endpoint}` : `http://172.20.10.5/taskmanager_api/${endpoint}`;

  useEffect(() => {
    const loadData = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
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

  // Cálculos de Indicadores
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const concluidas = tarefas.filter(t => t.progresso == 100);
  const pendentes = tarefas.filter(t => t.progresso < 100);
  const atrasadas = pendentes.filter(t => new Date(t.data_entrega) < hoje);
  const importantes = tarefas.filter(t => t.importante == 1 || t.importante == "1");
  const taxaProdutividade = tarefas.length > 0 ? Math.round((concluidas.length / tarefas.length) * 100) : 0;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* HEADER PRINCIPAL */}
      <View style={styles.mainHeader}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.nome} Silva! 👋</Text>
          <Text style={styles.headerSub}>Aqui está um resumo da sua produtividade</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn}>
          <Download size={18} color="#475569" />
          <Text style={styles.exportText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* LINHA DE KPIs (4 CARTÕES) */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderLeftColor: '#3b82f6' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Tarefas{"\n"}Concluídas</Text>
            <CheckCircle size={20} color="#3b82f6" />
          </View>
          <Text style={styles.kpiValue}>{concluidas.length}</Text>
          <Text style={styles.kpiSubValue}>{tarefas.length > 0 ? Math.round((concluidas.length/tarefas.length)*100) : 0}% do total</Text>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#3b82f6' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Tarefas{"\n"}Pendentes</Text>
            <Clock size={20} color="#3b82f6" />
          </View>
          <Text style={styles.kpiValue}>{pendentes.length}</Text>
          <Text style={styles.kpiSubValue}>{atrasadas.length} atrasadas</Text>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#3b82f6' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Produtividade</Text>
            <TrendingUp size={20} color="#3b82f6" />
          </View>
          <Text style={styles.kpiValue}>{taxaProdutividade}%</Text>
          <View style={styles.miniBarBg}><View style={[styles.miniBarFill, { width: `${taxaProdutividade}%` }]} /></View>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#3b82f6' }]}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Tempo{"\n"}Médio/Tarefa</Text>
            <Timer size={20} color="#3b82f6" />
          </View>
          <Text style={styles.kpiValue}>1h 15m</Text>
          <Text style={styles.kpiSubValue}>Total: 5h 0m</Text>
        </View>
      </View>

      {/* SEGUNDA SECÇÃO: ALERTAS VS IMPORTANTES */}
      <View style={styles.bottomGrid}>
        
        {/* COLUNA ALERTAS */}
        <View style={styles.gridColumn}>
          <View style={styles.sectionTitleRow}>
            <AlertCircle size={20} color="#1e3a8a" />
            <Text style={styles.sectionTitle}>Alertas e Sugestões</Text>
          </View>

          {atrasadas.map(t => (
            <View key={t.id} style={styles.alertCard}>
              <View style={styles.alertIconBg}><AlertCircle size={18} color="#ef4444" /></View>
              <View style={styles.alertBody}>
                <View style={styles.tagRow}>
                   <View style={styles.tagAtrasada}><Text style={styles.tagText}>Atrasada</Text></View>
                   <View style={styles.tagPrioridade}><Text style={styles.tagTextRed}>Alta prioridade</Text></View>
                </View>
                <Text style={styles.alertDesc}>A tarefa "{t.titulo}" está atrasada desde {t.data_entrega}</Text>
              </View>
            </View>
          ))}

          <View style={styles.suggestionCard}>
            <Lightbulb size={20} color="#3b82f6" />
            <View style={{marginLeft: 15}}>
               <View style={styles.tagSugestao}><Text style={styles.tagTextWhite}>Sugestão</Text></View>
               <Text style={styles.suggestionDesc}>Você tem {importantes.length} tarefas de alta prioridade pendentes. Considere priorizá-las.</Text>
            </View>
          </View>
        </View>

        {/* COLUNA IMPORTANTES */}
        <View style={styles.gridColumn}>
          <View style={styles.sectionTitleRow}>
            <Star size={20} color="#eab308" fill="#eab308" />
            <Text style={styles.sectionTitle}>Tarefas Importantes</Text>
          </View>

          {importantes.map(t => (
            <View key={t.id} style={styles.importantCard}>
              <View style={styles.impHeader}>
                <Star size={16} color="#eab308" fill="#eab308" />
                <Text style={styles.impTitle}>{t.titulo}</Text>
              </View>
              <Text style={styles.impDate}>Vence em {t.data_entrega}</Text>
              <View style={styles.impFooter}>
                <View style={styles.impBarBg}><View style={[styles.impBarFill, { width: `${t.progresso}%` }]} /></View>
                <Text style={styles.impPercentText}>{t.progresso}%</Text>
              </View>
            </View>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: isWeb ? 40 : 20, maxWidth: 1400, alignSelf: 'center', width: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  headerSub: { fontSize: 16, color: '#64748b', marginTop: 4 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  exportText: { fontWeight: '600', color: '#475569' },

  // KPIs
  kpiRow: { flexDirection: isWeb ? 'row' : 'column', gap: 20, marginBottom: 40 },
  kpiCard: { flex: 1, backgroundColor: 'white', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 6 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  kpiLabel: { fontSize: 14, fontWeight: '700', color: '#64748b', lineHeight: 18 },
  kpiValue: { fontSize: 32, fontWeight: '800', color: '#1e293b' },
  kpiSubValue: { fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: '500' },
  miniBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginTop: 15, overflow: 'hidden' },
  miniBarFill: { height: '100%', backgroundColor: '#2563eb' },

  // Grid Inferior
  bottomGrid: { flexDirection: isWeb ? 'row' : 'column', gap: 40 },
  gridColumn: { flex: 1 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a8a' },

  // Alertas
  alertCard: { backgroundColor: '#fff5f5', borderRadius: 20, padding: 20, flexDirection: 'row', marginBottom: 15, borderWidth: 1, borderColor: '#fed7d7', borderLeftWidth: 5, borderLeftColor: '#ef4444' },
  alertIconBg: { width: 40, height: 40, backgroundColor: 'white', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#fed7d7' },
  alertBody: { flex: 1 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tagAtrasada: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagPrioridade: { borderWidth: 1, borderColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  tagTextRed: { color: '#ef4444', fontSize: 11, fontWeight: 'bold' },
  alertDesc: { fontSize: 14, color: '#4b5563', lineHeight: 20 },

  suggestionCard: { backgroundColor: '#f0f7ff', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#dbeafe', borderLeftWidth: 5, borderLeftColor: '#3b82f6' },
  tagSugestao: { backgroundColor: '#3b82f6', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  tagTextWhite: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  suggestionDesc: { fontSize: 14, color: '#1e40af' },

  // Importantes
  importantCard: { backgroundColor: 'white', borderRadius: 20, padding: 25, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 5, borderLeftColor: '#1e3a8a' },
  impHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  impTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  impDate: { fontSize: 14, color: '#94a3b8', marginBottom: 15 },
  impFooter: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  impBarBg: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  impBarFill: { height: '100%', backgroundColor: '#2563eb' },
  impPercentText: { fontSize: 12, fontWeight: 'bold', color: '#64748b', width: 35 }
});