import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <Link href="/" className="font-bold text-primary">
            CHFM · Sistema de Gestión
          </Link>
          <div className="flex items-center gap-3">
            {hasEnvVars ? (
              <Suspense>
                <AuthButton />
              </Suspense>
            ) : (
              <span className="text-xs text-muted-foreground">
                Configura las variables de entorno
              </span>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <section className="flex-1 mx-auto w-full max-w-5xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido al sistema CHFM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p>
              Plataforma institucional para la gestión presupuestaria, el PACC
              y los procesos de compra del Centro Hospitalario.
            </p>
            <p className="text-muted-foreground">
              Si ya tienes una cuenta, ingresa con tu correo y contraseña. Si
              no, solicita acceso y un administrador te asignará el rol
              correspondiente.
            </p>
            <div className="flex gap-2 pt-2">
              <Button asChild>
                <Link href="/auth/login">Ingresar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">Solicitar acceso</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground">
          CHFM · Sistema de Gestión
        </div>
      </footer>
    </main>
  );
}
