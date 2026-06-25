import {
  CheckCircle2,
  Clock,
  Download,
  Timer,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmall = width < 400;

  const greetingSize = isSmall ? 18 : isMobile ? 22 : 28;
  const chartTitleSize = isMobile ? 15 : 18;
  const cardMinWidth = isMobile ? "100%" : "47%";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: isMobile ? 16 : 25 }}
    >
      {/* CABEÇALHO */}
      <View style={[styles.header, isMobile && { flexDirection: "column", alignItems: "flex-start", gap: 12 }]}>
        <View style={{ flex: 1, flexShrink: 1 }}>
          <Text style={[styles.greeting, { fontSize: greetingSize }]}>
            Olá, Administrador! 👋
          </Text>
          <Text style={styles.subtitle}>
            Aqui está um resumo da sua produtividade
          </Text>
        </View>
        <TouchableOpacity style={[styles.exportBtn, isMobile && { alignSelf: "flex-start" }]}>
          <Download size={16} color="#475569" />
          <Text style={styles.exportText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* 4 CARTÕES DE MÉTRICAS */}
      <View style={[styles.statsGrid, isMobile && { gap: 10 }]}>
        {[
          { title: "Tarefas\nConcluídas", value: "2", sub: "25% do total", subColor: "#64748b", icon: <CheckCircle2 color="#3b82f6" size={20} /> },
          { title: "Tarefas\nPendentes", value: "3", sub: "3 atrasadas", subColor: "#ef4444", icon: <Clock color="#3b82f6" size={20} /> },
          { title: "Produtividade", value: "40%", sub: null, subColor: null, icon: <TrendingUp color="#3b82f6" size={20} />, progress: true },
          { title: "Tempo\nMédio/Tarefa", value: "1h 15m", sub: "Total: 5h 0m", subColor: "#64748b", icon: <Timer color="#3b82f6" size={20} /> },
        ].map((card, i) => (
          <View key={i} style={[styles.statCard, isMobile ? styles.statCardMobile : styles.statCardDesktop]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.icon}
            </View>
            <Text style={[styles.cardValue, isMobile && { fontSize: 26 }]}>{card.value}</Text>
            {card.progress ? (
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: "40%" }]} />
              </View>
            ) : (
              <Text style={[styles.cardSubtext, { color: card.subColor ?? "#64748b" }]}>{card.sub}</Text>
            )}
          </View>
        ))}
      </View>

      {/* GRÁFICOS */}
      <View style={[styles.chartsGrid, isMobile && { flexDirection: "column" }]}>
        {/* Gráfico de Barras */}
        <View style={[styles.chartCard, isMobile && styles.chartCardMobile]}>
          <Text style={[styles.chartTitle, { fontSize: chartTitleSize }]}>Atividade Semanal</Text>
          <View style={styles.barChartContainer}>
            {[40, 70, 45, 90, 60, 30, 80].map((height, index) => (
              <View key={index} style={styles.barGroup}>
                <View style={[styles.bar, { height, backgroundColor: "#3b82f6" }]} />
                <View style={[styles.bar, { height: height * 0.6, backgroundColor: "#f59e0b" }]} />
              </View>
            ))}
          </View>
          <View style={styles.chartXAxis}>
            {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
              <Text key={i} style={styles.axisLabel}>{day}</Text>
            ))}
          </View>
        </View>

        {/* Gráfico Circular */}
        <View style={[styles.chartCard, isMobile && styles.chartCardMobile]}>
          <Text style={[styles.chartTitle, { fontSize: chartTitleSize }]}>Distribuição de Tarefas</Text>
          <View style={styles.distributionContainer}>
            <View style={styles.mockPieChart}>
              <View style={[styles.pieSlice, styles.pieSliceBlue]} />
              <View style={[styles.pieSlice, styles.pieSliceYellow]} />
              <View style={[styles.pieSlice, styles.pieSliceRed]} />
              <View style={styles.pieCenter} />
            </View>
            <View style={styles.legendContainer}>
              {[
                { color: "#3b82f6", label: "Concluídas", value: "2" },
                { color: "#f59e0b", label: "Pendentes", value: "3" },
                { color: "#ef4444", label: "Atrasadas", value: "3" },
              ].map((item, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>
                    {item.label}: <Text style={{ fontWeight: "bold" }}>{item.value}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafbfc" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  greeting: {
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
  },
  exportText: { color: "#475569", fontWeight: "700", fontSize: 13 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    maxWidth: "49%",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statCardDesktop: {
    minWidth: "47%",
    maxWidth: "49%",
  },
  statCardMobile: {
    minWidth: "100%",
    maxWidth: "100%",
  },
  cardTitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    lineHeight: 17,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    flexShrink: 1,
    marginRight: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardSubtext: { fontSize: 13, fontWeight: "500" },

  progressBarBg: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },

  chartsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingBottom: 20,
  },
  chartCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  chartCardMobile: {
    minWidth: "100%",
  },
  chartTitle: {
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 18,
    letterSpacing: -0.3,
  },

  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
  },
  barGroup: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  bar: { width: 12, borderRadius: 3 },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  axisLabel: { color: "#64748b", fontSize: 12, fontWeight: "600" },

  distributionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 16,
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
    backgroundColor: "#1e40af",
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
    backgroundColor: "#dc2626",
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
  },

  legendContainer: { justifyContent: "center", gap: 12 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: "#475569", fontSize: 13, fontWeight: "600" },
});