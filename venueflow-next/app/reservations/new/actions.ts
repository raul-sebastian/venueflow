"use server";

import { ReservationStatus, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { validateReservationRequest } from "@/lib/reservation-validations";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string) {
  redirect(`/reservations/new?error=${encodeURIComponent(message)}`);
}

export async function createReservation(formData: FormData) {
  const spaceId = getString(formData, "spaceId");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const startDateTime = new Date(getString(formData, "startDateTime"));
  const endDateTime = new Date(getString(formData, "endDateTime"));
  const attendeesCount = Number(getString(formData, "attendeesCount"));

  if (!title) {
    redirectWithError("Agrega un título para la reservación.");
  }

  const validation = await validateReservationRequest(prisma, {
    spaceId,
    startDateTime,
    endDateTime,
    attendeesCount,
  });

  if (!validation.ok) {
    redirectWithError(validation.message);
  }

  const [space, demoUser] = await Promise.all([
    prisma.space.findUnique({
      where: { id: spaceId },
      select: { pricePerHour: true },
    }),
    prisma.user.upsert({
      where: { email: "demo@venueflow.local" },
      update: {
        name: "Usuario Demo",
        role: UserRole.USER,
      },
      create: {
        name: "Usuario Demo",
        email: "demo@venueflow.local",
        role: UserRole.USER,
      },
    }),
  ]);

  if (!space) {
    redirectWithError("El espacio seleccionado no existe.");
  }

  const durationMs = endDateTime.getTime() - startDateTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const totalPrice = Number(space.pricePerHour) * durationHours;

  await prisma.reservation.create({
    data: {
      userId: demoUser.id,
      spaceId,
      title,
      description: description || null,
      startDateTime,
      endDateTime,
      attendeesCount,
      status: ReservationStatus.PENDING,
      totalPrice,
    },
  });

  redirect("/reservations/new?created=1");
}
