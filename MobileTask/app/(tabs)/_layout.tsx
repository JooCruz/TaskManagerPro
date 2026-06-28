import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot, useRouter, usePathname } from 'expo-router';
import { LayoutDashboard, CheckSquare, ShieldAlert, Settings, LogOut, Menu, Building, Layers, Users, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  
  // No web, sidebar sempre aberto. No mobile, usa toggle
  const isMobileScreen = width < 768;
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobileScreen);
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

  useEffect(() => {
    setIsSidebarOpen(!isMobileScreen);
  }, [isMobileScreen]);

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
        
        {/* SIDEBAR - Desktop sempre visível, Mobile é overlay */}
        {isSidebarOpen && (
          <>
            {/* Overlay de fundo (só no mobile) */}
            {isMobileScreen && (
              <TouchableOpacity 
                style={styles.overlay}
                activeOpacity={1}
                onPress={() => setIsSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <View style={[styles.sidebar, isMobileScreen && styles.sidebarMobile]}>
              <View>
                <View style={styles.logoContainer}>
                  <CheckSquare color="white" size={24} />
                  <Text style={styles.logoText}>TaskManagerPro</Text>
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
                        onPress={() => {
                          router.push(item.path as any);
                          // Fechar sidebar automaticamente no mobile após clicar
                          if (isMobileScreen) setIsSidebarOpen(false);
                        }}
                      >
                        <Icon color={isActive ? "white" : "#cbd5e1"} size={20} />
                        <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sidebarFooter}>
                {/* Botão de fechar (só no mobile) */}
                {isMobileScreen && (
                  <TouchableOpacity 
                    style={styles.closeBtn}
                    onPress={() => setIsSidebarOpen(false)}
                  >
                    <X color="#cbd5e1" size={24} />
                    <Text style={styles.closeBtnText}>Fechar</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <LogOut color="#cbd5e1" size={20} />
                  <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <View style={[styles.mainArea, isSidebarOpen && !isMobileScreen && styles.mainAreaWithSidebar]}>
          <View style={[styles.topBar, isMobileScreen && styles.topBarMobile]}>
            <View style={styles.topBarLeft}>
              <TouchableOpacity onPress={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.iconBtn}>
                <Menu color="#475569" size={24} />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Gestor de Tarefas</Text>
            </View>

            <View style={styles.topBarRight}>
              <View style={styles.topAvatarContainer}>
                <View style={styles.topAvatar}><Text style={styles.topAvatarText}>{initial}</Text></View>
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
  safeAreaFix: { flex: 1, backgroundColor: '#fafbfc' },
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#fafbfc' },
  
  // OVERLAY (Mobile)
  overlay: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  
  // SIDEBAR
  sidebar: { 
    width: 280, 
    backgroundColor: '#1e3a8a', 
    padding: 24, 
    justifyContent: 'space-between', 
    zIndex: 10, 
    borderRightWidth: 1, 
    borderRightColor: '#1e40af' 
  },
  sidebarMobile: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
  },
  
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32, paddingHorizontal: 8 },
  logoText: { color: 'white', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 32, paddingHorizontal: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#60a5fa', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 17 },
  profileName: { color: 'white', fontSize: 15, fontWeight: '600', letterSpacing: -0.3 },
  profileRole: { color: '#93c5fd', fontSize: 12, textTransform: 'capitalize', marginTop: 2 },
  menu: { gap: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9, marginBottom: 2 },
  menuItemActive: { backgroundColor: '#1e40af', elevation: 2 },
  menuText: { color: '#bfdbfe', fontSize: 15, fontWeight: '500' },
  menuTextActive: { color: 'white', fontWeight: '700' },
  
  sidebarFooter: { borderTopWidth: 1, borderTopColor: '#1e40af', paddingTop: 16, marginTop: 24 },
  closeBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9, marginBottom: 12 },
  closeBtnText: { color: '#bfdbfe', fontSize: 15, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9 },
  logoutText: { color: '#bfdbfe', fontSize: 15, fontWeight: '600' },
  
  // MAIN AREA
  mainArea: { 
    flex: 1, 
    flexDirection: 'column', 
    backgroundColor: '#fafbfc',
    minWidth: 0, 
  },
  mainAreaWithSidebar: {
    flex: 1,
  },
  
  topBar: { 
    height: 72, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    elevation: 1
  },
  topBarMobile: {
    paddingHorizontal: 16,
    height: 64,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  topBarTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { padding: 8, position: 'relative' },
  notificationBadge: { position: 'absolute', top: 2, right: 4, backgroundColor: '#ef4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  notificationText: { color: 'white', fontSize: 10, fontWeight: '700' },
  topAvatarContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 },
  topAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  topAvatarText: { color: 'white', fontWeight: '700', fontSize: 16 },
  topName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  topRole: { fontSize: 12, color: '#64748b', textTransform: 'capitalize', marginTop: 1 },
  content: { flex: 1, backgroundColor: '#fafbfc' },
});
