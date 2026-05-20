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
import { importBudget, importPacc } from "./actions";

export const metadata = { title: "Importar datos" };

export default async function ImportarPage() {
  await requireModule("importar");

  return (
    <>
      <PageHeader
        title="Importar datos"
        description="Carga CSV desde SIAFI (presupuesto) o HonduCompras (PACC). El sistema valida cada fila antes de aplicar."
      />

      <Tabs defaultValue="presupuesto" className="w-full">
        <TabsList>
          <TabsTrigger value="presupuesto">Presupuesto (SIAFI)</TabsTrigger>
          <TabsTrigger value="pacc">PACC (HonduCompras)</TabsTrigger>
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
                se mantienen intactas.
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
                Sin "reemplazar": inserta como filas nuevas (no upsert).
                Con "reemplazar": elimina las 593 actuales y carga el nuevo
                set completo. Solo admin puede reemplazar.
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
      </Tabs>
    </>
  );
}
