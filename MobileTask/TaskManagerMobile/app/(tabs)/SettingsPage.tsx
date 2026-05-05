import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { User, Mail, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsPage() {
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

  const getUrl = (endpoint: string) => {
    return Platform.OS === 'web' 
      ? `http://localhost/taskmanager_api/${endpoint}` 
      : `http://172.20.10.5/taskmanager_api/${endpoint}`;
  };

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
      const res = await fetch(getUrl('update_profile.php'), {
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
      const res = await fetch(getUrl('update_password.php'), {
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 25, paddingBottom: 50 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie suas informações pessoais e preferências</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informações do Perfil</Text>
        <Text style={styles.sectionSubtitle}>Atualize suas informações pessoais</Text>

        <View style={styles.avatarRow}>
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Segurança</Text>
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

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        <Text style={styles.sectionSubtitle}>Detalhes sobre sua conta no sistema</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Tipo de Conta</Text><Text style={styles.infoValue}>{role}</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20, marginTop: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  roleLabel: { fontSize: 12, color: '#64748b' },
  roleValue: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  inputGroup: { marginBottom: 15 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', height: 48, borderRadius: 8, paddingHorizontal: 15, fontSize: 15, color: '#1e293b' },
  saveBtn: { backgroundColor: '#2563eb', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { color: '#64748b', fontSize: 14 },
  infoValue: { color: '#1e293b', fontSize: 14, fontWeight: '500' }
});