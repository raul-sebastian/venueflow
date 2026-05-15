"use server";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string) {
  redirect(`/auth/register?error=${encodeURIComponent(message)}`);
}

export async function registerUser(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!name || !email || !password) {
    redirectWithError("Completa todos los campos.");
  }

  if (password.length < 8) {
    redirectWithError("La contraseña debe tener al menos 8 caracteres.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    redirectWithError("Ese correo ya está registrado.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: UserRole.USER,
    },
  });

  redirect("/auth/login?registered=1");
}
