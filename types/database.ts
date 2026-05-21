/**
 * Tipos de la base de datos del CHFM.
 *
 * Generados a mano siguiendo el esquema de `supabase/migrations/0001_schema.sql`.
 * Cuando se instale la Supabase CLI y se enlace el proyecto, sustituir por:
 *
 *   supabase gen types typescript --linked > types/database.ts
 *
 * Mientras tanto, mantener este archivo sincronizado con las migraciones.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "editor" | "viewer" | "gerencia";

export type BudgetTipo = "estatico" | "derivado";

export type ProcesoEstado =
  | "Solicitud creada"
  | "Validado PACC"
  | "Validado presupuesto"
  | "Enviado a Tegucigalpa"
  | "Observado"
  | "Subsanado"
  | "En proceso UCP"
  | "Adjudicado"
  | "Recibido"
  | "Pagado"
  | "Cerrado";

export type ProcesoPrioridad = "Normal" | "Media" | "Alta";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          role: UserRole;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
            isOneToOne: true;
          }
        ];
      };
      budget: {
        Row: {
          id: number;
          concepto: string;
          monto: number;
          nota: string | null;
          updated_at: string;
          updated_by: string | null;
          tipo: BudgetTipo;
        };
        Insert: {
          id?: number;
          concepto: string;
          monto?: number;
          nota?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          tipo?: BudgetTipo;
        };
        Update: {
          id?: number;
          concepto?: string;
          monto?: number;
          nota?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          tipo?: BudgetTipo;
        };
        Relationships: [];
      };
      budget_view: {
        Row: {
          id: number;
          concepto: string;
          monto: number;
          nota: string | null;
          updated_at: string;
          updated_by: string | null;
          tipo: BudgetTipo;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      pacc: {
        Row: {
          id: number;
          linea: string | null;
          objeto: string | null;
          descripcion: string | null;
          mes: string | null;
          modalidad: string | null;
          fuente: string | null;
          valor: number | null;
          unidad: string | null;
          eje: string | null;
          estado: string;
          search_vector: unknown | null;
        };
        Insert: {
          id?: number;
          linea?: string | null;
          objeto?: string | null;
          descripcion?: string | null;
          mes?: string | null;
          modalidad?: string | null;
          fuente?: string | null;
          valor?: number | null;
          unidad?: string | null;
          eje?: string | null;
          estado?: string;
        };
        Update: {
          id?: number;
          linea?: string | null;
          objeto?: string | null;
          descripcion?: string | null;
          mes?: string | null;
          modalidad?: string | null;
          fuente?: string | null;
          valor?: number | null;
          unidad?: string | null;
          eje?: string | null;
          estado?: string;
        };
        Relationships: [];
      };
      procesos: {
        Row: {
          id: number;
          codigo: string;
          linea_pacc: string | null;
          pacc_id: number | null;
          objeto: string | null;
          descripcion: string | null;
          monto: number;
          estado: ProcesoEstado;
          responsable: string | null;
          prioridad: ProcesoPrioridad;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          codigo: string;
          linea_pacc?: string | null;
          pacc_id?: number | null;
          objeto?: string | null;
          descripcion?: string | null;
          monto?: number;
          estado?: ProcesoEstado;
          responsable?: string | null;
          prioridad?: ProcesoPrioridad;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          codigo?: string;
          linea_pacc?: string | null;
          pacc_id?: number | null;
          objeto?: string | null;
          descripcion?: string | null;
          monto?: number;
          estado?: ProcesoEstado;
          responsable?: string | null;
          prioridad?: ProcesoPrioridad;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "procesos_pacc_id_fkey";
            columns: ["pacc_id"];
            referencedRelation: "pacc";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      proceso_historial: {
        Row: {
          id: number;
          proceso_id: number;
          estado_anterior: ProcesoEstado | null;
          estado_nuevo: ProcesoEstado;
          comentario: string | null;
          changed_at: string;
          changed_by: string | null;
        };
        Insert: {
          id?: number;
          proceso_id: number;
          estado_anterior?: ProcesoEstado | null;
          estado_nuevo: ProcesoEstado;
          comentario?: string | null;
          changed_at?: string;
          changed_by?: string | null;
        };
        Update: {
          id?: number;
          proceso_id?: number;
          estado_anterior?: ProcesoEstado | null;
          estado_nuevo?: ProcesoEstado;
          comentario?: string | null;
          changed_at?: string;
          changed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "proceso_historial_proceso_id_fkey";
            columns: ["proceso_id"];
            referencedRelation: "procesos";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      documentos: {
        Row: {
          id: number;
          proceso_id: number;
          nombre: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          id?: number;
          proceso_id: number;
          nombre: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          id?: number;
          proceso_id?: number;
          nombre?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documentos_proceso_id_fkey";
            columns: ["proceso_id"];
            referencedRelation: "procesos";
            referencedColumns: ["id"];
            isOneToOne: false;
          }
        ];
      };
      audit_log: {
        Row: {
          id: number;
          fecha: string;
          usuario_id: string | null;
          username: string | null;
          accion: string;
          modulo: string;
          detalle: string | null;
          ip: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: number;
          fecha?: string;
          usuario_id?: string | null;
          username?: string | null;
          accion: string;
          modulo: string;
          detalle?: string | null;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_editor_or_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      can_view_audit: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_authenticated_active: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      change_proceso_estado: {
        Args: {
          p_proceso_id: number;
          p_estado_nuevo: ProcesoEstado;
          p_comentario?: string | null;
        };
        Returns: void;
      };
      budget_derivado_value: {
        Args: { p_concepto: string };
        Returns: number;
      };
    };
    Enums: {
      user_role: UserRole;
      proceso_estado: ProcesoEstado;
      proceso_prioridad: ProcesoPrioridad;
      budget_tipo: BudgetTipo;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
