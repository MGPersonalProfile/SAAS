"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, KeyRound, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserForm } from "./user-form";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { USER_ROLES } from "@/lib/db/users-schema";
import {
  sendPasswordReset,
  setUserActive,
  setUserRole,
} from "@/app/(app)/usuarios/actions";
import { dateTime } from "@/lib/format";
import type { UserRole } from "@/types/database";
import type { UserRow } from "@/lib/db/users";

interface UsersTableProps {
  rows: UserRow[];
  currentUserId: string;
}

export function UsersTable({ rows, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleRoleChange(userId: string, role: UserRole) {
    startTransition(async () => {
      const result = await setUserRole(userId, role);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Rol actualizado");
      router.refresh();
    });
  }

  function handleToggleActive(user: UserRow) {
    startTransition(async () => {
      const result = await setUserActive(user.id, !user.active);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(user.active ? "Usuario desactivado" : "Usuario activado");
      router.refresh();
    });
  }

  function handlePasswordReset(user: UserRow) {
    if (!user.email) return toast.error("Sin email");
    startTransition(async () => {
      const result = await sendPasswordReset(user.email!);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Enlace generado");
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "usuario" : "usuarios"}
        </p>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Crear usuario
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="hidden md:table-cell">Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => {
              const display = u.full_name || u.username;
              const initials = display
                .split(/\s+/)
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const isSelf = u.id === currentUserId;

              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {display}
                          {isSelf && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (tú)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{u.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {u.email ?? "—"}
                    {!u.email_confirmed && u.email && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        no confirmado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) =>
                        handleRoleChange(u.id, v as UserRole)
                      }
                      disabled={isSelf}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        {ROLE_LABELS[u.role]}
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.active ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 font-normal">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {u.last_sign_in_at ? dateTime(u.last_sign_in_at) : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePasswordReset(u)}
                          disabled={!u.email}
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          Enviar reset de contraseña
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(u)}
                          disabled={isSelf}
                        >
                          {u.active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <UserForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
