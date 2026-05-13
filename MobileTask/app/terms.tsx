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
    backgroundColor: '#EDF2F7',
  },
  header: {
    backgroundColor: '#3182CE',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 20,
    marginTop: 10,
  },
  intro: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 25,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
});