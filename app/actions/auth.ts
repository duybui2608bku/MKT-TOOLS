"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, validatePin } from "@/lib/auth";

export async function login(formData: FormData) {
  const pin = formData.get("pin") as string;

  if (!validatePin(pin)) {
    return { error: "Mã PIN không đúng. Vui lòng thử lại." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, pin, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
