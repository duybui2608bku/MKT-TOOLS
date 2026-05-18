import { cookies } from "next/headers";

const COOKIE_NAME = "mkt-auth";
const VALID_PIN = "7799";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === VALID_PIN;
}

export function validatePin(pin: string): boolean {
  return pin === VALID_PIN;
}

export { COOKIE_NAME };
