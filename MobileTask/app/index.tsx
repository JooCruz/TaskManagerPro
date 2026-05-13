import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, useWindowDimensions } from 'react-native';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getUrl = (endpoint: string) => isWeb 
    ? `http://localhost/taskmanager_api/${endpoint}` 
    : `http://172.20.10.5/taskmanager_api/${endpoint}`;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preenche os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getUrl('login.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const text = await res.text(); 
      try {
        const data = JSON.parse(text);
        if (data.status === 'sucesso') {
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
          router.replace('/(tabs)/explore');
        } else {
          Alert.alert('Erro', data.mensagem);
        }
      } catch (e) {
        Alert.alert('Erro no Servidor', 'O servidor enviou uma resposta inválida.');
      }
    } catch (error) {
      Alert.alert('Erro de Rede', 'Não foi possível ligar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.pageWrapper}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.loginCard, isMobile && styles.loginCardMobile]}>
          <View style={styles.header}>
            <View style={styles.logoCircle}><Lock size={30} color="#3B82F6" /></View>
            <Text style={styles.title}>TaskManager</Text>
            <Text style={styles.subtitle}>Painel de Acesso Profissional</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#94A3B8" style={{marginLeft: 15}} />
              <TextInput style={styles.input} placeholder="exemplo@mail.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>

            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#94A3B8" style={{marginLeft: 15}} />
              <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{padding: 15}}>
                {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <><Text style={styles.loginBtnText}>Entrar</Text><ArrowRight size={20} color="white" /></>}
            </TouchableOpacity>

            {/* LINKS DE TERMOS E PRIVACIDADE NO LUGAR DO BOTÃO LIMPAR */}
            <View style={styles.loginFooter}>
              <TouchableOpacity onPress={() => router.push('/terms')}>
                <Text style={styles.footerLink}>Termos de Uso</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>•</Text>
              <TouchableOpacity onPress={() => router.push('/privacy')}>
                <Text style={styles.footerLink}>Privacidade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: '#F1F5F9', maxWidth: '100%', overflow: 'hidden' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginCard: { backgroundColor: 'white', width: '100%', maxWidth: 450, padding: 40, borderRadius: 30, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
  loginCardMobile: { padding: 25, borderRadius: 24 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 70, height: 70, backgroundColor: '#EFF6FF', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B' },
  form: { width: '100%' },
  inputLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', marginBottom: 8, letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, height: 55 },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 15, color: '#1E293B', height: '100%' },
  loginBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  loginBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // NOVOS ESTILOS PARA OS LINKS
  loginFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 25 },
  footerLink: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  footerDivider: { color: '#E2E8F0', fontSize: 13 }
});