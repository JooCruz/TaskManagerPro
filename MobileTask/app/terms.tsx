import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>Termos de Uso</Text>
        
        <Text style={styles.intro}>
          Estes termos de uso regem o acesso e o uso da plataforma TaskManager. Ao utilizar este site, concordas com estes termos
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
          <Text style={styles.sectionText}>
            Ao criar uma conta ou acessar nossos serviços, você aceita plenamente estes Termos e Condições.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Uso da Plataforma</Text>
          <Text style={styles.sectionText}>
            Você concorda em usar o TaskManager apenas para fins legítimos e a se abster de quaisquer atividades que possam comprometer a segurança ou a funcionalidade do sistema.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Conta de Usuário</Text>
          <Text style={styles.sectionText}>
            Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades realizadas em sua conta.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Propriedade Intelectual</Text>
          <Text style={styles.sectionText}>
            Todo o conteúdo, marcas registradas e logotipos são propriedade exclusiva do TaskManager e não podem ser reproduzidos sem autorização prévia.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Limitação de Responsabilidade</Text>
          <Text style={styles.sectionText}>
            O TaskManager não será responsabilizado por quaisquer danos resultantes do uso indevido da plataforma ou falhas técnicas fora de seu controle.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Alterações nos Termos</Text>
          <Text style={styles.sectionText}>
            Podemos modificar estes Termos a qualquer momento. Quaisquer atualizações serão publicadas nesta página, juntamente com a data da última revisão.
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