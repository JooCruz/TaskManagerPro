import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { ShieldAlert, UserPlus, Building, Mail, Lock, User, Briefcase, UserCheck, ChevronDown, Layers } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../../config/environment';

export default function AdminPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Responsive font sizes
  const titleSize = isMobile ? 22 : 32;
  const sectionTitleSize = isMobile ? 18 : 22;

  const [loading, setLoading] = useState(true);
  
  // Dados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('user'); 
  
  // Estados para as EMPRESAS
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaId, setEmpresaId] = useState(''); 
  const [empresaNome, setEmpresaNome] = useState('A carregar empresas...');
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);

  // Estados para os DEPARTAMENTOS
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [departamentoId, setDepartamentoId] = useState(''); 
  const [departamentoNome, setDepartamentoNome] = useState('Selecione uma empresa primeiro');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const verificarPermissoes = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          Alert.alert("Acesso Negado", "Apenas administradores podem aceder a esta área.");
          router.replace('/(tabs)/explore');
          return;
        }
        
        // Carrega a lista de empresas logo que a página abre
        fetchEmpresas();
      } else {
        router.replace('/');
      }
    };
    verificarPermissoes();
  }, []);



  // Buscar Empresas
  const fetchEmpresas = async () => {
    try {
      const res = await fetch(getApiUrl('get_empresas'));
      const data = await res.json();
      
      if (data.status === 'sucesso') {
        setEmpresas(data.empresas);
        if (data.empresas.length > 0) {
          const primeiraEmpresa = data.empresas[0];
          setEmpresaId(primeiraEmpresa.id.toString());
          setEmpresaNome(primeiraEmpresa.nome);
          // Assim que sabe qual é a empresa, vai buscar os departamentos dela
          fetchDepartamentos(primeiraEmpresa.id.toString());
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar empresas", error);
      setLoading(false);
    }
  };

  // Buscar Departamentos da Empresa escolhida
  const fetchDepartamentos = async (idEmpresa: string) => {
    setDepartamentoNome('A carregar...');
    try {
      const res = await fetch(getApiUrl(`get_departamentos?empresa_id=${idEmpresa}`));
      const data = await res.json();
      
      if (data.status === 'sucesso') {
        setDepartamentos(data.departamentos);
        if (data.departamentos.length > 0) {
          setDepartamentoId(data.departamentos[0].id.toString());
          setDepartamentoNome(data.departamentos[0].nome);
        } else {
          setDepartamentoId('');
          setDepartamentoNome('Nenhum departamento encontrado');
        }
      }
    } catch (error) {
      console.error("Erro ao carregar departamentos", error);
    }
  };

  // Quando o Admin clica noutra empresa na lista
  const handleSelecionarEmpresa = (emp: any) => {
    setEmpresaId(emp.id.toString());
    setEmpresaNome(emp.nome);
    setShowEmpresaDropdown(false);
    // Vai buscar os departamentos da NOVA empresa selecionada
    fetchDepartamentos(emp.id.toString());
  };

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    if (Platform.OS === 'web') alert(`${titulo}\n\n${mensagem}`);
    else Alert.alert(titulo, mensagem);
  };

  const handleCriarUtilizador = async () => {
    if (!nome || !email || !senha || !empresaId || !departamentoId) {
      mostrarAlerta("Aviso", "Por favor, preencha todos os campos e selecione Empresa e Departamento.");
      return;
    }

    try {
      const res = await fetch(getApiUrl('admin_create_user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome, 
          email, 
          senha, 
          role, 
          empresa_id: empresaId, 
          departamento_id: departamentoId 
        })
      });
      
      const data = await res.json();

      if (data.status === 'sucesso') {
        mostrarAlerta("✅ Sucesso", data.mensagem);
        setNome(''); setEmail(''); setSenha(''); setRole('user');
      } else {
        mostrarAlerta("❌ Erro", data.mensagem);
      }
    } catch (error) {
      mostrarAlerta("Erro de Ligação", "Falha ao conectar com o servidor.");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: isMobile ? 20 : 30, paddingBottom: 50 }}>
      
      <View style={styles.header}>
        <View style={[styles.titleRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <View style={styles.iconWrapper}>
            <ShieldAlert size={28} color="#2563eb" />
          </View>
          <View style={{ flex: 1, flexShrink: 1 }}>
            <Text style={[styles.title, { fontSize: titleSize }]}>Painel Super Admin</Text>
            <Text style={styles.subtitle}>Gerir contas e empresas de todo o sistema</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, isMobile && { padding: 20 }]}>
        <View style={styles.cardHeader}>
          <UserPlus size={20} color="#1e293b" />
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Novo Utilizador SaaS</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Cria contas e atribui a uma empresa cliente específica.</Text>

        <View style={styles.formGrid}>
          {/* O NOVO DROPDOWN DE EMPRESAS */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Empresa Cliente</Text>
            <TouchableOpacity 
              style={[styles.inputWrapper, { justifyContent: 'space-between', paddingRight: 15 }]} 
              onPress={() => setShowEmpresaDropdown(!showEmpresaDropdown)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Building size={18} color="#64748b" style={styles.inputIcon} />
                <Text style={{ fontSize: 15, color: '#1e293b' }}>{empresaNome}</Text>
              </View>
              <ChevronDown size={18} color="#64748b" />
            </TouchableOpacity>

            {showEmpresaDropdown && (
              <View style={styles.dropdownList}>
                {empresas.map((emp: any) => (
                  <TouchableOpacity 
                    key={emp.id} 
                    style={styles.dropdownItem}
                    onPress={() => handleSelecionarEmpresa(emp)}
                  >
                    <Text style={styles.dropdownItemText}>{emp.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* O DROPDOWN DE DEPARTAMENTOS */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Departamento da Empresa</Text>
            <TouchableOpacity 
              style={[styles.inputWrapper, { justifyContent: 'space-between', paddingRight: 15, backgroundColor: !departamentoId ? '#f1f5f9' : '#f8fafc' }]} 
              onPress={() => departamentos.length > 0 && setShowDropdown(!showDropdown)}
              activeOpacity={0.7}
              disabled={departamentos.length === 0}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Layers size={18} color="#64748b" style={styles.inputIcon} />
                <Text style={{ fontSize: 15, color: !departamentoId ? '#94a3b8' : '#1e293b' }}>{departamentoNome}</Text>
              </View>
              {departamentos.length > 0 && <ChevronDown size={18} color="#64748b" />}
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownList}>
                {departamentos.map((dep: any) => (
                  <TouchableOpacity 
                    key={dep.id} 
                    style={styles.dropdownItem}
                    onPress={() => {
                      setDepartamentoId(dep.id.toString());
                      setDepartamentoNome(dep.nome);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{dep.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: João Costa" placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Profissional</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="joao@empresa.com" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#94a3b8" />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password Provisória</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry placeholderTextColor="#94a3b8" />
            </View>
          </View>

        </View>

        <Text style={styles.label}>Função no Sistema</Text>
        <View style={[styles.roleContainer, isMobile && { flexDirection: 'column', gap: 12 }]}>
          <TouchableOpacity 
            style={[styles.roleCard, role === 'manager' && styles.roleCardActive, isMobile && { width: '100%' }]} 
            onPress={() => setRole('manager')}
            activeOpacity={0.8}
          >
            <Briefcase size={24} color={role === 'manager' ? '#2563eb' : '#64748b'} />
            <View style={styles.roleTextContainer}>
              <Text style={[styles.roleTitle, role === 'manager' && styles.roleTitleActive]}>Manager</Text>
              <Text style={styles.roleDesc}>Gere a equipa e tarefas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, role === 'user' && styles.roleCardActive, isMobile && { width: '100%' }]} 
            onPress={() => setRole('user')}
            activeOpacity={0.8}
          >
            <UserCheck size={24} color={role === 'user' ? '#10b981' : '#64748b'} />
            <View style={styles.roleTextContainer}>
              <Text style={[styles.roleTitle, role === 'user' && {color: '#10b981'}]}>Funcionário</Text>
              <Text style={styles.roleDesc}>Executa as tarefas</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.saveBtn, isMobile && { width: '100%' }]} onPress={handleCriarUtilizador} activeOpacity={0.9}>
          <UserPlus size={20} color="white" />
          <Text style={styles.saveBtnText}>Registar Utilizador</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fafbfc' },
  header: { marginBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrapper: { backgroundColor: '#dbeafe', padding: 13, borderRadius: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 4, fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 26, fontWeight: '500' },
  formGrid: { marginBottom: 12 },
  inputContainer: { marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 9, textTransform: 'uppercase', letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 9, height: 48 },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#0f172a', fontWeight: '500' }, 
  dropdownList: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 9, marginTop: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 15, color: '#1e293b', paddingLeft: 8, fontWeight: '500' },
  roleContainer: { flexDirection: 'row', gap: 13, marginBottom: 30 },
  roleCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, gap: 12 },
  roleCardActive: { backgroundColor: '#dbeafe', borderColor: '#93c5fd', elevation: 2, shadowColor: '#1e40af', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
  roleTextContainer: { flex: 1 },
  roleTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 3 },
  roleTitleActive: { color: '#1e40af' },
  roleDesc: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#1e40af', height: 50, borderRadius: 9, justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#1e40af', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4, marginBottom: 10 },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }
});
