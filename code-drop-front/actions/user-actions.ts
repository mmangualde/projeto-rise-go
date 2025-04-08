"use server";

import { cookies } from "next/headers";

export type User = {
  name?: string;
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

export async function loginUser(user: User) {
  console.log("Logging in user:", user);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });
  console.log("Login response:", res);

  if (!res.ok) {
    return { error: JSON.stringify(res.body) };
  }

  const resJson: LoginResponse = await res.json();

  const cookieStore = await cookies();
  cookieStore.set("token", resJson.token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });
}

export async function registerUser(user: User) {
  console.log("Signing up user:", user);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  console.log("JSON USER:", JSON.stringify(user));

  console.log("Sign up response:", res);

  if (!res.ok) {
    return { error: "Erro ao registrar o usuário" };
  }

  await loginUser({
    email: user.email,
    password: user.password,
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
