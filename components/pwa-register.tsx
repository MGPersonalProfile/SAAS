"use client";

import { useEffect, useState } from "react";
import { Download, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "chfm.pwa.installDismissedAt";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage no disponible (private browsing) — ignorar.
  }
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [updateReady, setUpdateReady] = useState<ServiceWorkerRegistration | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV === "development") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Polling de updates cada hora.
          setInterval(() => reg.update().catch(() => undefined), 60 * 60 * 1000);

          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (
                installing.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setUpdateReady(reg);
              }
            });
          });
        })
        .catch(() => undefined);

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      if (wasRecentlyDismissed()) return;
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    if (window.matchMedia?.("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("Instalando CHFM en tu dispositivo…");
    } else {
      markDismissed();
    }
    setInstallPrompt(null);
  }

  function handleDismiss() {
    markDismissed();
    setInstallPrompt(null);
  }

  function handleUpdate() {
    if (!updateReady?.waiting) {
      window.location.reload();
      return;
    }
    updateReady.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  if (updateReady) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border bg-card p-4 shadow-lg">
        <p className="text-sm font-medium">Nueva versión disponible</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Recarga para usar la última versión del sistema.
        </p>
        <div className="mt-3 flex gap-2">
          <Button onClick={handleUpdate} size="sm" className="flex-1">
            <RefreshCw className="mr-1 h-4 w-4" />
            Recargar
          </Button>
          <Button
            onClick={() => setUpdateReady(null)}
            variant="outline"
            size="sm"
          >
            Después
          </Button>
        </div>
      </div>
    );
  }

  if (installed || !installPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border bg-card p-3 shadow-lg flex items-center gap-2">
      <Button onClick={handleInstall} size="sm" className="gap-1 flex-1">
        <Download className="h-4 w-4" />
        <span>Instalar app</span>
      </Button>
      <Button
        onClick={handleDismiss}
        variant="ghost"
        size="icon"
        aria-label="Descartar"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
