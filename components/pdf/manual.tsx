import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Link,
} from "@react-pdf/renderer";

// ============================================================================
// Estilos
// ============================================================================

const COLORS = {
  primary: "#0b3d62",
  text: "#1d2b36",
  muted: "#586675",
  border: "#dbe3ea",
  bgSoft: "#f4f6f9",
  amber: "#b45309",
  amberBg: "#fef3c7",
  red: "#b91c1c",
  green: "#15803d",
  greenBg: "#dcfce7",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: COLORS.text,
    lineHeight: 1.5,
  },
  cover: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 60,
    fontFamily: "Helvetica",
    color: COLORS.text,
    backgroundColor: COLORS.primary,
    height: "100%",
  },
  coverLogo: {
    width: 90,
    height: 90,
    backgroundColor: "white",
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 18,
    borderRadius: 12,
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "white",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 12,
    color: "white",
    opacity: 0.7,
    marginTop: "auto",
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  h2: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 6,
  },
  h3: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 4,
  },
  p: {
    marginBottom: 6,
  },
  strong: {
    fontWeight: 700,
  },
  code: {
    fontFamily: "Courier",
    fontSize: 10,
    backgroundColor: COLORS.bgSoft,
    paddingHorizontal: 3,
    paddingVertical: 1,
    color: COLORS.primary,
  },
  step: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    marginLeft: 0,
  },
  stepNum: {
    width: 18,
    fontWeight: 700,
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
  },
  bullet: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
    marginLeft: 6,
  },
  bulletDot: {
    width: 8,
    color: COLORS.primary,
  },
  bulletText: {
    flex: 1,
  },
  note: {
    backgroundColor: COLORS.amberBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
    padding: 8,
    marginVertical: 8,
    fontSize: 10,
    color: "#92400e",
  },
  tip: {
    backgroundColor: COLORS.greenBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.green,
    padding: 8,
    marginVertical: 8,
    fontSize: 10,
    color: "#14532d",
  },
  warning: {
    backgroundColor: "#fee2e2",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
    padding: 8,
    marginVertical: 8,
    fontSize: 10,
    color: COLORS.red,
  },
  table: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 8,
  },
  trow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trowLast: {
    borderBottomWidth: 0,
  },
  trowHeader: {
    backgroundColor: COLORS.bgSoft,
    fontWeight: 700,
    color: COLORS.primary,
  },
  tcell: {
    padding: 4,
    fontSize: 9.5,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    fontSize: 9,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toc: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 11,
  },
  tocDots: {
    flex: 1,
    color: COLORS.border,
  },
  link: {
    color: COLORS.primary,
    textDecoration: "underline",
  },
  bigQuote: {
    fontSize: 13,
    fontStyle: "italic",
    color: COLORS.primary,
    marginVertical: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
});

// ============================================================================
// Componentes helper
// ============================================================================

const P = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.p}>{children}</Text>
);

const H1 = ({ children, id }: { children: string; id?: string }) => (
  <Text style={styles.h1} id={id}>
    {children}
  </Text>
);

const H2 = ({ children }: { children: string }) => (
  <Text style={styles.h2}>{children}</Text>
);

const H3 = ({ children }: { children: string }) => (
  <Text style={styles.h3}>{children}</Text>
);

const Code = ({ children }: { children: string }) => (
  <Text style={styles.code}>{children}</Text>
);

const Strong = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.strong}>{children}</Text>
);

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <View style={styles.step} wrap={false}>
    <Text style={styles.stepNum}>{n}.</Text>
    <Text style={styles.stepText}>{children}</Text>
  </View>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.bullet} wrap={false}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.note} wrap={false}>
    <Text>{children}</Text>
  </View>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.tip} wrap={false}>
    <Text>{children}</Text>
  </View>
);

const Warning = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.warning} wrap={false}>
    <Text>{children}</Text>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>CHFM — Manual de Usuario</Text>
    <Text
      render={({ pageNumber, totalPages }) =>
        `${pageNumber} / ${totalPages}`
      }
    />
  </View>
);

const TocRow = ({ n, title }: { n: string; title: string }) => (
  <View style={styles.toc}>
    <Text>
      <Text style={styles.strong}>{n}.</Text> {title}
    </Text>
  </View>
);

// ============================================================================
// Documento
// ============================================================================

