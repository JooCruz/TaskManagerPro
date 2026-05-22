import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { Layers, PlusCircle, Building, ChevronDown } from 'lucide-react-native';

export default function CreateDepartamentoPage() {
  const [nome, setNome] = useState('');
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaId, setEmpresaId] = useState(''); 
  const [empresaNome, setEmpresaNome] = useState('A carregar...');
  const [showDropdown, setShowDropdown] = useState(false);



  useEffect(() => { fetchEmpresas(); }, []);

  const fetchEmpresas = async () => {
    try {
      const res = await fetch(getApiUrl('get_empresas'));
      const data = await res.json();
      if (data.status === 'sucesso' && data.empresas.length > 0) {
        setEmpresas(data.empresas);
        setEmpresaId(data.empresas[0].id.toString());
        setEmpresaNome(data.empresas[0].nome);
      } else {
        setEmpresaNome('Nenhuma empresa encontrada');
      }
    } catch (e) { console.error(e); }
  };

  const handleCriar = async () => {
    if (!nome || !empresaId) return Alert.alert("Aviso", "Preencha o nome e escolha a empresa.");
    try {
      const res = await fetch(getApiUrl('create_departamento'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, empresa_id: empresaId })
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
          <View style={styles.iconWrapper}><Layers size={28} color="#2563eb" /></View>
          <View><Text style={styles.title}>Novo Departamento</Text><Text style={styles.subtitle}>Cria equipas dentro das empresas</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pertence à Empresa</Text>
        <TouchableOpacity style={[styles.inputWrapper, { justifyContent: 'space-between', paddingRight: 15 }]} onPress={() => setShowDropdown(!showDropdown)} activeOpacity={0.7}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Building size={18} color="#64748b" style={styles.inputIcon} />
            <Text style={{ fontSize: 15, color: '#1e293b' }}>{empresaNome}</Text>
          </View>
          <ChevronDown size={18} color="#64748b" />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {empresas.map((emp) => (
              <TouchableOpacity key={emp.id} style={styles.dropdownItem} onPress={() => { setEmpresaId(emp.id.toString()); setEmpresaNome(emp.nome); setShowDropdown(false); }}>
                <Text style={styles.dropdownItemText}>{emp.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.label, { marginTop: 15 }]}>Nome do Departamento (Equipa)</Text>
        <View style={styles.inputWrapper}>
          <Layers size={18} color="#64748b" style={styles.inputIcon} />
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Recursos Humanos" placeholderTextColor="#94a3b8" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleCriar}>
          <PlusCircle size={20} color="white" />
          <Text style={styles.saveBtnText}>Registar Departamento</Text>
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
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 50, marginBottom: 10 },
  inputIcon: { paddingHorizontal: 15 },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#1e293b' },
  dropdownList: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 15, color: '#1e293b', paddingLeft: 10 },
  saveBtn: { flexDirection: 'row', backgroundColor: '#2563eb', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
