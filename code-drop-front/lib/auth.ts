import { cookies } from "next/headers";

export async function isLoggedIn() {
  const cookieStore = await cookies();
  return !!cookieStore.get("token");
}
