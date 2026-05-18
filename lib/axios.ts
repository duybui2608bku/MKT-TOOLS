import axios, { type AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(
  error: unknown,
  fallback = "Da co loi xay ra. Vui long thu lai."
) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data;
  const firstValidationError = data?.errors
    ? Object.values(data.errors).flat()[0]
    : undefined;

  return firstValidationError ?? data?.message ?? data?.error ?? error.message ?? fallback;
}

export type ApiClientError = AxiosError<ApiErrorBody>;
