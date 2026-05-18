"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileVideo,
  Film,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceOptions, toolEndpoints, type ServiceOption } from "@/lib/tools/config";
import { cn } from "@/lib/utils";

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function readResponseMessage(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as {
      message?: string;
      error?: string;
    };
  } catch {
    return {
      message: text,
    };
  }
}

export function ReelsForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef<string | null>(null);
  const [content, setContent] = useState("");
  const [service, setService] = useState<ServiceOption>("TẤT CẢ");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  const trimmedContent = content.trim();
  const canSubmit = trimmedContent.length > 0 && videoFile !== null && !isSubmitting;

  function setVideo(file: File | null) {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }

    const nextUrl = file ? URL.createObjectURL(file) : null;
    videoUrlRef.current = nextUrl;
    setVideoFile(file);
    setVideoUrl(nextUrl);
  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (file && !file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn đúng định dạng video.");
      event.target.value = "";
      return;
    }

    setVideo(file);
  }

  function clearVideo() {
    setVideo(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedContent) {
      toast.error("Vui lòng nhập nội dung bài đăng.");
      return;
    }

    if (!videoFile) {
      toast.error("Vui lòng tải lên video Reels.");
      return;
    }

    const formData = new FormData();
    formData.append("content", trimmedContent);
    formData.append("service", service);
    formData.append("file_size", String(videoFile.size));
    formData.append("media", videoFile, videoFile.name);

    setIsSubmitting(true);

    try {
      const response = await fetch(toolEndpoints.reelsWebhookUrl, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      const payload = await readResponseMessage(response);

      if (!response.ok) {
        throw new Error(payload?.error ?? payload?.message ?? "Đăng Reels thất bại.");
      }

      toast.success(payload?.message ?? "Đã gửi yêu cầu đăng Reels.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng Reels thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(340px,3fr)]">
      <Card className="min-w-0">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Thông tin bài đăng</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="reels-content">
                  Nội dung
                </label>
                <textarea
                  id="reels-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Nhập caption cho bài đăng Reels..."
                  className="min-h-56 w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm leading-6 text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{trimmedContent.length} ký tự</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="reels-service">
                  Cấu hình đăng
                </label>
                <Select
                  value={service}
                  onValueChange={(value) => setService(value as ServiceOption)}
                  items={serviceOptions.map((option) => ({
                    label: option,
                    value: option,
                  }))}
                >
                  <SelectTrigger id="reels-service">
                    <SelectValue placeholder="Chọn cấu hình" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">Video Reels</span>
              </div>
              <label
                htmlFor="reels-video"
                className={cn(
                  "group flex min-h-44 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/25 px-5 py-8 text-center shadow-xs transition-all",
                  "hover:border-ring hover:bg-muted/45 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
                )}
              >
                <input
                  ref={inputRef}
                  className="sr-only"
                  id="reels-video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                <div className="flex size-12 items-center justify-center rounded-full bg-background ring-1 ring-border transition-transform group-hover:scale-105">
                  <CloudUpload className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    Chọn video Reels
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Click vào vùng này để tải video lên.
                  </div>
                </div>
              </label>

              {videoFile && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileVideo className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {videoFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(videoFile.size)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearVideo}
                    aria-label="Xóa video"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-4" />
              </div>
              <Button type="submit" size="lg" disabled={!canSubmit} className="sm:min-w-36">
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Đăng Reels
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="sticky top-6 min-w-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Preview Reels FB</CardTitle>
          <CardDescription>Giao diện mô phỏng bài Reels trước khi đăng.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-lg bg-neutral-950 text-white ring-1 ring-border shadow-2xl">
            <div className="relative aspect-[9/16] bg-neutral-900">
              {videoUrl ? (
                <video className="h-full w-full object-cover" src={videoUrl} controls muted />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-400">
                  <Film className="size-10" />
                  <p className="text-sm">Video preview sẽ hiển thị tại đây.</p>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/65 to-transparent p-4 text-xs">
                <span className="font-semibold">Reels</span>
                <span className="rounded-full bg-white/15 px-2 py-1">{service}</span>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-950">
                    M
                  </div>
                  <span>MKT TOOLS</span>
                  <CheckCircle2 className="size-4 text-sky-400" />
                </div>
                <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-5 text-white/95">
                  {trimmedContent || "Nội dung bài đăng Reels sẽ hiển thị ở đây."}
                </p>
                {videoFile && (
                  <div className="mt-3 truncate rounded-md bg-white/15 px-2 py-1 text-xs text-white/85">
                    {videoFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
