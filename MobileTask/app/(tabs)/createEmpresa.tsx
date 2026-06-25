import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Building, PlusCircle } from 'lucide-react-native';
import { apiFetch } from '../../config/environment';

export default function CreateEmpresaPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Responsive font sizes
  const titleSize = isMobile ? 22 : 28;

  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCriar = async () => {
    if (!nome) return Alert.alert("Aviso", "Preencha o nome da empresa.");
    
    setLoading(true);
    try {
      const data = await apiFetch('create_empresa', {
        method: 'POST',
        body: JSON.stringify({ nome })
      });
      
      if (data.status === 'sucesso') {
        if (Platform.OS === 'web') alert(data.mensagem); 
        else Alert.alert("✅ Sucesso", data.mensagem);
        setNome('');
      } else {
        if (Platform.OS === 'web') alert(data.mensagem); 
        else Alert.alert("❌ Erro", data.mensagem);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar empresa:', message);
      if (Platform.OS === 'web') alert(`Erro: ${message}`); 
      else Alert.alert("❌ Erro de Ligação", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: isMobile ? 20 : 30 }}>
      <View style={styles.header}>
        <View style={[styles.titleRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <View style={styles.iconWrapper}><Building size={28} color="#2563eb" /></View>
          <View style={{ flex: 1, flexShrink: 1 }}><Text style={[styles.title, { fontSize: titleSize }]}>Nova Empresa Cliente</Text><Text style={styles.subtitle}>Adiciona um novo cliente ao teu SaaS</Text></View>
        </View>
      </View>

      <View style={[styles.card, isMobile && { padding: 20 }]}>
        <Text style={styles.label}>Nome da Empresa</Text>
        <View style={styles.inputWrapper}>
          <Building size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Tech Solutions Lda" placeholderTextColor="#94a3b8" />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled, isMobile && { width: '100%' }]} 
          onPress={handleCriar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <PlusCircle size={20} color="white" />
              <Text style={styles.saveBtnText}>Registar Empresa</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafbfc' },
  header: { marginBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrapper: { backgroundColor: '#dbeafe', padding: 13, borderRadius: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 9, height: 48, marginBottom: 26 },
  inputIcon: { paddingHorizontal: 14 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#0f172a', fontWeight: '500' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#1e40af', height: 50, borderRadius: 9, justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 2, shadowColor: '#1e40af', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
  saveBtnDisabled: { backgroundColor: '#94a3b8', opacity: 0.6 },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }
});
