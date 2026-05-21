import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { CsvImporter } from "@/components/importar/csv-importer";
import { requireModule } from "@/lib/auth";
import { importBudget, importPacc, importProcesos } from "./actions";

export const metadata = { title: "Importar datos" };

export default async function ImportarPage() {
  await requireModule("importar");

  return (
    <>
      <PageHeader
        title="Importar datos"
        description="Carga CSV desde SIAFI (presupuesto), HonduCompras (PACC) o el sistema de compras. El importador valida cada fila y hace upsert por clave natural."
      />

      <Tabs defaultValue="presupuesto" className="w-full">
        <TabsList>
          <TabsTrigger value="presupuesto">Presupuesto (SIAFI)</TabsTrigger>
          <TabsTrigger value="pacc">PACC (HonduCompras)</TabsTrigger>
          <TabsTrigger value="procesos">Procesos de compra</TabsTrigger>
        </TabsList>

        <TabsContent value="presupuesto" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Importar partidas presupuestarias
              </CardTitle>
              <CardDescription>
                Hace UPSERT por <code>concepto</code>: si ya existe lo
                actualiza, si no lo crea. Las partidas no incluidas en el CSV
                se mantienen intactas. Las 3 partidas derivadas (calculadas
                desde procesos) no se ven afectadas por el importador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvImporter
                expectedColumns={["concepto", "monto", "nota"]}
                numericColumns={["monto"]}
                action={importBudget}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pacc" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Importar líneas del PACC</CardTitle>
              <CardDescription>
                Hace <strong>UPSERT por <code>linea</code></strong>: si la
                línea ya existe la actualiza con los valores nuevos, si no la
                inserta. Si el archivo tiene la misma línea repetida internamente,
                se conserva la última ocurrencia y se reporta como aviso. Con
                "reemplazar" borra TODO el PACC actual antes de cargar (solo admin).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvImporter
                expectedColumns={[
                  "linea",
                  "objeto",
                  "descripcion",
                  "mes",
                  "modalidad",
                  "fuente",
                  "valor",
                  "unidad",
                  "eje",
                  "estado",
                ]}
                numericColumns={["valor"]}
                action={importPacc}
                supportsReplaceAll
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procesos" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Importar procesos de compra
              </CardTitle>
              <CardDescription>
                Hace <strong>UPSERT por <code>codigo</code></strong>: cada
                proceso se identifica por su código único. Si la columna{" "}
                <code>linea_pacc</code> coincide con una línea existente del
                PACC, se vincula automáticamente y el monto entra al balance
                según el estado (comprometido o ejecutado). Los estados o
                prioridades no reconocidos caen al valor por defecto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CsvImporter
                expectedColumns={[
                  "codigo",
                  "linea_pacc",
                  "objeto",
                  "descripcion",
                  "monto",
                  "estado",
                  "responsable",
                  "prioridad",
                ]}
                numericColumns={["monto"]}
                action={importProcesos}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
