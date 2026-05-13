import {
  CheckCircle2,
  Clock,
  Download,
  Timer,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 25 }}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Administrador! 👋</Text>
          <Text style={styles.subtitle}>
            Aqui está um resumo da sua produtividade
          </Text>
        </View>
        <TouchableOpacity style={styles.exportBtn}>
          <Download size={16} color="#475569" />
          <Text style={styles.exportText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* 4 CARTÕES DE MÉTRICAS (Topo) */}
      <View style={styles.statsGrid}>
        {/* Cartão 1: Concluídas */}
        <View style={styles.statCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tarefas{"\n"}Concluídas</Text>
            <CheckCircle2 color="#3b82f6" size={20} />
          </View>
          <Text style={styles.cardValue}>2</Text>
          <Text style={styles.cardSubtext}>25% do total</Text>
        </View>

        {/* Cartão 2: Pendentes */}
        <View style={styles.statCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tarefas{"\n"}Pendentes</Text>
            <Clock color="#3b82f6" size={20} />
          </View>
          <Text style={styles.cardValue}>3</Text>
          <Text style={[styles.cardSubtext, { color: "#ef4444" }]}>
            3 atrasadas
          </Text>
        </View>

        {/* Cartão 3: Produtividade */}
        <View style={styles.statCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Produtividade</Text>
            <TrendingUp color="#3b82f6" size={20} />
          </View>
          <Text style={styles.cardValue}>40%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "40%" }]} />
          </View>
        </View>

        {/* Cartão 4: Tempo Médio */}
        <View style={styles.statCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tempo{"\n"}Médio/Tarefa</Text>
            <Timer color="#3b82f6" size={20} />
          </View>
          <Text style={styles.cardValue}>1h 15m</Text>
          <Text style={styles.cardSubtext}>Total: 5h 0m</Text>
        </View>
      </View>

      {/* ÁREA DE GRÁFICOS (Fundo) */}
      <View style={styles.chartsGrid}>
        {/* Gráfico 1: Atividade Semanal (Simulado com Barras CSS) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Atividade Semanal</Text>
          <View style={styles.barChartContainer}>
            {/* Seg - Dom */}
            {[40, 70, 45, 90, 60, 30, 80].map((height, index) => (
              <View key={index} style={styles.barGroup}>
                <View
                  style={[
                    styles.bar,
                    { height: height, backgroundColor: "#3b82f6" },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: height * 0.6, backgroundColor: "#f59e0b" },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.chartXAxis}>
            {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
              <Text key={i} style={styles.axisLabel}>
                {day}
              </Text>
            ))}
          </View>
        </View>

        {/* Gráfico 2: Distribuição de Tarefas (Simulado com Legendas como no Figma) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribuição de Tarefas</Text>

          <View style={styles.distributionContainer}>
            {/* Círculo simulador de Pie Chart */}
            <View style={styles.mockPieChart}>
              <View style={[styles.pieSlice, styles.pieSliceBlue]} />
              <View style={[styles.pieSlice, styles.pieSliceYellow]} />
              <View style={[styles.pieSlice, styles.pieSliceRed]} />
              <View style={styles.pieCenter} />
            </View>

            {/* Legendas */}
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#3b82f6" }]}
                />
                <Text style={styles.legendText}>
                  Concluídas: <Text style={{ fontWeight: "bold" }}>2</Text>
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#f59e0b" }]}
                />
                <Text style={styles.legendText}>
                  Pendentes: <Text style={{ fontWeight: "bold" }}>3</Text>
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#ef4444" }]}
                />
                <Text style={styles.legendText}>
                  Atrasadas: <Text style={{ fontWeight: "bold" }}>3</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  // Cabeçalho
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: "#64748b" },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportText: { color: "#475569", fontWeight: "600", fontSize: 13 },

  // Grelha de 4 Cartões
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 200 : "45%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    lineHeight: 18,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  cardSubtext: { fontSize: 12, color: "#64748b" },

  // Barra de Progresso do 3º Cartão
  progressBarBg: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginTop: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },

  // Grelha de Gráficos (Baixo)
  chartsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    paddingBottom: 20,
  },
  chartCard: {
    flex: 1,
    minWidth: Platform.OS === "web" ? 400 : "100%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },

  // Simulação do Gráfico de Barras
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
  },
  barGroup: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  bar: { width: 12, borderRadius: 4 },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  axisLabel: { color: "#64748b", fontSize: 12 },

  // Simulação do Gráfico Circular
  distributionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 10,
  },
  mockPieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
  },
  pieSlice: { position: "absolute", width: "100%", height: "100%" },
  pieSliceBlue: {
    backgroundColor: "#3b82f6",
    borderRightWidth: 60,
    borderRightColor: "transparent",
    borderBottomWidth: 60,
    borderBottomColor: "transparent",
  },
  pieSliceYellow: {
    backgroundColor: "#f59e0b",
    borderTopWidth: 60,
    borderTopColor: "transparent",
    borderLeftWidth: 60,
    borderLeftColor: "transparent",
  },
  pieSliceRed: {
    backgroundColor: "#ef4444",
    height: "50%",
    width: "50%",
    bottom: 0,
    left: 0,
  },
  pieCenter: {
    position: "absolute",
    top: 30,
    left: 30,
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 30,
  }, // Cria o "Donut"

  legendContainer: { justifyContent: "center", gap: 12 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: "#475569", fontSize: 14 },
});
