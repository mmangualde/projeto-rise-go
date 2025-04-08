import { cookies } from "next/headers";

type User = {
  name?: string;
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

export const useUser = () => {
  const register = async (user: User) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      throw new Error("Registration failed");
    }
    await login({
      email: user.email,
      password: user.password,
    });
  };

  const login = async (user: User) => {
    const cookieStore = await cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const resJson: LoginResponse = await res.json();

    cookieStore.set("token", resJson.token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
  };

  return { register, login };
};
