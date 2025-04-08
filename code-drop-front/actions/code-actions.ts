"use server";

import { cookies } from "next/headers";

type SaveCodeResponse = {
  link: string;
};

export async function saveCode(
  code: string,
): Promise<string | { error: string }> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookieStore.get("token")?.value}`,
    },
    body: JSON.stringify({ code }),
  });
  console.log("Code submission response:", res);

  if (!res.ok) {
    return { error: "Code submission failed" };
  }

  const resJson: SaveCodeResponse = await res.json();
  return resJson.link;
}

export async function getCode(id: string): Promise<string> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/view/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookieStore.get("token")?.value}`,
    },
  });

  if (!res.ok) {
    throw new Error("Code retrieval failed");
  }

  const resJson = await res.json();
  return resJson.code;
}
