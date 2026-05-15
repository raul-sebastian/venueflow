import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";
import { getSessionCookie } from "@/lib/session";

const initialPassword = "VenueFlow123!";

const initialUsers = [
  {
    name: "Administrador VenueFlow",
    email: "admin@venueflow.local",
    role: UserRole.ADMIN,
  },
  {
    name: "Usuario Demo",
    email: "demo@venueflow.local",
    role: UserRole.USER,
  },
  {
    name: "Organizador Demo",
    email: "organizador@venueflow.local",
    role: UserRole.ORGANIZER,
  },
];

export async function ensureInitialUsers() {
  const passwordHash = await hashPassword(initialPassword);

  await Promise.all(
    initialUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role,
          passwordHash,
        },
        create: {
          ...user,
          passwordHash,
        },
      }),
    ),
  );
}

export async function getCurrentUser() {
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
