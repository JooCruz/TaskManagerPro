import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { Building, PlusCircle } from 'lucide-react-native';
import { getApiUrl } from '@/config/environment';

export default function CreateEmpresaPage() {
  const [nome, setNome] = useState('');



  const handleCriar = async () => {
    if (!nome) return Alert.alert("Aviso", "Preencha o nome da empresa.");
    try {
      const res = await fetch(getApiUrl('create_empresa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      const data = await res.json();
      if (data.status === 'sucesso') {
        if (Platform.OS === 'web') alert(data.mensagem); else Alert.alert("Sucesso", data.mensagem);
        setNome('');
      } else {
        if (Platform.OS === 'web') alert(data.mensagem); else Alert.alert("Erro", data.mensagem);
      }
    } catch (error) {
      if (Platform.OS === 'web') alert("Erro de ligação"); else Alert.alert("Erro de Ligação", "Falha no servidor.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 30 }}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrapper}><Building size={28} color="#2563eb" /></View>
          <View><Text style={styles.title}>Nova Empresa Cliente</Text><Text style={styles.subtitle}>Adiciona um novo cliente ao teu SaaS</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nome da Empresa</Text>
        <View style={styles.inputWrapper}>
          <Building size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Tech Solutions Lda" placeholderTextColor="#94a3b8" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleCriar}>
          <PlusCircle size={20} color="white" />
          <Text style={styles.saveBtnText}>Registar Empresa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { marginBottom: 30 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconWrapper: { backgroundColor: '#e0e7ff', padding: 12, borderRadius: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 50, marginBottom: 25 },
  inputIcon: { paddingHorizontal: 15 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#1e293b' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#2563eb', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
