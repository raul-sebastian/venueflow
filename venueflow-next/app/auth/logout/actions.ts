"use server";

import { redirect } from "next/navigation";
import { deleteSessionCookie } from "@/lib/session";

export async function logoutUser() {
  await deleteSessionCookie();
  redirect("/auth/login?loggedOut=1");
}
