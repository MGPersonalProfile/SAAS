import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">¡Solicitud enviada!</CardTitle>
        <CardDescription>Revisa tu correo para confirmar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Te enviamos un correo de confirmación. Haz clic en el enlace para
          activar tu cuenta.
        </p>
        <p>
          Tu cuenta se crea con rol de <strong>Consulta</strong>. Un
          administrador deberá asignarte el rol correspondiente para que
          puedas acceder a los módulos restantes.
        </p>
      </CardContent>
    </Card>
  );
}
