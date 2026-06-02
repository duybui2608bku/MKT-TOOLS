"use client";

import { useState, useTransition } from "react";
import { login } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileText } from "lucide-react";

const PIN_LENGTH = 4;

const keys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleKey(key: string) {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    if (key === "") return;
    if (pin.length >= PIN_LENGTH) return;

    const next = pin + key;
    setPin(next);
    setError("");

    if (next.length === PIN_LENGTH) {
      startTransition(async () => {
        const fd = new FormData();
        fd.set("pin", next);
        const result = await login(fd);
        if (result?.error) {
          toast.error(result.error);
          setError(result.error);
          setPin("");
        }
      });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 w-80">
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-sm mb-4">
            <FileText size={24} className="fill-primary/20" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">MKT TOOLS</h1>
          <p className="text-sm text-muted-foreground">Nhập mã PIN để tiếp tục</p>
        </div>

        <div className="flex gap-5">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-4 rounded-full border-2 transition-all duration-300",
                i < pin.length
                  ? "bg-primary border-primary scale-125 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  : "bg-transparent border-muted-foreground/30"
              )}
            />
          ))}
        </div>

        <div className="h-6">
          <p
            className={cn(
              "text-sm font-medium text-destructive transition-all duration-200",
              error ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}
          >
            {error}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {keys.flat().map((key, i) => {
            const isEmpty = key === "";
            const isBackspace = key === "⌫";
            return (
              <button
                key={i}
                onClick={() => handleKey(key)}
                disabled={isEmpty || isPending}
                aria-label={isBackspace ? "Xóa" : key}
                className={cn(
                  "flex h-20 items-center justify-center rounded-3xl text-2xl font-semibold transition-all duration-200 select-none",
                  "active:scale-90",
                  isEmpty
                    ? "pointer-events-none opacity-0"
                    : isBackspace
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                      : "bg-card border border-border/50 text-foreground hover:bg-primary shadow-sm hover:text-primary-foreground hover:scale-105 active:bg-primary/90",
                  isPending && !isEmpty && "opacity-40 pointer-events-none"
                )}
              >
                {key}
              </button>
            );
          })}
        </div>

        <div className="h-4">
          {isPending && (
            <div className="flex items-center gap-2 text-xs font-medium text-primary animate-pulse">
              <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <div className="size-1.5 rounded-full bg-primary animate-bounce" />
              <span>Đang xác thực...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
