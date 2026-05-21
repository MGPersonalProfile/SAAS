/**
 * Layout compartido para todas las rutas de auth.
 * Centra el contenido en pantalla y añade landmark `<main>` (accesibilidad).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
