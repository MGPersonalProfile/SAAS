import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Sin conexión",
};

/**
 * Página cacheada por el service worker durante install. Se sirve cuando el
 * navegador no puede llegar a la red. No requiere auth ni datos.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <WifiOff className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-primary">CHFM</h1>
            <p className="text-sm font-medium">Sin conexión</p>
            <p className="text-sm text-muted-foreground">
              No se puede conectar con el sistema en este momento. Comprueba tu
              red e intenta de nuevo.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Link>
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Los datos no se sincronizan offline. Las acciones que hagas
            requerirán conexión para guardarse.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
