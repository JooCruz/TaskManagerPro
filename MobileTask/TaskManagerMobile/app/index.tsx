import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Platform, Alert, KeyboardAvoidingView, Image, Pressable, ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Carrega os dados se o "Lembrar-me" foi ativado antes
  useEffect(() => {
    const checkRememberedUser = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('remembered_email');
        const savedPassword = await AsyncStorage.getItem('remembered_password');
        
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Erro ao carregar dados salvos', error);
      }
    };
    checkRememberedUser();
  }, []);

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleLogin = async () => {
    if (email === '' || password === '') {
      mostrarAlerta('Aviso', 'Por favor, preencha o seu e-mail e password.');
      return;
    }
    
    try {
      const url = Platform.OS === 'web' 
        ? 'http://localhost/taskmanager_api/login.php' 
        : 'http://172.20.10.5/taskmanager_api/login.php';
        
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === 'sucesso') {
        
        // ==========================================
        // GUARDA A SESSÃO COM AS NOVAS IDS DA EMPRESA E O ID DO USER
        // ==========================================
        await AsyncStorage.setItem('user_data', JSON.stringify({
          id: data.id || data.user_id,          // <--- A PEÇA QUE FALTAVA!!!
          nome: data.nome || data.mensagem,
          role: data.role || data.tipo_usuario || 'user',
          email: email,
          empresa_id: data.empresa_id,
          departamento_id: data.departamento_id
        }));

        if (rememberMe) {
          await AsyncStorage.setItem('remembered_email', email);
          await AsyncStorage.setItem('remembered_password', password);
        } else {
          await AsyncStorage.removeItem('remembered_email');
          await AsyncStorage.removeItem('remembered_password');
        }

        mostrarAlerta('✅ Sucesso!', "Bem-vindo, " + (data.nome || data.mensagem));
        
        // Redireciona para o painel principal
        router.replace('/(tabs)/explore'); 

      } else {
        mostrarAlerta('❌ Erro', data.mensagem);
      }
    } catch (error) {
      console.error(error);
      mostrarAlerta('Erro de Ligação', 'Não foi possível contactar o servidor.');
    }
  };

  return (
    <LinearGradient colors={['#3182CE', '#E5F0FF', '#FFFFFF']} style={styles.background}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Image 
              source={require('../assets/images/logo.jpg')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>TaskManagerPro</Text>
                <Text style={styles.subtitle}>Acesso ao painel de gestão</Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="exemplo@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#3182CE" />
                  </TouchableOpacity>
                </View>

                <View style={styles.rememberRow}>
                  <Pressable style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                    <MaterialCommunityIcons 
                      name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                      size={24} 
                      color="#3182CE" 
                    />
                    <Text style={styles.rememberText}>Lembrar-me</Text>
                  </Pressable>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Entrar na Conta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  container: { alignItems: 'center', width: '100%', maxWidth: 400, alignSelf: 'center' },
  logoImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 20, padding: 30, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  header: { alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 26, fontWeight: '800', color: '#2D3748' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 5 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  input: { backgroundColor: '#F7FAFC', height: 50, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', color: '#2D3748' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15, paddingRight: 10 },
  passwordInput: { flex: 1, height: 50, paddingHorizontal: 15, color: '#2D3748' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rememberText: { fontSize: 14, color: '#4A5568', fontWeight: '500' },
  button: { backgroundColor: '#3182CE', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});