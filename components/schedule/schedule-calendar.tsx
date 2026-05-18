"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  RotateCcw,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MediaType = "image" | "video";

interface ServiceItem {
  id: string;
  label: string;
}

interface ScheduleEntry {
  id: string;
  date: string;
  serviceId: string;
  mediaType: MediaType;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const DATABASE_NAME = "mkt-tools-schedule";
const DATABASE_VERSION = 1;
const STORE_NAME = "schedule_entries";

const services: ServiceItem[] = [
  { id: "phun-xam", label: "Đăng dịch vụ Phun Xăm" },
  { id: "giam-beo", label: "Đăng dịch vụ Giảm Béo" },
  { id: "hoi-nach", label: "Đăng dịch vụ Hôi Nách" },
  { id: "chung", label: "Đăng dịch vụ Chung" },
];

const weekdayLabels = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

function openScheduleDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("date", "date");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getFromStore<T>(db: IDBDatabase, id: string) {
  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

function putToStore(db: IDBDatabase, entry: ScheduleEntry) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const request = transaction.objectStore(STORE_NAME).put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatFullDateLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getWeekStart(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);

  const day = next.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + offset);

  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getEntryId(date: string, serviceId: string) {
  return `${date}|${serviceId}`;
}

function getRandomMediaType(): MediaType {
  return Math.random() >= 0.5 ? "video" : "image";
}

function createEntry(date: string, serviceId: string): ScheduleEntry {
  const now = new Date().toISOString();

  return {
    id: getEntryId(date, serviceId),
    date,
    serviceId,
    mediaType: getRandomMediaType(),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function ScheduleCalendar() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [entries, setEntries] = useState<Record<string, ScheduleEntry>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );
  const todayKey = formatDateKey(new Date());

  const completedCount = Object.values(entries).filter((entry) => entry.completed).length;
  const totalCount = weekDays.length * services.length;
  const weekEnd = weekDays[6];

  useEffect(() => {
    let cancelled = false;

    async function loadWeek() {
      setIsLoading(true);
      setError(null);
      setEntries({});

      try {
        const db = await openScheduleDb();
        const nextEntries: Record<string, ScheduleEntry> = {};

        for (const day of weekDays) {
          const date = formatDateKey(day);

          for (const service of services) {
            const id = getEntryId(date, service.id);
            const storedEntry = await getFromStore<ScheduleEntry>(db, id);
            const entry = storedEntry ?? createEntry(date, service.id);

            if (!storedEntry) {
              await putToStore(db, entry);
            }

            nextEntries[id] = entry;
          }
        }

        db.close();

        if (!cancelled) {
          setEntries(nextEntries);
        }
      } catch {
        if (!cancelled) {
          setError("Không thể mở IndexedDB để lưu lịch trình.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWeek();

    return () => {
      cancelled = true;
    };
  }, [weekDays]);

  async function updateEntry(entry: ScheduleEntry, completed: boolean) {
    const updatedEntry = {
      ...entry,
      completed,
      updatedAt: new Date().toISOString(),
    };

    setSavingId(entry.id);
    setEntries((current) => ({
      ...current,
      [entry.id]: updatedEntry,
    }));

    try {
      const db = await openScheduleDb();
      await putToStore(db, updatedEntry);
      db.close();
    } catch {
      setEntries((current) => ({
        ...current,
        [entry.id]: entry,
      }));
      setError("Không thể lưu trạng thái checkbox vào IndexedDB.");
    } finally {
      setSavingId(null);
    }
  }

  function goToPreviousWeek() {
    setWeekStart((current) => addDays(current, -7));
  }

  function goToNextWeek() {
    setWeekStart((current) => addDays(current, 7));
  }

  function goToCurrentWeek() {
    setWeekStart(getWeekStart(new Date()));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="size-4" />
            {formatFullDateLabel(weekStart)} - {formatFullDateLabel(weekEnd)}
          </div>
          <p className="text-sm text-muted-foreground">
            Đã hoàn thành {completedCount}/{totalCount} đầu việc trong tuần.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="size-4" />
            Tuần trước
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={goToCurrentWeek}>
            <RotateCcw className="size-4" />
            Tuần này
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={goToNextWeek}>
            Tuần sau
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-7">
        {weekDays.map((day, dayIndex) => {
          const date = formatDateKey(day);
          const isToday = date === todayKey;
          const completedInDay = services.filter((service) => {
            const entry = entries[getEntryId(date, service.id)];
            return entry?.completed;
          }).length;

          return (
            <Card
              key={date}
              className={cn(
                "min-w-0 rounded-lg",
                isToday && "ring-2 ring-primary/35"
              )}
            >
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-start justify-between gap-3">
                  <span className="space-y-0.5">
                    <span className="block text-sm font-semibold">{weekdayLabels[dayIndex]}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {formatDateLabel(day)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      completedInDay === services.length
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {completedInDay}/{services.length}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {services.map((service) => {
                  const entry = entries[getEntryId(date, service.id)];
                  const checked = entry?.completed ?? false;
                  const isSaving = savingId === entry?.id;
                  const MediaIcon = entry?.mediaType === "video" ? Video : ImageIcon;

                  return (
                    <label
                      key={service.id}
                      className={cn(
                        "flex min-h-20 cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm shadow-xs transition-colors",
                        checked && "border-primary/40 bg-primary/5",
                        isLoading && "cursor-wait opacity-70"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 size-4 rounded border-input accent-primary"
                        checked={checked}
                        disabled={!entry || isLoading || isSaving}
                        onChange={(event) => entry && updateEntry(entry, event.target.checked)}
                      />
                      <span className="min-w-0 flex-1 space-y-2">
                        <span className="block leading-5 text-foreground">{service.label}</span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <MediaIcon className="size-3.5" />
                          {entry?.mediaType === "video" ? "Đăng video" : "Đăng ảnh"}
                        </span>
                      </span>
                      {checked && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />}
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
