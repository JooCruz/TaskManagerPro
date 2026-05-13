import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { LayoutDashboard, CheckSquare, ShieldAlert, Settings, LogOut, Menu, Bell, Moon, Building, Layers, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(Platform.OS === 'web');
  const [currentUser, setCurrentUser] = useState({ nome: 'Carregando...', role: 'user' });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        if (user.role === 'admin' && (pathname === '/explore' || pathname === '/tasks')) {
          router.replace('/admin');
        }
      }
    };
    loadUser();
  }, [pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/explore', icon: LayoutDashboard },
    { name: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { name: 'Administração', path: '/admin', icon: ShieldAlert },
    { name: 'Utilizadores', path: '/usersList', icon: Users },
    { name: 'Criar Empresa', path: '/createEmpresa', icon: Building },     
    { name: 'Criar Departamento', path: '/createDepartamento', icon: Layers }, 
    { name: 'Configurações', path: '/SettingsPage', icon: Settings },
  ];

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_data');
    router.replace('/'); 
  };

  const initial = currentUser.nome ? currentUser.nome.charAt(0).toUpperCase() : 'U';
  const isAdmin = currentUser.role === 'admin';

  return (
    <SafeAreaView style={styles.safeAreaFix}>
      <View style={styles.container}>
        
        {isSidebarOpen && (
          <View style={styles.sidebar}>
            <View>
              <View style={styles.logoContainer}>
                <CheckSquare color="white" size={24} />
                <Text style={styles.logoText}>TaskManager</Text>
              </View>

              <View style={styles.profileSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View>
                  <Text style={styles.profileName}>{currentUser.nome}</Text>
                  <Text style={styles.profileRole}>{currentUser.role}</Text>
                </View>
              </View>

              <View style={styles.menu}>
                {menuItems.map((item) => {
                  const adminTabs = ['Administração', 'Utilizadores', 'Criar Empresa', 'Criar Departamento'];
                  if (adminTabs.includes(item.name) && !isAdmin) return null;
                  const workerTabs = ['Dashboard', 'Tarefas'];
                  if (workerTabs.includes(item.name) && isAdmin) return null;

                  const isActive = pathname?.includes(item.path);
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity 
                      key={item.name} 
                      style={[styles.menuItem, isActive && styles.menuItemActive]}
                      onPress={() => router.push(item.path as any)}
                    >
                      <Icon color={isActive ? "white" : "#cbd5e1"} size={20} />
                      <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sidebarFooter}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut color="#cbd5e1" size={20} />
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.mainArea}>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity onPress={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.iconBtn}>
                <Menu color="#475569" size={24} />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Gestor de Tarefas</Text>
            </View>

            <View style={styles.topBarRight}>
              
              
      
              <View style={styles.topAvatarContainer}>
                <View style={styles.topAvatar}><Text style={styles.topAvatarText}>{initial}</Text></View>
                {/* Reposto: Nome e Role visíveis em ecrãs maiores (web) e escondidos via lógica original */}
                <View style={{display: Platform.OS === 'web' ? 'flex' : 'none'}}>
                  <Text style={styles.topName}>{currentUser.nome}</Text>
                  <Text style={styles.topRole}>{currentUser.role}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.content}>
            <Slot />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaFix: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f8fafc' },
  sidebar: { width: 250, backgroundColor: '#6b8ab8', padding: 20, justifyContent: 'space-between', zIndex: 10 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30, paddingHorizontal: 10 },
  logoText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30, paddingHorizontal: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  profileName: { color: 'white', fontSize: 14, fontWeight: '600' },
  profileRole: { color: '#e2e8f0', fontSize: 12, textTransform: 'capitalize' },
  menu: { gap: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8 },
  menuItemActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  menuText: { color: '#e2e8f0', fontSize: 15, fontWeight: '500' },
  menuTextActive: { color: 'white', fontWeight: 'bold' },
  sidebarFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15, marginTop: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8 },
  logoutText: { color: '#cbd5e1', fontSize: 15, fontWeight: '500' },
  
  mainArea: { 
    flex: 1, 
    flexDirection: 'column', 
    backgroundColor: '#f8fafc',
    minWidth: 0, 
  },
  topBar: { 
    height: 70, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  topBarTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBtn: { padding: 8, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 4, right: 6, backgroundColor: '#ef4444', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  notificationText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  topAvatarContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 10 },
  topAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  topAvatarText: { color: 'white', fontWeight: 'bold' },
  topName: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  topRole: { fontSize: 11, color: '#64748b', textTransform: 'capitalize' },
  content: { flex: 1, backgroundColor: '#f8fafc' },
});