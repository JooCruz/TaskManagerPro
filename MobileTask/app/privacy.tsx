import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>Política de Privacidade</Text>
        
        <Text style={styles.intro}>
          A TaskManagerPro valoriza a sua privacidade e compromete-se a proteger os seus dados pessoais. Esta política explica como recolhemos, usamos e protegemos a informação fornecida pelos nossos utilizadores.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Recolha de Informação</Text>
          <Text style={styles.sectionText}>
            Podemos recolher informações pessoais, como o seu nome, endereço de e-mail e dados de acesso, quando se regista ou utiliza os nossos serviços.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Utilização da Informação</Text>
          <Text style={styles.sectionText}>
            As informações recolhidas são utilizadas para gerir a sua conta, melhorar os nossos serviços e enviar comunicações relevantes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Proteção de Dados</Text>
          <Text style={styles.sectionText}>
            Implementamos medidas técnicas e organizacionais apropriadas para proteger a sua informação contra o acesso não autorizado, perda ou alteração.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Partilha de Dados</Text>
          <Text style={styles.sectionText}>
            Não vendemos nem partilhamos os seus dados pessoais com terceiros, exceto quando exigido por lei ou necessário para a operação dos nossos serviços.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Direitos dos Utilizadores</Text>
          <Text style={styles.sectionText}>
            Tem o direito de aceder, corrigir ou eliminar os seus dados pessoais a qualquer momento contactando-nos através do nosso formulário de contacto.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Alterações à Política</Text>
          <Text style={styles.sectionText}>
            Reservamo-nos o direito de atualizar esta política periodicamente. A versão mais recente estará sempre disponível neste website.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Última atualização: Março de 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: Platform.OS === 'web' ? 24 : 50,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  backButton: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  intro: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 28,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'justify',
    fontWeight: '500',
  },
  footer: {
    marginTop: 36,
    marginBottom: 40,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});