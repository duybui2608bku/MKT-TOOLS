"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  CloudUpload,
  FileImage,
  ImageIcon,
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

interface ImageUploadResponse {
  success?: boolean;
  urls?: string[];
  errors?: unknown[];
}

interface WebhookResponse {
  message?: string;
  error?: string;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function readResponseBody<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      message: text,
    } as T;
  }
}

function getUploadError(payload: ImageUploadResponse | null) {
  if (!payload?.errors?.length) {
    return "Upload ảnh thất bại.";
  }

  return payload.errors
    .map((error) => (typeof error === "string" ? error : JSON.stringify(error)))
    .join(", ");
}

export function PostsForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRequestRef = useRef(0);
  const [content, setContent] = useState("");
  const [service, setService] = useState<ServiceOption>("TẤT CẢ");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedContent = content.trim();
  const canSubmit =
    trimmedContent.length > 0 &&
    uploadedImageUrl !== null &&
    !isUploadingImage &&
    !isSubmitting;

  function setImage(file: File | null, uploadedUrl: string | null = null) {
    setImageFile(file);
    setUploadedImageUrl(uploadedUrl);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const requestId = uploadRequestRef.current + 1;
    uploadRequestRef.current = requestId;

    if (file && !file.type.startsWith("image/")) {
      setImage(null);
      setIsUploadingImage(false);
      toast.error("Vui lòng chọn đúng định dạng ảnh.");
      event.target.value = "";
      return;
    }

    setImage(file);

    if (!file) {
      setIsUploadingImage(false);
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadImage(file);

      if (uploadRequestRef.current !== requestId) {
        return;
      }

      setUploadedImageUrl(uploadedUrl);
      toast.success("Đã upload ảnh và lấy link preview.");
    } catch (error) {
      if (uploadRequestRef.current === requestId) {
        setImage(null);
        event.target.value = "";
      }

      toast.error(error instanceof Error ? error.message : "Upload ảnh thất bại.");
    } finally {
      if (uploadRequestRef.current === requestId) {
        setIsUploadingImage(false);
      }
    }
  }

  function clearImage() {
    uploadRequestRef.current += 1;
    setImage(null);
    setIsUploadingImage(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImage(file: File) {
    const uploadFormData = new FormData();
    uploadFormData.append("images[]", file, file.name);

    const response = await fetch(toolEndpoints.imageUploadUrl, {
      method: "POST",
      body: uploadFormData,
      headers: {
        Accept: "application/json",
        "X-API-Key": toolEndpoints.imageUploadApiKey,
      },
    });
    const payload = await readResponseBody<ImageUploadResponse>(response);

    if (!response.ok || !payload?.success) {
      throw new Error(getUploadError(payload));
    }

    const uploadedUrl = payload.urls?.[0];

    if (!uploadedUrl) {
      throw new Error("API upload ảnh không trả về URL.");
    }

    return uploadedUrl;
  }

  async function sendWebhook(uploadedUrl: string) {
    const webhookFormData = new FormData();
    webhookFormData.append("content", trimmedContent);
    webhookFormData.append("service", service);
    webhookFormData.append("url", uploadedUrl);

    const response = await fetch(toolEndpoints.postsWebhookUrl, {
      method: "POST",
      body: webhookFormData,
      headers: {
        Accept: "application/json",
      },
    });
    const payload = await readResponseBody<WebhookResponse>(response);

    if (!response.ok) {
      throw new Error(payload?.error ?? payload?.message ?? "Đăng bài viết thất bại.");
    }

    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedContent) {
      toast.error("Vui lòng nhập nội dung bài viết.");
      return;
    }

    if (!imageFile) {
      toast.error("Vui lòng tải lên ảnh bài viết.");
      return;
    }

    if (!uploadedImageUrl) {
      toast.error("Ảnh chưa upload xong hoặc chưa lấy được link.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await sendWebhook(uploadedImageUrl);

      toast.success(payload?.message ?? "Đã gửi yêu cầu đăng bài viết.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng bài viết thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(340px,3fr)]">
      <Card className="min-w-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Thông tin bài viết</CardTitle>
        </CardHeader>

        <CardContent className="pt-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="post-content">
                  Nội dung
                </label>
                <textarea
                  id="post-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Nhập nội dung cho bài viết..."
                  className="min-h-56 w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm leading-6 text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{trimmedContent.length} ký tự</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="post-service">
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
                  <SelectTrigger id="post-service">
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
              <span className="text-sm font-medium text-foreground">Ảnh bài viết</span>
              <label
                htmlFor="post-image"
                className={cn(
                  "group flex min-h-44 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/25 px-5 py-8 text-center shadow-xs transition-all",
                  "hover:border-ring hover:bg-muted/45 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
                )}
              >
                <input
                  ref={inputRef}
                  className="sr-only"
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="flex size-12 items-center justify-center rounded-full bg-background ring-1 ring-border transition-transform group-hover:scale-105">
                  <CloudUpload className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">Chọn ảnh</div>
                  <div className="text-xs text-muted-foreground">
                    Ảnh sẽ được upload trước để lấy link gửi webhook.
                  </div>
                </div>
              </label>

              {imageFile && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileImage className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {imageFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(imageFile.size)}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {isUploadingImage
                        ? "Đang upload ảnh..."
                        : uploadedImageUrl ?? "Chưa lấy được link ảnh."}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearImage}
                    aria-label="Xóa ảnh"
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
                {isSubmitting || isUploadingImage ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {isUploadingImage ? "Đang upload ảnh" : isSubmitting ? "Đang gửi" : "Đăng bài"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="sticky top-6 min-w-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Preview bài viết</CardTitle>
          <CardDescription>Mô phỏng nội dung trước khi gửi webhook.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-lg border border-border bg-background shadow-xl">
            <div className="flex items-center gap-2 border-b border-border p-4 text-sm font-semibold">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                M
              </div>
              <span>MKT TOOLS</span>
              <CheckCircle2 className="size-4 text-sky-500" />
              <span className="ml-auto rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {service}
              </span>
            </div>
            <div className="space-y-3 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                {trimmedContent || "Nội dung bài viết sẽ hiển thị ở đây."}
              </p>
              <div className="overflow-hidden rounded-lg bg-muted">
                {uploadedImageUrl ? (
                  <Image
                    className="aspect-[4/3] w-full object-cover"
                    src={uploadedImageUrl}
                    alt=""
                    width={640}
                    height={480}
                    unoptimized
                  />
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <ImageIcon className="size-10" />
                    <p className="text-sm">Ảnh preview sẽ hiển thị tại đây.</p>
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
