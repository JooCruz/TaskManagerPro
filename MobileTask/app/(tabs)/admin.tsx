import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { ShieldAlert, UserPlus, Building, Mail, Lock, User, Briefcase, UserCheck, ChevronDown, Layers } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AdminPage() {
  const router = useRouter();
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

  const getUrl = (endpoint: string) => {
    return Platform.OS === 'web' 
      ? `http://localhost/taskmanager_api/${endpoint}` 
      : `http://172.20.10.5/taskmanager_api/${endpoint}`;
  };

  // Buscar Empresas
  const fetchEmpresas = async () => {
    try {
      const res = await fetch(getUrl(`get_empresas.php`));
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
      const res = await fetch(getUrl(`get_departamentos.php?empresa_id=${idEmpresa}`));
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
      const res = await fetch(getUrl('admin_create_user.php'), {
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 30, paddingBottom: 50 }}>
      
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrapper}>
            <ShieldAlert size={28} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.title}>Painel Super Admin</Text>
            <Text style={styles.subtitle}>Gerir contas e empresas de todo o sistema</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <UserPlus size={20} color="#1e293b" />
          <Text style={styles.sectionTitle}>Novo Utilizador SaaS</Text>
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
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleCard, role === 'manager' && styles.roleCardActive]} 
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
            style={[styles.roleCard, role === 'user' && styles.roleCardActive]} 
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

        <TouchableOpacity style={styles.saveBtn} onPress={handleCriarUtilizador} activeOpacity={0.9}>
          <UserPlus size={20} color="white" />
          <Text style={styles.saveBtnText}>Registar Utilizador</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { marginBottom: 30 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconWrapper: { backgroundColor: '#e0e7ff', padding: 12, borderRadius: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  sectionSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 25 },
  formGrid: { marginBottom: 10 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 50 },
  inputIcon: { paddingHorizontal: 15 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#1e293b' }, 
  dropdownList: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginTop: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 15, color: '#1e293b', paddingLeft: 10 },
  roleContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  roleCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, gap: 12 },
  roleCardActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  roleTextContainer: { flex: 1 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: '#64748b', marginBottom: 2 },
  roleTitleActive: { color: '#2563eb' },
  roleDesc: { fontSize: 11, color: '#94a3b8' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#2563eb', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});