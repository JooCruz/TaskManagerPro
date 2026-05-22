import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Users, Building, Layers, Mail, Briefcase, ShieldAlert } from 'lucide-react-native';
import { getApiUrl } from '@/config/environment';

export default function UsersListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(getApiUrl('get_users'));
      const data = await res.json();
      if (data.status === 'sucesso') {
        setUsers(data.users);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar utilizadores", error);
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}><ShieldAlert size={12} color="#ef4444" /><Text style={[styles.badgeText, { color: '#ef4444' }]}>Admin</Text></View>;
    if (role === 'manager') return <View style={[styles.badge, { backgroundColor: '#e0e7ff' }]}><Briefcase size={12} color="#4f46e5" /><Text style={[styles.badgeText, { color: '#4f46e5' }]}>Manager</Text></View>;
    return <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}><Text style={[styles.badgeText, { color: '#10b981' }]}>User</Text></View>;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 30 }}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrapper}><Users size={28} color="#2563eb" /></View>
          <View>
            <Text style={styles.title}>Diretório de Utilizadores</Text>
            <Text style={styles.subtitle}>Todos os membros registados no SaaS</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {users.map((u) => (
          <View key={u.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{u.nome.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.nome}</Text>
                <View style={styles.emailRow}>
                  <Mail size={12} color="#64748b" />
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
              </View>
              {getRoleBadge(u.role)}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailsRow}>
              <Building size={16} color="#94a3b8" />
              <Text style={styles.detailsText}>{u.empresa_nome || 'Sem Empresa'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Layers size={16} color="#94a3b8" />
              <Text style={styles.detailsText}>{u.departamento_nome || 'Sem Departamento'}</Text>
            </View>
          </View>
        ))}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, minWidth: 300, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  userEmail: { fontSize: 13, color: '#64748b' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  detailsText: { fontSize: 14, color: '#475569' }
});
