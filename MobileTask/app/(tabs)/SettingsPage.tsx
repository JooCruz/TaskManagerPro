import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, useWindowDimensions } from 'react-native';
import { User, Mail, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config/environment';

export default function SettingsPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Responsive font sizes
  const titleSize = isMobile ? 22 : 32;
  const sectionTitleSize = isMobile ? 16 : 20;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [emailOriginal, setEmailOriginal] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setNome(user.nome || '');
        setRole(user.role || 'Usuário Padrão');
        
        if (user.email) {
            setEmail(user.email);
            setEmailOriginal(user.email);
        }
      }
    };
    loadUserData();
  }, []);



  const mostrarAlerta = (titulo: string, mensagem: string) => {
    if (Platform.OS === 'web') alert(`${titulo}\n\n${mensagem}`);
    else Alert.alert(titulo, mensagem);
  };

  const handleUpdateProfile = async () => {
    if (!nome.trim() || !email.trim()) {
      mostrarAlerta("Aviso", "O nome e o email não podem estar vazios.");
      return;
    }

    try {
      const res = await fetch(getApiUrl('update_profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_atual: emailOriginal, novo_nome: nome, novo_email: email })
      });
      const data = await res.json();

      if (data.status === 'sucesso') {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          user.nome = nome;
          user.email = email;
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
        }
        setEmailOriginal(email); 
        mostrarAlerta("Sucesso", "Perfil atualizado com sucesso!");
      } else {
        mostrarAlerta("Erro", data.mensagem);
      }
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro", "Falha ao conectar com o servidor.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      mostrarAlerta("Aviso", "Preencha todos os campos de senha.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      mostrarAlerta("Aviso", "A nova senha e a confirmação não coincidem.");
      return;
    }

    try {
      const res = await fetch(getApiUrl('update_password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOriginal, senha_atual: senhaAtual, nova_senha: novaSenha })
      });
      const data = await res.json();

      if (data.status === 'sucesso') {
        setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
        mostrarAlerta("Sucesso", "Senha alterada com sucesso!");
      } else {
        mostrarAlerta("Erro", data.mensagem);
      }
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro", "Falha ao conectar com o servidor.");
    }
  };

  const initial = nome ? nome.charAt(0).toUpperCase() : 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: isMobile ? 20 : 25, paddingBottom: 50 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: titleSize }]}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie suas informações pessoais e preferências</Text>
      </View>

      <View style={[styles.card, isMobile && { padding: 20 }]}> 
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Informações do Perfil</Text>
        <Text style={styles.sectionSubtitle}>Atualize suas informações pessoais</Text>

        <View style={[styles.avatarRow, isMobile && styles.avatarRowMobile]}>
          <View style={styles.avatarCircle}><Text style={styles.avatarText}>{initial}</Text></View>
          <View>
            <Text style={styles.roleLabel}>Função</Text>
            <Text style={styles.roleValue}>{role}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}><User size={16} color="#475569" /><Text style={styles.label}>Nome Completo</Text></View>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Seu nome" />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}><Mail size={16} color="#475569" /><Text style={styles.label}>Email</Text></View>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
          <Text style={styles.saveBtnText}>Salvar Alterações</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isMobile && { padding: 20 }]}> 
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Segurança</Text>
        <Text style={styles.sectionSubtitle}>Altere sua senha para manter sua conta segura</Text>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}><Lock size={16} color="#475569" /><Text style={styles.label}>Senha Atual</Text></View>
          <TextInput style={styles.input} value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry placeholder="••••••••" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nova Senha</Text>
          <TextInput style={styles.input} value={novaSenha} onChangeText={setNovaSenha} secureTextEntry placeholder="••••••••" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry placeholder="••••••••" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword}>
          <Text style={styles.saveBtnText}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isMobile && { padding: 20 }]}> 
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Informações da Conta</Text>
        <Text style={styles.sectionSubtitle}>Detalhes sobre sua conta no sistema</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Tipo de Conta</Text><Text style={styles.infoValue}>{role}</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafbfc' },
  header: { marginBottom: 28 },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 6, fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 18, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 22, marginTop: 5, fontWeight: '500' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 26 },
  avatarRowMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  avatarText: { color: 'white', fontSize: 28, fontWeight: '800' },
  roleLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: '600' },
  roleValue: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 3 },
  inputGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', height: 48, borderRadius: 9, paddingHorizontal: 15, fontSize: 15, color: '#0f172a', borderWidth: 1.5, borderColor: '#e2e8f0', fontWeight: '500' },
  saveBtn: { backgroundColor: '#1e40af', height: 48, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginTop: 12, elevation: 2, shadowColor: '#1e40af', shadowOpacity: 0.25, shadowRadius: 8 },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  infoLabel: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  infoValue: { color: '#0f172a', fontSize: 14, fontWeight: '700' }
});
