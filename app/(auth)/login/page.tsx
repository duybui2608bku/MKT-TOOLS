"use client";

import { useState, useTransition } from "react";
import { login } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 w-72">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">MKT Tools</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nhập mã PIN để tiếp tục</p>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-4 rounded-full border-2 transition-all duration-150",
                i < pin.length
                  ? "bg-foreground border-foreground scale-110"
                  : "bg-transparent border-muted-foreground/40"
              )}
            />
          ))}
        </div>
        <p
          className={cn(
            "text-sm text-destructive -mt-4 transition-opacity duration-200",
            error ? "opacity-100" : "opacity-0"
          )}
        >
          {error || "‎"}
        </p>
        <div className="grid grid-cols-3 gap-3 w-full">
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
                  "flex h-16 items-center justify-center rounded-2xl text-xl font-medium transition-all duration-100 select-none",
                  "active:scale-95",
                  isEmpty
                    ? "pointer-events-none"
                    : isBackspace
                      ? "bg-muted text-muted-foreground hover:bg-muted/70"
                      : "bg-muted text-foreground hover:bg-accent hover:text-accent-foreground",
                  isPending && !isEmpty && "opacity-40 pointer-events-none"
                )}
              >
                {key}
              </button>
            );
          })}
        </div>
        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse">Đang xác thực...</p>
        )}
      </div>
    </div>
  );
}