export function ManualPdf() {
  return (
    <Document
      title="CHFM — Manual de Usuario"
      author="CHFM"
      subject="Guía paso a paso para usar el sistema CHFM"
      language="es"
    >
      {/* ====================== Portada ====================== */}
      <Page size="LETTER" style={styles.cover}>
        <Text style={styles.coverLogo}>CH</Text>
        <Text style={styles.coverTitle}>Manual de Usuario</Text>
        <Text style={styles.coverSubtitle}>
          Sistema de Gestión Presupuestaria, PACC y Compras del CHFM
        </Text>
        <Text style={{ color: "white", opacity: 0.85, fontSize: 12, lineHeight: 1.6 }}>
          Esta guía explica paso a paso cómo usar la plataforma: desde el
          primer ingreso hasta los flujos diarios de control presupuestario,
          gestión de procesos de compra, importación de datos y reportes.
        </Text>
        <Text style={styles.coverMeta}>
          Versión 1.0 · Generado automáticamente desde el código fuente
          {"\n"}https://saas-two-opal.vercel.app
        </Text>
      </Page>

      {/* ====================== Índice ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>Índice</H1>
        <TocRow n="1" title="Bienvenida" />
        <TocRow n="2" title="Acceso al sistema (URL, login, contraseña)" />
        <TocRow n="3" title="Instalar como app móvil (PWA)" />
        <TocRow n="4" title="Tour por el panel: los 10 módulos" />
        <TocRow n="5" title="Dashboard: leer las métricas clave" />
        <TocRow n="6" title="Presupuesto: gestión de partidas" />
        <TocRow n="7" title="PACC: buscar, filtrar y exportar" />
        <TocRow n="8" title="Compras: crear y avanzar procesos" />
        <TocRow n="9" title="Documentos: subir y descargar archivos" />
        <TocRow n="10" title="Reportes: PDF ejecutivo y CSVs" />
        <TocRow n="11" title="Importar: cargar CSV de SIAFI / HonduCompras" />
        <TocRow n="12" title="Alertas: detección de fraccionamiento" />
        <TocRow n="13" title="Auditoría: bitácora de acciones" />
        <TocRow n="14" title="Usuarios: alta, roles y reset de contraseña" />
        <TocRow n="A" title="Apéndice A: Matriz de roles y permisos" />
        <TocRow n="B" title="Apéndice B: Los 11 estados de un proceso" />
        <TocRow n="C" title="Apéndice C: Glosario" />
        <TocRow n="D" title="Apéndice D: Soporte y contacto" />
        <Footer />
      </Page>

      {/* ====================== 1. Bienvenida ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>1. Bienvenida</H1>
        <P>
          Este sistema reemplaza el control manual del presupuesto, el PACC y
          los procesos de compra del CHFM. Sustituye hojas de cálculo
          sueltas y carpetas físicas por una plataforma centralizada,
          auditada y accesible desde cualquier computadora o celular.
        </P>

        <View style={styles.bigQuote}>
          <Text>
            "Una sola fuente de verdad para presupuesto, PACC y compras —
            con quién hizo qué y cuándo, accesible 24/7 desde el navegador."
          </Text>
        </View>

        <H2>Qué hace por ti</H2>
        <Bullet>
          <Strong>Dashboard en vivo</Strong>: ves el presupuesto vigente, lo
          comprometido, lo ejecutado y los procesos activos de un vistazo.
        </Bullet>
        <Bullet>
          <Strong>Workflow de compras</Strong>: cada proceso pasa por 11
          estados controlados, con comentario obligatorio en cada cambio y
          un historial inmutable.
        </Bullet>
        <Bullet>
          <Strong>PACC integrado</Strong>: 593 líneas precargadas del Plan
          Anual de Compras, buscables y filtrables por mes, modalidad,
          fuente o monto.
        </Bullet>
        <Bullet>
          <Strong>Auditoría completa</Strong>: cada acción queda registrada
          (quién, qué, cuándo, desde dónde) y nadie — ni siquiera un
          administrador — puede borrarla.
        </Bullet>
        <Bullet>
          <Strong>Alertas de fraccionamiento</Strong>: el sistema avisa
          cuando detecta patrones sospechosos (3+ procesos del mismo
          responsable y objeto en 90 días sumando más de L 500,000).
        </Bullet>
        <Bullet>
          <Strong>Reportes ejecutivos en PDF</Strong> para reuniones y CSVs
          para análisis en Excel.
        </Bullet>
        <Bullet>
          <Strong>Móvil y tablet</Strong>: la app es responsive y se puede
          instalar en el celular como si fuera nativa.
        </Bullet>

        <H2>Lo que NO hace (todavía)</H2>
        <Bullet>
          No se integra automáticamente con SIAFI ni HonduCompras —
          tenés que descargar el CSV de esos sistemas y subirlo manualmente
          (cap. 11). Esa integración llegará cuando esos sistemas expongan
          APIs públicas.
        </Bullet>
        <Bullet>
          No genera órdenes de compra firmadas digitalmente. Por ahora
          documenta el proceso y guarda los archivos firmados que subas.
        </Bullet>

        <Footer />
      </Page>

      {/* ====================== 2. Acceso ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>2. Acceso al sistema</H1>

        <H2>Dirección de la plataforma</H2>
        <P>
          Abre tu navegador (Chrome, Edge, Safari o Firefox) y entra a:
        </P>
        <View style={{ ...styles.tip, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>
            https://saas-two-opal.vercel.app
          </Text>
        </View>
        <P>
          (Cuando el sistema cambie a su dominio definitivo — por ejemplo{" "}
          <Code>chfm.gob.hn</Code> — esa será la nueva dirección.)
        </P>

        <H2>Iniciar sesión</H2>
        <Step n={1}>
          En la pantalla de bienvenida pulsa el botón azul{" "}
          <Strong>Ingresar</Strong>.
        </Step>
        <Step n={2}>
          Escribe tu correo institucional (por ejemplo{" "}
          <Code>admin@chfm.gob.hn</Code>) y tu contraseña.
        </Step>
        <Step n={3}>
          Pulsa <Strong>Ingresar</Strong>. Si los datos son correctos, irás
          directo al Dashboard.
        </Step>

        <Note>
          Si te equivocas varias veces el sistema bloquea temporalmente los
          intentos por seguridad. Espera 5 minutos antes de volver a probar.
        </Note>

        <H2>Olvidé mi contraseña</H2>
        <Step n={1}>
          En la pantalla de ingreso, pulsa{" "}
          <Strong>"¿Olvidaste tu contraseña?"</Strong>.
        </Step>
        <Step n={2}>
          Escribe tu correo y pulsa <Strong>Enviar enlace</Strong>.
        </Step>
        <Step n={3}>
          Revisa tu bandeja de entrada (y la carpeta de spam). Llegará un
          email con un enlace que solo dura unos minutos.
        </Step>
        <Step n={4}>
          Abre el enlace, escribe tu nueva contraseña dos veces (mínimo 12
          caracteres), y pulsa <Strong>Guardar contraseña</Strong>.
        </Step>

        <H2>Cerrar sesión</H2>
        <P>
          En la barra lateral, abajo del todo, está tu avatar con tu nombre
          y rol. Pulsa sobre él y elige <Strong>Cerrar sesión</Strong>.
          También se cierra sola después de 1 hora de inactividad.
        </P>

        <Footer />
      </Page>

      {/* ====================== 3. PWA ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>3. Instalar como app móvil (PWA)</H1>

        <P>
          La plataforma es una <Strong>Progressive Web App</Strong>: se
          puede instalar en el celular o en la computadora como una app real,
          con su propio icono en la pantalla de inicio, sin pasar por la
          App Store ni Google Play.
        </P>

        <Tip>
          Beneficios: arranca con un tap, ocupa muy poco espacio, recuerda
          la sesión, y muestra una pantalla decente cuando no hay conexión.
        </Tip>

        <H2>En Android (Chrome)</H2>
        <Step n={1}>
          Abre <Code>https://saas-two-opal.vercel.app</Code> en Chrome.
        </Step>
        <Step n={2}>
          Verás un botón flotante azul abajo a la derecha que dice{" "}
          <Strong>Instalar app</Strong>. Pulsa ese botón.
        </Step>
        <Step n={3}>
          Chrome preguntará si quieres añadir CHFM a la pantalla de inicio.
          Confirma. Aparecerá un icono "CH" azul.
        </Step>
        <Step n={4}>
          Cuando abras la app desde ese icono, ya no verás la barra de
          direcciones — luce y se siente como una app nativa.
        </Step>

        <H2>En iPhone (Safari)</H2>
        <Step n={1}>
          Abre la URL en Safari (no funciona en Chrome iOS).
        </Step>
        <Step n={2}>
          Toca el botón <Strong>Compartir</Strong> (el cuadrado con la
          flecha hacia arriba, abajo del centro).
        </Step>
        <Step n={3}>
          Desplázate y elige <Strong>"Añadir a pantalla de inicio"</Strong>.
        </Step>
        <Step n={4}>
          Confirma el nombre "CHFM" y pulsa <Strong>Añadir</Strong>.
        </Step>

        <H2>En computadora (Chrome o Edge)</H2>
        <Step n={1}>
          Abre la URL en Chrome o Edge.
        </Step>
        <Step n={2}>
          En la barra de direcciones, a la derecha, verás un icono pequeño
          de "Instalar" (cuadrado con flecha hacia abajo). Pulsa.
        </Step>
        <Step n={3}>
          Confirma. Se creará un acceso directo en el escritorio y en el
          menú de inicio.
        </Step>

        <H2>Atajos rápidos desde el icono</H2>
        <P>
          Si mantienes pulsado el icono de CHFM (Android) o haces clic
          derecho (escritorio), aparece un menú con accesos rápidos:
        </P>
        <Bullet>Dashboard</Bullet>
        <Bullet>Nuevo proceso de compra</Bullet>
        <Bullet>Alertas</Bullet>
        <Bullet>PACC</Bullet>

        <H2>Cuando hay actualización nueva</H2>
        <P>
          Si publicamos una versión nueva, verás un cartel discreto abajo a
          la derecha:{" "}
          <Strong>"Nueva versión disponible · Recargar / Después"</Strong>.
          Recarga para usar lo último. Es seguro hacerlo en cualquier momento
          (no perderás trabajo en curso).
        </P>

        <Footer />
      </Page>

      {/* ====================== 4. Tour ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>4. Tour por el panel: los 10 módulos</H1>

        <P>
          Cuando inicias sesión verás el <Strong>Dashboard</Strong> a la
          derecha y un <Strong>menú lateral azul</Strong> a la izquierda con
          los módulos a los que tienes acceso. El orden y los módulos
          visibles dependen de tu rol — un administrador ve los 10, un
          usuario de Consulta solo ve 2 (Dashboard y Reportes).
        </P>

        <Tip>
          En móvil el menú está oculto por defecto. Toca el icono de las 3
          líneas (arriba a la izquierda) para abrirlo como cajón lateral.
        </Tip>

        <H2>Los 10 módulos</H2>

        <View style={styles.table}>
          <View style={[styles.trow, styles.trowHeader]}>
            <Text style={[styles.tcell, { width: 90 }]}>Módulo</Text>
            <Text style={[styles.tcell, { flex: 1 }]}>Para qué sirve</Text>
          </View>
          {[
            ["Dashboard", "Vista resumen: presupuesto, ejecución, procesos activos, alertas. Lo primero que ves al entrar."],
            ["Presupuesto", "Las partidas presupuestarias del CHFM: vigente, disponible, ejecutado. Crear, editar, eliminar."],
            ["PACC", "Las 593 líneas del Plan Anual de Compras. Buscar, filtrar por mes/modalidad/fuente, exportar CSV."],
            ["Compras", "Procesos de compra: crear nuevos, cambiar de estado, asignar responsable, ver historial. Es el módulo más usado."],
            ["Documentos", "Vista global de los archivos subidos a los procesos. (Los archivos individuales se gestionan dentro de cada proceso.)"],
            ["Reportes", "Descarga del reporte ejecutivo PDF y de los CSVs de PACC, procesos y presupuesto."],
            ["Alertas", "Detección automática de posible fraccionamiento. Solo admin y gerencia."],
            ["Auditoría", "Bitácora inmutable de todo lo que ha ocurrido en el sistema. Filtrable por usuario, módulo y fecha."],
            ["Importar", "Cargar CSV desde SIAFI (presupuesto) o HonduCompras (PACC) cuando hay cambios externos."],
            ["Usuarios", "Gestión de cuentas: alta, rol, activar/desactivar, reset de contraseña. Solo admin."],
          ].map(([name, desc], i) => (
            <View key={i} style={[styles.trow, i === 9 ? styles.trowLast : {}]}>
              <Text style={[styles.tcell, { width: 90, fontWeight: 700 }]}>
                {name}
              </Text>
              <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
                {desc}
              </Text>
            </View>
          ))}
        </View>

        <Note>
          Si intentas acceder a un módulo al que tu rol no llega (por
          ejemplo, un usuario "Consulta" intentando entrar a Usuarios), el
          sistema te devuelve al Dashboard automáticamente.
        </Note>

        <H2>Tu menú de usuario</H2>
        <P>
          Abajo del menú, tu avatar con iniciales y tu nombre. Al pulsarlo
          se abre un menú con tres opciones: ver tu perfil, cerrar sesión y
          en el futuro ajustes personales.
        </P>

        <Footer />
      </Page>

      {/* ====================== 5. Dashboard ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>5. Dashboard: leer las métricas clave</H1>

        <P>
          Es la pantalla que ves al entrar. Tiene tres capas, de arriba
          hacia abajo:
        </P>

        <H2>Tarjeta de salud presupuestaria</H2>
        <P>
          Una banda grande en color que te dice de un vistazo cómo está el
          presupuesto:
        </P>
        <Bullet>
          <Strong>Verde "Presupuesto saludable"</Strong>: queda más del 30%
          del disponible real. Operación normal.
        </Bullet>
        <Bullet>
          <Strong>Ámbar "Disponible bajo"</Strong>: queda entre 15% y 30%.
          Priorizar procesos críticos, evitar gasto no urgente.
        </Bullet>
        <Bullet>
          <Strong>Rojo "Agotamiento crítico"</Strong>: queda menos del 15%.
          Suspender nuevos compromisos hasta refrescar el presupuesto.
        </Bullet>
        <P>
          Debajo del rótulo, tres cifras pequeñas: vigente, disponible real
          y ejecutado SIAFI, cada una con su porcentaje.
        </P>

        <H2>4 tarjetas de indicadores (KPIs)</H2>
        <View style={styles.table}>
          {[
            ["Presupuesto vigente", "El total asignado al CHFM para el ejercicio actual."],
            ["Disponible real", "Lo que aún queda según el control interno. Incluye el porcentaje de ejecución."],
            ["Total PACC", "Suma de todas las líneas del PACC + cantidad de líneas."],
            ["Procesos activos", "Procesos en algún estado distinto de Pagado/Cerrado. Si hay observados, se resalta en ámbar."],
          ].map(([name, desc], i) => (
            <View key={i} style={[styles.trow, i === 3 ? styles.trowLast : {}]}>
              <Text style={[styles.tcell, { width: 120, fontWeight: 700 }]}>
                {name}
              </Text>
              <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
                {desc}
              </Text>
            </View>
          ))}
        </View>

        <H2>2 gráficos</H2>
        <Bullet>
          <Strong>Presupuesto por concepto</Strong>: barras horizontales
          comparando las 5 partidas del presupuesto. Al pasar el cursor
          sobre cada barra se ve el monto exacto.
        </Bullet>
        <Bullet>
          <Strong>Procesos por estado</Strong>: barras verticales con cuántos
          procesos hay en cada uno de los 11 estados del workflow. Si no hay
          procesos creados, muestra un mensaje.
        </Bullet>

        <Tip>
          El dashboard se actualiza cada vez que se recarga. Si cambias algo
          (crear partida, mover estado de proceso) y vuelves al dashboard,
          ya verás los números nuevos.
        </Tip>

        <Footer />
      </Page>

      {/* ====================== 6. Presupuesto ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>6. Presupuesto: gestión de partidas</H1>

        <P>
          Las partidas presupuestarias son los conceptos contra los que se
          ejecuta el gasto. El sistema viene precargado con cinco:
        </P>
        <Bullet>Presupuesto vigente</Bullet>
        <Bullet>Disponible SIAFI</Bullet>
        <Bullet>Disponible real estimado</Bullet>
        <Bullet>Comprometido referencial</Bullet>
        <Bullet>Ejecutado estimado</Bullet>

        <H2>Ver y editar una partida</H2>
        <Step n={1}>Entra al módulo <Strong>Presupuesto</Strong> en el menú.</Step>
        <Step n={2}>
          Verás la tabla con las partidas, su monto, una nota y la fecha de
          última actualización.
        </Step>
        <Step n={3}>
          En la última columna, pulsa el icono del lápiz (✏) en la fila que
          quieras editar.
        </Step>
        <Step n={4}>
          Se abre un cuadro de diálogo. El <Strong>concepto</Strong> está
          bloqueado (no se puede cambiar — es la clave). Edita el{" "}
          <Strong>monto</Strong> y opcionalmente la <Strong>nota</Strong>.
        </Step>
        <Step n={5}>
          Pulsa <Strong>Guardar cambios</Strong>. Verás un mensaje verde de
          confirmación.
        </Step>

        <H2>Crear una partida nueva</H2>
        <Step n={1}>
          En la página de Presupuesto, arriba a la derecha, pulsa{" "}
          <Strong>+ Nueva partida</Strong>.
        </Step>
        <Step n={2}>
          Llena: concepto (mínimo 3 caracteres, único), monto (no
          negativo), nota (opcional, hasta 500 caracteres).
        </Step>
        <Step n={3}>
          Pulsa <Strong>Crear</Strong>.
        </Step>

        <H2>Eliminar una partida</H2>
        <Warning>
          Solo el rol <Strong>Administrador</Strong> puede eliminar
          partidas. Es una acción irreversible que rompe el historial — usar
          con criterio. Si solo quieres "anular" una partida, mejor pon su
          monto en cero y deja una nota explicando.
        </Warning>
        <Step n={1}>
          En la fila de la partida, pulsa el icono de papelera (rojo).
        </Step>
        <Step n={2}>
          Confirma en el diálogo. Quedará registrado en la Auditoría con tu
          usuario y la fecha.
        </Step>

        <H2>Quién ve qué</H2>
        <View style={styles.table}>
          <View style={[styles.trow, styles.trowHeader]}>
            <Text style={[styles.tcell, { width: 90 }]}>Rol</Text>
            <Text style={[styles.tcell, { flex: 1 }]}>Acceso a Presupuesto</Text>
          </View>
          <View style={styles.trow}>
            <Text style={[styles.tcell, { width: 90 }]}>Admin</Text>
            <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
              Ver, crear, editar, eliminar
            </Text>
          </View>
          <View style={styles.trow}>
            <Text style={[styles.tcell, { width: 90 }]}>Operativo</Text>
            <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
              Ver, crear, editar (no eliminar)
            </Text>
          </View>
          <View style={[styles.trow, styles.trowLast]}>
            <Text style={[styles.tcell, { width: 90 }]}>Consulta / Gerencia</Text>
            <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
              No tienen acceso al módulo
            </Text>
          </View>
        </View>

        <Footer />
      </Page>

      {/* ====================== 7. PACC ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>7. PACC: buscar, filtrar y exportar</H1>

        <P>
          El PACC (Plan Anual de Compras y Contrataciones) es el catálogo
          institucional con las 593 líneas a contratar durante el año.
          Total programado: <Strong>L 260,297,850</Strong>.
        </P>

        <H2>Buscar</H2>
        <P>
          La barra de búsqueda arriba a la izquierda busca en{" "}
          <Strong>descripción</Strong>, <Strong>objeto presupuestario</Strong>{" "}
          y <Strong>número de línea</Strong>. Escribe lo que buscas y pulsa
          Enter (o el botón de lupa).
        </P>
        <P>Ejemplos:</P>
        <Bullet>
          <Code>botellones</Code> — encuentra la línea de botellones de agua.
        </Bullet>
        <Bullet>
          <Code>21200</Code> — todas las líneas del objeto 21200.
        </Bullet>
        <Bullet>
          <Code>licitacion publica</Code> — coincidencia parcial en la
          descripción.
        </Bullet>

        <H2>Filtros</H2>
        <P>Tres menús desplegables al lado de la búsqueda:</P>
        <Bullet>
          <Strong>Mes</Strong>: filtra por mes de la programación (1 a 12).
        </Bullet>
        <Bullet>
          <Strong>Modalidad</Strong>: HN-01 Licitación Pública, HN-02
          Licitación Privada, HN-03 Contratación Directa, HN-04 Compra
          Menor, HN-05 Cotización.
        </Bullet>
        <Bullet>
          <Strong>Fuente</Strong>: 11 Tesoro, 12 Recursos propios, etc.
        </Bullet>
        <P>
          Los filtros se combinan (modalidad = Compra Menor + mes = 3
          devuelve solo las compras menores programadas para marzo). Para
          limpiarlos, pulsa <Strong>Limpiar</Strong>.
        </P>

        <H2>Suma y paginación</H2>
        <P>
          Encima de la tabla hay una barra gris que muestra la suma de los
          montos visibles en la página actual. Cada página tiene 25 filas;
          navega con las flechas inferiores.
        </P>

        <H2>Exportar a CSV</H2>
        <Step n={1}>
          Aplica los filtros que quieras (o ninguno para exportar todo).
        </Step>
        <Step n={2}>
          Pulsa el botón <Strong>Exportar CSV</Strong> arriba a la derecha.
        </Step>
        <Step n={3}>
          Se descargará un archivo <Code>pacc_2026-MM-DD.csv</Code> con la
          codificación correcta para abrir directamente en Excel.
        </Step>

        <Tip>
          La descarga queda registrada en Auditoría con tu usuario y la
          cantidad de filas exportadas.
        </Tip>

        <Footer />
      </Page>

      {/* ====================== 8. Compras (2 páginas) ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>8. Compras: crear y avanzar procesos</H1>

        <P>
          Este es el módulo más importante del día a día. Cada proceso de
          compra se modela como un <Strong>expediente con código único</Strong>{" "}
          que recorre 11 estados desde "Solicitud creada" hasta "Cerrado".
        </P>

        <H2>Crear un proceso nuevo</H2>
        <Step n={1}>
          Entra a <Strong>Compras</Strong> y pulsa{" "}
          <Strong>+ Nuevo proceso</Strong> arriba a la derecha.
        </Step>
        <Step n={2}>
          Llena los campos obligatorios (marcados con *):
          {"\n"}—{" "}
          <Strong>Código</Strong>: usa el formato{" "}
          <Code>CHFM-2026-001</Code>, <Code>CHFM-2026-002</Code>, etc. Debe
          ser único.
          {"\n"}— <Strong>Monto</Strong>: en lempiras, número decimal.
          {"\n"}—{" "}
          <Strong>Descripción</Strong>: detalle del bien o servicio. Mínimo
          5 caracteres.
        </Step>
        <Step n={3}>
          Llena los opcionales si los tienes a mano:
          {"\n"}— <Strong>Línea PACC</Strong>: el número de línea del PACC
          al que corresponde (mira en el módulo PACC).
          {"\n"}— <Strong>Objeto presupuestario</Strong>: código de 5
          dígitos (ej. 21200).
          {"\n"}— <Strong>Responsable</Strong>: nombre del área o persona a
          cargo.
          {"\n"}— <Strong>Prioridad</Strong>: Normal / Media / Alta.
        </Step>
        <Step n={4}>
          Elige el <Strong>estado inicial</Strong>. Por defecto es{" "}
          <Code>Solicitud creada</Code>, pero si el proceso ya está más
          avanzado puedes empezar en otro estado.
        </Step>
        <Step n={5}>
          Pulsa <Strong>Crear proceso</Strong>. Te llevará directo a la
          página de detalle.
        </Step>

        <Tip>
          Cuando escribes el monto, el sistema te sugiere abajo del campo la{" "}
          <Strong>modalidad de contratación</Strong> que correspondería
          según los umbrales de Honduras. Si el monto está dentro de un 10%
          por debajo de un umbral, te aparece una advertencia ámbar — eso
          puede ser señal de fraccionamiento, revísalo.
        </Tip>

        <H2>Ver el detalle de un proceso</H2>
        <P>
          Pulsa cualquier código en la tabla. Se abre una página con tres
          pestañas:
        </P>
        <Bullet>
          <Strong>Información</Strong>: todos los campos del proceso, fechas
          de creación y actualización.
        </Bullet>
        <Bullet>
          <Strong>Historial</Strong>: cada cambio de estado con su
          comentario, fecha y autor. <Strong>No se puede editar ni borrar.</Strong>
        </Bullet>
        <Bullet>
          <Strong>Documentos</Strong>: archivos adjuntos (capítulo 9).
        </Bullet>
        <P>
          A la derecha verás un panel pequeño llamado{" "}
          <Strong>"Cambiar estado"</Strong> — solo si tienes permiso de
          escritura (admin o operativo).
        </P>

        <Footer />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <H1>8. Compras (continuación)</H1>

        <H2>Cambiar el estado de un proceso</H2>

        <P>
          Esta es la acción más sensible del sistema. <Strong>Siempre</Strong>{" "}
          requiere un comentario (mínimo 3 caracteres) que queda registrado
          en el historial inmutable.
        </P>

        <Step n={1}>
          En la página de detalle del proceso, en el panel "Cambiar estado",
          elige el <Strong>nuevo estado</Strong> en el desplegable.
        </Step>
        <Step n={2}>
          Escribe el <Strong>comentario obligatorio</Strong> explicando por
          qué cambia el estado (ej. "Línea PACC verificada con planificación",
          "Documentos firmados recibidos", "Observación: falta certificación
          presupuestaria, se devolvió").
        </Step>
        <Step n={3}>
          Pulsa <Strong>Registrar cambio de estado</Strong>.
        </Step>
        <Step n={4}>
          La página se recarga: el estado actual cambia, el contador de
          Historial sube en 1 y la Auditoría registra la acción.
        </Step>

        <Warning>
          No hay forma de "deshacer" un cambio de estado. Si te equivocaste,
          haz otro cambio de vuelta y explica en el comentario que fue un
          error. El historial conservará ambos eventos como prueba de
          honestidad.
        </Warning>

        <H2>Editar otros campos</H2>
        <P>
          Pulsa <Strong>Editar</Strong> arriba a la derecha de la página de
          detalle. Puedes modificar todos los campos excepto el estado (que
          se cambia por el panel lateral). Los cambios también quedan en
          Auditoría.
        </P>

        <H2>Filtros y búsqueda en el listado</H2>
        <P>
          En la página principal de Compras tienes una barra de búsqueda
          (busca por código, descripción, objeto o responsable) y dos
          filtros: <Strong>Estado</Strong> y <Strong>Prioridad</Strong>.
        </P>
        <P>
          Útil por ejemplo: "Estado = Observado" te muestra solo los
          procesos que necesitan atención. "Prioridad = Alta + Estado =
          Adjudicado" te muestra los importantes que ya están adjudicados
          esperando recepción.
        </P>

        <H2>Vista móvil</H2>
        <P>
          En el celular la tabla se transforma en tarjetas apiladas. Cada
          tarjeta muestra el código, descripción, monto, estado y
          prioridad. Toca cualquiera para entrar al detalle.
        </P>

        <Footer />
      </Page>

      {/* ====================== 9. Documentos ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>9. Documentos: subir y descargar archivos</H1>

        <P>
          Los documentos viven asociados a procesos de compra. Sirven para
          guardar requisiciones firmadas, cotizaciones, contratos,
          dictámenes, actas de adjudicación, etc.
        </P>

        <H2>Subir un archivo a un proceso</H2>
        <Step n={1}>
          Abre el proceso (Compras → click en el código).
        </Step>
        <Step n={2}>
          Pulsa la pestaña <Strong>Documentos</Strong>.
        </Step>
        <Step n={3}>
          Hay dos formas de subir:
          {"\n"}—{" "}
          <Strong>Arrastrar</Strong> el archivo desde el explorador y
          soltarlo en el área punteada.
          {"\n"}— Pulsar <Strong>elige uno</Strong> y buscarlo en tu
          computadora.
        </Step>
        <Step n={4}>
          Espera a ver el spinner "Subiendo…" y luego el mensaje verde de
          confirmación. El archivo aparece en la lista.
        </Step>

        <H3>Restricciones</H3>
        <Bullet>Tipos permitidos: PDF, JPG, PNG, WEBP, XLSX, XLS, DOCX, DOC.</Bullet>
        <Bullet>Tamaño máximo: 10 MB por archivo.</Bullet>
        <Bullet>
          Si el archivo se queda en "Subiendo…" más de 30 segundos, comprueba
          tu conexión y vuelve a intentar.
        </Bullet>

        <H2>Descargar un documento</H2>
        <Step n={1}>
          En la pestaña Documentos, pulsa el icono de descarga (flecha hacia
          abajo) a la derecha del archivo.
        </Step>
        <Step n={2}>
          Se abrirá una nueva pestaña con el archivo. Tu navegador lo
          descargará o lo mostrará según el tipo.
        </Step>

        <Note>
          Los enlaces de descarga son <Strong>firmados y duran 5 minutos</Strong>.
          No los compartas por WhatsApp — caducan. Si alguien necesita el
          archivo, dale acceso al sistema y que lo descargue él.
        </Note>

        <H2>Eliminar un documento</H2>
        <P>
          Solo el rol <Strong>Administrador</Strong> puede eliminar. En la
          fila del documento aparecerá el icono de papelera roja. Confirma
          en el diálogo. La eliminación queda registrada en Auditoría con
          el nombre del archivo.
        </P>

        <H2>Página global de Documentos</H2>
        <P>
          Hay también una página <Strong>/documentos</Strong> en el menú
          lateral que muestra los últimos 100 archivos subidos en todo el
          sistema, con un link al proceso al que pertenecen. Útil para ver
          la actividad reciente del archivo.
        </P>

        <Footer />
      </Page>

      {/* ====================== 10. Reportes ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>10. Reportes: PDF ejecutivo y CSVs</H1>

        <P>
          El módulo Reportes tiene cuatro tarjetas de descarga, cada una con
          su botón. Cualquier rol con acceso a Reportes (todos los roles
          excepto los inactivos) puede descargar.
        </P>

        <H2>Reporte Ejecutivo (PDF)</H2>
        <P>
          Un PDF de una página con: presupuesto vigente, disponible real,
          ejecución, total PACC, total de procesos y desglose por estado.
          Útil para reuniones de gerencia o entrega a auditoría externa.
        </P>
        <Step n={1}>En Reportes, primera tarjeta, pulsa <Strong>Descargar</Strong>.</Step>
        <Step n={2}>
          Se generará al vuelo (~2 segundos) y descargará como{" "}
          <Code>reporte_ejecutivo_2026-MM-DD.pdf</Code>.
        </Step>

        <H2>PACC (CSV)</H2>
        <P>
          Las 593 líneas del PACC con todos sus campos. Equivalente a
          exportar desde el módulo PACC sin filtros.
        </P>

        <H2>Procesos (CSV)</H2>
        <P>
          Todos los procesos de compra con: código, línea PACC, objeto,
          descripción, monto, estado, responsable, prioridad, fechas.
          Apto para análisis o pivot tables en Excel.
        </P>

        <H2>Presupuesto (CSV)</H2>
        <P>
          Las partidas presupuestarias con monto y nota.
        </P>

        <Tip>
          Los CSVs incluyen un BOM UTF-8 al inicio del archivo, así Excel
          abre las tildes correctamente sin reconfigurar nada. Si los abres
          en Google Sheets, también funcionará bien.
        </Tip>

        <View style={styles.note}>
          <Text>
            <Strong>Cada descarga queda registrada en Auditoría</Strong>{" "}
            con tu usuario, la fecha y el archivo descargado. Esto es
            intencional — el sistema necesita poder responder "quién bajó
            qué" en una eventual revisión.
          </Text>
        </View>

        <Footer />
      </Page>

      {/* ====================== 11. Importar ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>11. Importar: cargar CSV de SIAFI / HonduCompras</H1>

        <P>
          Cuando SIAFI publica un nuevo presupuesto o HonduCompras actualiza
          el PACC, podes cargar esos cambios masivamente desde el módulo{" "}
          <Strong>Importar</Strong> — sin tener que reescribir línea por
          línea.
        </P>

        <H2>Preparar el CSV</H2>
        <H3>Para Presupuesto (tab Presupuesto SIAFI)</H3>
        <P>El CSV debe tener exactamente estas columnas (orden flexible):</P>
        <Bullet><Code>concepto</Code> (texto, 3-150 caracteres)</Bullet>
        <Bullet><Code>monto</Code> (número, decimal con punto)</Bullet>
        <Bullet><Code>nota</Code> (texto, opcional)</Bullet>

        <H3>Para PACC (tab PACC HonduCompras)</H3>
        <P>Las 10 columnas del PACC:</P>
        <Bullet><Code>linea</Code>, <Code>objeto</Code>, <Code>descripcion</Code>, <Code>mes</Code></Bullet>
        <Bullet><Code>modalidad</Code>, <Code>fuente</Code>, <Code>valor</Code></Bullet>
        <Bullet><Code>unidad</Code>, <Code>eje</Code>, <Code>estado</Code></Bullet>

        <Note>
          Las columnas se identifican por nombre (no por posición). Pueden
          venir en cualquier orden. Si tu archivo viene con tildes en los
          nombres, el sistema los normaliza (minúsculas, sin espacios extra).
        </Note>

        <H2>Subir el archivo</H2>
        <Step n={1}>
          Entra a <Strong>Importar</Strong> y elige la pestaña correcta
          (Presupuesto o PACC).
        </Step>
        <Step n={2}>
          Pulsa <Strong>Selecciona un archivo CSV</Strong> y elige tu
          archivo.
        </Step>
        <Step n={3}>
          Verás un <Strong>preview de las primeras 5 filas</Strong>. Revisa
          que los datos se interpretaron bien:
          {"\n"}— Las columnas tienen los valores esperados.
          {"\n"}— Los montos son números (no "NULL" donde no debería).
          {"\n"}— Si hay columnas faltantes, aparece un aviso ámbar.
        </Step>
        <Step n={4}>
          Para PACC, decide si marcas <Strong>"Reemplazar TODO"</Strong>:
          {"\n"}—{" "}
          <Strong>Sin marcar</Strong>: añade las nuevas líneas a las que ya
          existen (puede haber duplicados si la fuente repite líneas).
          {"\n"}— <Strong>Marcado</Strong>: BORRA todas las 593 líneas
          actuales y carga las del CSV como nuevo PACC completo. Solo
          admin.
        </Step>
        <Step n={5}>
          Pulsa <Strong>Importar X filas</Strong>. Espera el mensaje verde
          con cuántas filas se insertaron y/o actualizaron.
        </Step>

        <Warning>
          La opción "Reemplazar TODO" en PACC borra los datos sin
          confirmación adicional. Es destructiva. Antes de usarla, exporta
          el PACC actual a CSV desde Reportes — así tienes un respaldo.
        </Warning>

        <H2>Errores comunes</H2>
        <Bullet>
          <Strong>"Ninguna fila válida"</Strong>: el CSV está mal formado o
          ninguna fila cumple las restricciones (monto inválido, concepto
          muy corto, etc.). Mira los primeros 10 errores que aparecen.
        </Bullet>
        <Bullet>
          <Strong>"Sin permiso"</Strong>: estás en un rol que no puede
          importar (Consulta o Gerencia). Cambia al rol correcto o pídele
          a un admin que lo haga.
        </Bullet>

        <Footer />
      </Page>

      {/* ====================== 12. Alertas ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>12. Alertas: detección de fraccionamiento</H1>

        <P>
          El <Strong>fraccionamiento</Strong> es dividir una compra grande
          en varias pequeñas para evitar la modalidad de contratación
          superior (más controles, más tiempo). Ej.: en vez de hacer una
          licitación pública de L 30M, hacer 3 compras directas de L 10M
          cada una.
        </P>

        <P>
          El módulo <Strong>Alertas</Strong> revisa automáticamente los
          procesos y marca posibles casos. <Strong>No es una acusación</Strong>{" "}
          — es una pista para que revises manualmente.
        </P>

        <H2>Criterios de detección</H2>
        <P>El sistema marca una alerta cuando se cumplen <Strong>todos</Strong>:</P>
        <Bullet>
          3 o más procesos con el <Strong>mismo responsable</Strong>.
        </Bullet>
        <Bullet>
          Mismo <Strong>prefijo de objeto presupuestario</Strong> (los
          primeros 3 dígitos: 212 = bienes consumibles, 391 = obras, etc.).
        </Bullet>
        <Bullet>
          En una ventana de <Strong>90 días</Strong>.
        </Bullet>
        <Bullet>
          La <Strong>suma total supera L 500,000</Strong>.
        </Bullet>

        <H2>Cómo interpretarlo</H2>
        <P>
          Cada alerta es una tarjeta con borde ámbar. Muestra:
        </P>
        <Bullet>El responsable y el prefijo de objeto.</Bullet>
        <Bullet>Total acumulado destacado a la derecha.</Bullet>
        <Bullet>Lista de procesos involucrados, cada uno linkeable.</Bullet>

        <P>Al revisar cada caso, pregúntate:</P>
        <Bullet>
          ¿Son procesos realmente independientes (urgencias en distintos
          momentos)? — Probablemente legítimo.
        </Bullet>
        <Bullet>
          ¿Son compras del mismo bien con timing sospechosamente cercano y
          montos justo bajo el umbral? — Investigar.
        </Bullet>
        <Bullet>
          Si hay duda, documenta tu evaluación en el comentario del próximo
          cambio de estado de uno de los procesos.
        </Bullet>

        <Note>
          Esta heurística es indicativa, no concluyente. La decisión final
          es siempre del revisor humano. La idea es que el sistema te ahorre
          el trabajo de buscar a mano.
        </Note>

        <H2>Quién ve las alertas</H2>
        <P>
          Solo los roles <Strong>Administrador</Strong> y{" "}
          <Strong>Gerencia</Strong>. No los ven Operativo ni Consulta.
        </P>

        <Footer />
      </Page>

      {/* ====================== 13. Auditoría ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>13. Auditoría: bitácora de acciones</H1>

        <P>
          Toda acción significativa que ocurre en el sistema queda registrada
          en una <Strong>bitácora inmutable</Strong>: quién, qué, cuándo,
          en qué módulo, y un detalle.
        </P>

        <Warning>
          <Strong>Nadie</Strong> — ni siquiera un administrador, ni siquiera
          un acceso técnico directo a la base de datos — puede modificar ni
          eliminar registros de la bitácora. Es una garantía de transparencia
          para cumplimiento institucional.
        </Warning>

        <H2>Qué se registra</H2>
        <Bullet>Inicios y cierres de sesión.</Bullet>
        <Bullet>Creación, edición, eliminación de partidas presupuestarias.</Bullet>
        <Bullet>Creación, edición y cambios de estado de procesos de compra.</Bullet>
        <Bullet>Subida y eliminación de documentos.</Bullet>
        <Bullet>Descargas de reportes CSV y PDF.</Bullet>
        <Bullet>Importaciones CSV.</Bullet>
        <Bullet>Alta y modificación de usuarios.</Bullet>

        <H2>Buscar en la bitácora</H2>
        <Step n={1}>
          Entra al módulo <Strong>Auditoría</Strong>.
        </Step>
        <Step n={2}>Usa los 4 filtros arriba para acotar:</Step>
        <Bullet>
          <Strong>Usuario</Strong>: ver solo lo que hizo una persona.
        </Bullet>
        <Bullet>
          <Strong>Módulo</Strong>: ver solo las acciones de un módulo
          (Compras, Presupuesto, etc.).
        </Bullet>
        <Bullet>
          <Strong>Desde / Hasta</Strong>: rango de fechas.
        </Bullet>
        <Step n={3}>
          La tabla muestra los eventos más recientes primero. Paginación de
          50 en 50.
        </Step>

        <H2>Exportar la auditoría a CSV</H2>
        <Step n={1}>
          Aplica los filtros que quieras.
        </Step>
        <Step n={2}>
          Pulsa <Strong>Exportar CSV</Strong> arriba a la derecha.
        </Step>
        <Step n={3}>
          Se descargará un CSV (hasta 10,000 filas) con las columnas
          fecha, usuario, módulo, acción y detalle.
        </Step>

        <P>
          Útil para reportar a auditoría externa o consolidar evidencia
          ante una observación.
        </P>

        <H2>Quién puede ver la auditoría</H2>
        <P>
          Solo <Strong>Administrador</Strong> y <Strong>Gerencia</Strong>.
          Operativo y Consulta no ven este módulo.
        </P>

        <Footer />
      </Page>

      {/* ====================== 14. Usuarios ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>14. Usuarios: alta, roles, reset de contraseña</H1>

        <P>
          Solo el rol <Strong>Administrador</Strong> ve este módulo. Sirve
          para dar de alta nuevos miembros del equipo, ajustar roles, y
          gestionar contraseñas.
        </P>

        <H2>Crear un usuario nuevo</H2>
        <Step n={1}>
          Entra a <Strong>Usuarios</Strong> y pulsa{" "}
          <Strong>+ Crear usuario</Strong>.
        </Step>
        <Step n={2}>
          Llena los campos:
          {"\n"}— <Strong>Nombre completo</Strong>: tal como aparecerá en
          la interfaz y en la bitácora.
          {"\n"}—{" "}
          <Strong>Usuario</Strong>: identificador corto (ej.{" "}
          <Code>jperez</Code>). Solo letras, números, puntos, guiones bajos
          y guiones medios.
          {"\n"}—{" "}
          <Strong>Correo institucional</Strong>: ej.{" "}
          <Code>jperez@chfm.gob.hn</Code>. Aquí llegará el reset si lo
          pierde.
          {"\n"}—{" "}
          <Strong>Contraseña inicial</Strong>: mínimo 6 caracteres
          (Supabase exige eso). Compártela por canal seguro — el usuario
          podrá cambiarla.
          {"\n"}— <Strong>Rol</Strong>: Administrador, Operativo, Consulta
          o Gerencia.
        </Step>
        <Step n={3}>
          Pulsa <Strong>Crear usuario</Strong>. El usuario aparece en la
          tabla y ya puede ingresar con esas credenciales.
        </Step>

        <H2>Cambiar el rol de un usuario</H2>
        <P>
          En la columna <Strong>Rol</Strong> de la tabla hay un menú
          desplegable inline. Cámbialo directamente — los cambios se aplican
          al instante y quedan en Auditoría.
        </P>

        <Warning>
          No puedes quitarte tu propio rol de Administrador ni desactivar tu
          propia cuenta. Esa protección existe para no dejar al sistema sin
          ningún admin por accidente. Si necesitas cambiar tu rol, otro
          admin debe hacerlo por ti.
        </Warning>

        <H2>Desactivar o reactivar</H2>
        <P>
          En la última columna, pulsa el menú "⋯" y elige{" "}
          <Strong>Desactivar</Strong>. El usuario no podrá ingresar pero
          sus acciones pasadas se conservan. Para reactivarlo, mismo menú
          → <Strong>Activar</Strong>.
        </P>

        <H2>Reset de contraseña</H2>
        <Step n={1}>
          En la fila del usuario, menú "⋯" → <Strong>Enviar reset de
          contraseña</Strong>.
        </Step>
        <Step n={2}>
          El sistema genera un enlace de recuperación y lo envía al correo
          del usuario. El admin no ve la nueva contraseña — eso es
          intencional.
        </Step>
        <Step n={3}>
          El usuario abre el enlace en su correo, define una contraseña
          nueva, y ya puede ingresar.
        </Step>

        <H2>Información visible en la tabla</H2>
        <Bullet>Nombre completo + usuario corto.</Bullet>
        <Bullet>Correo y si está confirmado.</Bullet>
        <Bullet>Rol actual.</Bullet>
        <Bullet>Estado (Activo / Inactivo).</Bullet>
        <Bullet>Último acceso (cuándo entró por última vez).</Bullet>

        <Footer />
      </Page>

      {/* ====================== Apéndice A: Roles ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>Apéndice A: Matriz de roles y permisos</H1>

        <View style={styles.table}>
          <View style={[styles.trow, styles.trowHeader]}>
            <Text style={[styles.tcell, { flex: 1.4 }]}>Módulo</Text>
            <Text style={[styles.tcell, { flex: 1 }]}>Admin</Text>
            <Text style={[styles.tcell, { flex: 1 }]}>Operativo</Text>
            <Text style={[styles.tcell, { flex: 1 }]}>Consulta</Text>
            <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
              Gerencia
            </Text>
          </View>
          {[
            ["Dashboard", "✓ ver", "✓ ver", "✓ ver", "✓ ver"],
            ["Presupuesto", "✓ ver + CRUD", "✓ ver + crear/editar", "—", "—"],
            ["PACC", "✓ ver + CRUD", "✓ ver + crear/editar", "—", "—"],
            ["Compras", "✓ ver + CRUD", "✓ ver + crear/editar", "—", "—"],
            ["Documentos", "✓ ver + subir + borrar", "✓ ver + subir", "—", "—"],
            ["Reportes", "✓ descargar", "✓ descargar", "✓ descargar", "✓ descargar"],
            ["Importar", "✓ + reemplazo total", "✓ (no reemplazo)", "—", "—"],
            ["Alertas", "✓", "—", "—", "✓"],
            ["Auditoría", "✓", "—", "—", "✓"],
            ["Usuarios", "✓ alta + roles + reset", "—", "—", "—"],
          ].map(([mod, ...perms], i) => (
            <View key={i} style={[styles.trow, i === 9 ? styles.trowLast : {}]}>
              <Text style={[styles.tcell, { flex: 1.4, fontWeight: 700 }]}>
                {mod}
              </Text>
              {perms.map((p, j) => (
                <Text
                  key={j}
                  style={[
                    styles.tcell,
                    {
                      flex: 1,
                      borderRightWidth: j === perms.length - 1 ? 0 : 1,
                    },
                  ]}
                >
                  {p}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <H2>Resumen rápido por rol</H2>

        <H3>Administrador</H3>
        <P>
          Control total. Único que puede gestionar usuarios, eliminar
          partidas presupuestarias, eliminar documentos y reemplazar el
          PACC completo. Es el rol del jefe del sistema.
        </P>

        <H3>Operativo (editor)</H3>
        <P>
          El día a día. Puede crear y editar partidas, líneas PACC, procesos
          de compra; subir documentos; importar (sin reemplazo). No ve
          alertas ni auditoría ni usuarios.
        </P>

        <H3>Consulta (viewer)</H3>
        <P>
          Solo lectura. Ve el Dashboard y puede descargar reportes. Útil
          para personal que necesita información sin riesgo de modificar
          datos.
        </P>

        <H3>Gerencia</H3>
        <P>
          Similar a Consulta pero con acceso adicional a Alertas y
          Auditoría. Pensado para roles de supervisión que necesitan ver
          la actividad sin operar.
        </P>

        <Note>
          La base de datos (Postgres) hace cumplir estos permisos a nivel
          de Row Level Security — aunque alguien intente manipular la
          interfaz, el servidor rechaza la operación si el rol no
          corresponde.
        </Note>

        <Footer />
      </Page>

      {/* ====================== Apéndice B: Estados ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>Apéndice B: Los 11 estados de un proceso</H1>

        <P>
          Los procesos de compra recorren estos estados en orden lógico
          (con saltos hacia atrás permitidos cuando hay observaciones).
        </P>

        <View style={styles.table}>
          <View style={[styles.trow, styles.trowHeader]}>
            <Text style={[styles.tcell, { width: 130 }]}>Estado</Text>
            <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
              Significado
            </Text>
          </View>
          {[
            ["Solicitud creada", "Estado inicial. La unidad solicitante registró la necesidad."],
            ["Validado PACC", "Se confirmó que la compra está prevista en el PACC y la línea coincide."],
            ["Validado presupuesto", "Se verificó disponibilidad presupuestaria contra la partida correspondiente."],
            ["Enviado a Tegucigalpa", "Expediente remitido a la unidad central de adquisiciones."],
            ["Observado", "Devuelto con observaciones que deben subsanarse antes de continuar."],
            ["Subsanado", "Se corrigieron las observaciones; el expediente vuelve al flujo normal."],
            ["En proceso UCP", "En manos de la Unidad de Compras y Presupuesto, ejecución del proceso de contratación."],
            ["Adjudicado", "Se adjudicó al proveedor seleccionado; falta formalizar y recibir."],
            ["Recibido", "El bien o servicio fue entregado y aceptado por el CHFM."],
            ["Pagado", "Pago efectuado al proveedor; el proceso operativamente concluye."],
            ["Cerrado", "Estado terminal de archivo. Ya no se modifica."],
          ].map(([state, desc], i) => (
            <View key={i} style={[styles.trow, i === 10 ? styles.trowLast : {}]}>
              <Text style={[styles.tcell, { width: 130, fontWeight: 700 }]}>
                {state}
              </Text>
              <Text style={[styles.tcell, { flex: 1, borderRightWidth: 0 }]}>
                {desc}
              </Text>
            </View>
          ))}
        </View>

        <Note>
          Los estados <Strong>Observado</Strong> y <Strong>Subsanado</Strong>{" "}
          son los únicos que admiten "saltos hacia atrás" en la práctica
          (Subsanado vuelve al estado del que vino). El resto es secuencial.
        </Note>

        <Tip>
          Recuerda que <Strong>cada cambio de estado requiere un comentario</Strong>{" "}
          obligatorio. Sé descriptivo — los comentarios son la documentación
          del expediente que verán futuros revisores.
        </Tip>

        <Footer />
      </Page>

      {/* ====================== Apéndice C: Glosario ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>Apéndice C: Glosario</H1>

        <H3>PACC</H3>
        <P>
          Plan Anual de Compras y Contrataciones. Documento obligatorio que
          cada institución pública prepara al inicio del año listando todo
          lo que planea adquirir.
        </P>

        <H3>SIAFI</H3>
        <P>
          Sistema de Administración Financiera Integrada. Sistema del Estado
          de Honduras donde se ejecuta y registra el gasto público.
        </P>

        <H3>HonduCompras</H3>
        <P>
          Plataforma del gobierno hondureño para publicar contrataciones
          públicas y procesos de licitación.
        </P>

        <H3>Objeto presupuestario</H3>
        <P>
          Código de 5 dígitos que clasifica el tipo de gasto según el
          clasificador nacional. Los primeros 3 dígitos agrupan categorías
          (21x bienes consumibles, 22x materiales, 39x obras, 42x equipo).
        </P>

        <H3>Modalidad de contratación</H3>
        <P>
          Forma jurídica del proceso de compra. Va desde "Compra Menor"
          (montos pequeños, simplificada) hasta "Licitación Pública"
          (montos altos, convocatoria abierta). El monto define la
          modalidad mínima aplicable.
        </P>

        <H3>Fraccionamiento</H3>
        <P>
          Práctica indebida de dividir una compra grande en varias
          pequeñas para evitar pasar a una modalidad de contratación más
          estricta. Está prohibido por la LCE (Ley de Contratación del
          Estado).
        </P>

        <H3>RLS (Row Level Security)</H3>
        <P>
          Tecnología de Postgres que aplica los permisos a nivel de la base
          de datos misma — no solo en la aplicación. Garantiza que aunque
          alguien acceda directamente a la base, solo verá las filas que
          le corresponden por su rol.
        </P>

        <H3>PWA (Progressive Web App)</H3>
        <P>
          Aplicación web que se puede instalar en el celular o
          computadora como si fuera una app nativa, con icono, modo offline
          básico y acceso desde la pantalla de inicio.
        </P>

        <H3>Service Worker</H3>
        <P>
          Componente técnico del PWA que vive en segundo plano del
          navegador. Permite que la app abra sin conexión y notifica cuando
          hay versión nueva disponible.
        </P>

        <H3>Auditoría inmutable</H3>
        <P>
          Bitácora de acciones que no puede ser modificada ni borrada por
          nadie, ni siquiera por un administrador del sistema. Garantía de
          transparencia contra alteración de evidencia.
        </P>

        <Footer />
      </Page>

      {/* ====================== Apéndice D: Soporte ====================== */}
      <Page size="LETTER" style={styles.page}>
        <H1>Apéndice D: Soporte y contacto</H1>

        <H2>Dónde está el código</H2>
        <P>
          El sistema es de código abierto y vive en:
        </P>
        <Link src="https://github.com/MGPersonalProfile/SAAS" style={styles.link}>
          https://github.com/MGPersonalProfile/SAAS
        </Link>
        <P>
          Cualquier desarrollador puede revisar exactamente cómo funciona
          internamente. Esto es relevante para auditorías técnicas: no hay
          "magia oculta".
        </P>

        <H2>Dónde corre el sistema</H2>
        <P>
          La aplicación está desplegada en Vercel (frontend) y Supabase
          (base de datos + autenticación + almacenamiento de documentos).
          URL actual:
        </P>
        <Link
          src="https://saas-two-opal.vercel.app"
          style={styles.link}
        >
          https://saas-two-opal.vercel.app
        </Link>

        <H2>Si encuentras un problema</H2>
        <Bullet>
          <Strong>Bug visual o de comportamiento</Strong>: anota qué hiciste
          paso a paso, qué esperabas y qué pasó. Si puedes, toma un
          pantallazo.
        </Bullet>
        <Bullet>
          <Strong>No puedo entrar</Strong>: prueba "¿Olvidaste tu
          contraseña?". Si no llega el email, contacta al admin del sistema.
        </Bullet>
        <Bullet>
          <Strong>El sistema no responde</Strong>: comprueba tu conexión a
          internet. Si la app instalada como PWA muestra "Sin conexión",
          espera unos minutos. Si tu wifi/datos funcionan en otras webs y
          la app sigue caída, posiblemente hay mantenimiento — espera 5-10
          minutos.
        </Bullet>

        <H2>Configuración pendiente para producción</H2>
        <P>
          Antes de pasar a usuarios reales hay tareas técnicas en{" "}
          <Code>HARDENING.md</Code> (en el código fuente): activar MFA,
          configurar Cloudflare, comprar dominio definitivo, política de
          contraseñas más estricta, backups con PITR.
        </P>

        <View style={{ ...styles.tip, marginTop: 30 }}>
          <Text style={{ fontWeight: 700, marginBottom: 4 }}>
            Recordatorio final
          </Text>
          <Text>
            El sistema es una herramienta — la calidad de la información
            que produce depende de la disciplina con la que se ingresa.
            Comentarios claros en los cambios de estado, descripciones
            completas en los procesos, y subir los documentos justificantes
            al expediente correcto son lo que convierte esta plataforma en
            una fuente de verdad útil para auditoría, gerencia y
            planificación.
          </Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
}
