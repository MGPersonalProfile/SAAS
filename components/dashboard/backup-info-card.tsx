import { Database, ShieldCheck, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BackupInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-muted-foreground" />
          Respaldo y continuidad de datos
        </CardTitle>
        <CardDescription>
          Cómo se preserva la información del sistema mientras estés en el
          plan gratuito de Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-medium">Snapshot diario gestionado</p>
            <p className="text-muted-foreground text-xs">
              Supabase realiza un snapshot diario del proyecto en el plan
              gratuito (retención corta). El histórico de cambios de estado
              de cada proceso se conserva en <code>proceso_historial</code>
              y la bitácora de acciones en <code>audit_log</code>, ambas
              append-only por trigger.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="font-medium">Exportes manuales</p>
            <p className="text-muted-foreground text-xs">
              Cada módulo (Presupuesto, PACC, Compras) permite exportar a CSV
              el dataset actual con los filtros aplicados. Sirve como respaldo
              externo verificable y como entrega oficial entre áreas.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground border-t pt-2">
          En producción, la recomendación es habilitar PITR (Point-In-Time
          Recovery) de Supabase, que reconstruye el estado de la BD en
          cualquier instante de los últimos 7 días. Requiere plan de pago.
        </p>
      </CardContent>
    </Card>
  );
}
