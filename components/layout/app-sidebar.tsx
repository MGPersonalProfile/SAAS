"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ListChecks,
  ShoppingCart,
  FileBarChart,
  Folder,
  Users,
  ShieldCheck,
  AlertTriangle,
  Upload,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  MODULE_LABELS,
  PERMISSIONS,
  type Module,
} from "@/lib/auth/permissions";
import type { UserRole } from "@/types/database";
import { UserMenu } from "./user-menu";

const MODULE_ICONS: Record<Module, LucideIcon> = {
  dashboard: LayoutDashboard,
  presupuesto: Wallet,
  pacc: ListChecks,
  compras: ShoppingCart,
  reportes: FileBarChart,
  documentos: Folder,
  alertas: AlertTriangle,
  importar: Upload,
  usuarios: Users,
  auditoria: ShieldCheck,
};

const NAV_ORDER: Module[] = [
  "dashboard",
  "presupuesto",
  "pacc",
  "compras",
  "documentos",
  "reportes",
  "alertas",
  "auditoria",
  "importar",
  "usuarios",
];

interface AppSidebarProps {
  role: UserRole;
  username: string;
  fullName: string | null;
}

export function AppSidebar({ role, username, fullName }: AppSidebarProps) {
  const pathname = usePathname();
  const allowed = PERMISSIONS[role];

  const items = NAV_ORDER.filter((m) => allowed.has(m)).map((m) => ({
    module: m,
    label: MODULE_LABELS[m],
    href: `/${m}`,
    Icon: MODULE_ICONS[m],
  }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            CH
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">CHFM</span>
            <span className="truncate text-xs opacity-70">
              Sistema de Gestión
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ module, label, href, Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <SidebarMenuItem key={module}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                    >
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu username={username} fullName={fullName} role={role} />
      </SidebarFooter>
    </Sidebar>
  );
}
