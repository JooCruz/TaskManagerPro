import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, useWindowDimensions } from 'react-native';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/environment';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        const savedPassword = await AsyncStorage.getItem('saved_password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Erro ao carregar credenciais', error);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Aviso', 'Preenche os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getApiUrl('login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const text = await res.text(); 
      try {
        const data = JSON.parse(text);
        if (data.status === 'sucesso') {
          await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
          
          // Guardar ou remover credenciais
          if (rememberMe) {
            await AsyncStorage.setItem('saved_email', email);
            await AsyncStorage.setItem('saved_password', password);
          } else {
            await AsyncStorage.removeItem('saved_email');
            await AsyncStorage.removeItem('saved_password');
          }
          
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

            <View style={styles.rememberMeContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && <Check size={16} color="white" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                <Text style={styles.rememberMeText}>Lembrar-me</Text>
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
  pageWrapper: { flex: 1, backgroundColor: '#fafbfc', maxWidth: '100%', overflow: 'hidden' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginCard: { backgroundColor: 'white', width: '100%', maxWidth: 480, padding: 45, borderRadius: 20, elevation: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, borderWidth: 1, borderColor: '#e2e8f0' },
  loginCardMobile: { padding: 30, borderRadius: 18 },
  header: { alignItems: 'center', marginBottom: 35 },
  logoCircle: { width: 80, height: 80, backgroundColor: '#dbeafe', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#64748b', marginTop: 8, fontWeight: '500' },
  form: { width: '100%' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 18, height: 50 },
  input: { flex: 1, paddingHorizontal: 16, fontSize: 15, color: '#1e293b', height: '100%', fontWeight: '500' },
  
  // CHECKBOX E LEMBRAR-ME
  rememberMeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#cbd5e1', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  rememberMeText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  
  loginBtn: { backgroundColor: '#1e40af', flexDirection: 'row', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12, elevation: 4, shadowColor: '#1e40af', shadowOpacity: 0.3, shadowRadius: 8 },
  loginBtnText: { color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },
  
  // NOVOS ESTILOS PARA OS LINKS
  loginFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 30 },
  footerLink: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  footerDivider: { color: '#cbd5e1', fontSize: 13 }
});
