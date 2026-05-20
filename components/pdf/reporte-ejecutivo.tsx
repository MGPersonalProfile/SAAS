import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1d2b36",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#0b3d62",
    paddingBottom: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0b3d62",
  },
  subtitle: {
    fontSize: 10,
    color: "#586675",
    marginTop: 2,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0b3d62",
    marginBottom: 6,
  },
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#dbe3ea",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#dbe3ea",
    paddingVertical: 4,
  },
  rowHeader: {
    backgroundColor: "#f4f6f9",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingHorizontal: 4,
  },
  cellHeader: {
    fontSize: 9,
    fontWeight: 700,
    color: "#586675",
    textTransform: "uppercase",
  },
  right: {
    textAlign: "right",
  },
  bold: {
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#586675",
    borderTopWidth: 1,
    borderTopColor: "#dbe3ea",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface BudgetRow {
  concepto: string;
  monto: number;
  nota: string | null;
}

interface EstadoRow {
  estado: string;
  count: number;
  monto: number;
}

interface ReporteEjecutivoProps {
  generadoPor: string;
  generadoEn: string;
  budget: BudgetRow[];
  paccTotal: number;
  paccCount: number;
  procesosTotal: number;
  procesosMonto: number;
  procesosPorEstado: EstadoRow[];
}

function money(n: number): string {
  return `L ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ReporteEjecutivo({
  generadoPor,
  generadoEn,
  budget,
  paccTotal,
  paccCount,
  procesosTotal,
  procesosMonto,
  procesosPorEstado,
}: ReporteEjecutivoProps) {
  return (
    <Document title="Reporte Ejecutivo CHFM" author="CHFM">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CHFM — Reporte Ejecutivo</Text>
          <Text style={styles.subtitle}>
            Generado por {generadoPor} · {generadoEn}
          </Text>
        </View>

        {/* Resumen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.rowHeader]}>
              <Text style={[styles.cell, styles.cellHeader, { flex: 3 }]}>
                Indicador
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.cellHeader,
                  styles.right,
                  { flex: 2 },
                ]}
              >
                Valor
              </Text>
            </View>
            <ResumenRow label="Total PACC" value={money(paccTotal)} hint={`${paccCount} líneas`} />
            <ResumenRow label="Procesos registrados" value={`${procesosTotal}`} />
            <ResumenRow
              label="Monto total de procesos"
              value={money(procesosMonto)}
              last
            />
          </View>
        </View>

        {/* Presupuesto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presupuesto</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.rowHeader]}>
              <Text style={[styles.cell, styles.cellHeader, { flex: 4 }]}>
                Concepto
              </Text>
              <Text style={[styles.cell, styles.cellHeader, styles.right, { flex: 2 }]}>
                Monto
              </Text>
              <Text style={[styles.cell, styles.cellHeader, { flex: 4 }]}>
                Nota
              </Text>
            </View>
            {budget.map((b, i) => (
              <View
                key={b.concepto}
                style={[styles.row, i === budget.length - 1 ? styles.rowLast : {}]}
              >
                <Text style={[styles.cell, { flex: 4 }]}>{b.concepto}</Text>
                <Text style={[styles.cell, styles.right, { flex: 2 }]}>
                  {money(Number(b.monto))}
                </Text>
                <Text style={[styles.cell, { flex: 4, fontSize: 9, color: "#586675" }]}>
                  {b.nota ?? ""}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Procesos por estado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procesos por estado</Text>
          {procesosPorEstado.length === 0 ? (
            <Text style={{ fontSize: 9, color: "#586675" }}>
              Sin procesos registrados.
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={[styles.row, styles.rowHeader]}>
                <Text style={[styles.cell, styles.cellHeader, { flex: 4 }]}>Estado</Text>
                <Text style={[styles.cell, styles.cellHeader, styles.right, { flex: 1 }]}>
                  Cantidad
                </Text>
                <Text style={[styles.cell, styles.cellHeader, styles.right, { flex: 2 }]}>
                  Monto
                </Text>
              </View>
              {procesosPorEstado.map((r, i) => (
                <View
                  key={r.estado}
                  style={[
                    styles.row,
                    i === procesosPorEstado.length - 1 ? styles.rowLast : {},
                  ]}
                >
                  <Text style={[styles.cell, { flex: 4 }]}>{r.estado}</Text>
                  <Text style={[styles.cell, styles.right, { flex: 1 }]}>
                    {r.count}
                  </Text>
                  <Text style={[styles.cell, styles.right, { flex: 2 }]}>
                    {money(r.monto)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>CHFM — Sistema de Gestión</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function ResumenRow({
  label,
  value,
  hint,
  last,
}: {
  label: string;
  value: string;
  hint?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last ? styles.rowLast : {}]}>
      <Text style={[styles.cell, { flex: 3 }]}>
        {label}
        {hint ? <Text style={{ color: "#586675" }}> · {hint}</Text> : null}
      </Text>
      <Text style={[styles.cell, styles.right, styles.bold, { flex: 2 }]}>
        {value}
      </Text>
    </View>
  );
}
