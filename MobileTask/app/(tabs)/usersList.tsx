import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Users, Building, Layers, Mail, Briefcase, ShieldAlert } from 'lucide-react-native';
import { getApiUrl } from '../../config/environment';

export default function UsersListPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Responsive font sizes
  const titleSize = isMobile ? 22 : 32;

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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: isMobile ? 20 : 30 }}>
      <View style={styles.header}>
        <View style={[styles.titleRow, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <View style={styles.iconWrapper}><Users size={28} color="#2563eb" /></View>
          <View style={{ flex: 1, flexShrink: 1 }}>
            <Text style={[styles.title, { fontSize: titleSize }]}>Diretório de Utilizadores</Text>
            <Text style={styles.subtitle}>Todos os membros registados no SaaS</Text>
          </View>
        </View>
      </View>

      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {users.map((u) => (
          <View key={u.id} style={[styles.card, isMobile && styles.cardMobile]}>
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
  container: { flex: 1, backgroundColor: '#fafbfc' },
  header: { marginBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrapper: { backgroundColor: '#dbeafe', padding: 13, borderRadius: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  gridMobile: { flexDirection: 'column' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 22, minWidth: 320, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  cardMobile: { minWidth: '100%' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 14, elevation: 1 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '800' },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 16, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  userEmail: { flexShrink: 1, fontSize: 12, color: '#64748b', fontWeight: '500' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 9 },
  detailsText: { fontSize: 14, color: '#475569', fontWeight: '600' }
});
