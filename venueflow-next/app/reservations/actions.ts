"use server";

import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function redirectWithError(message: string) {
  redirect(`/reservations?error=${encodeURIComponent(message)}`);
}

export async function cancelReservation(formData: FormData) {
  const reservationId = formData.get("reservationId");

  if (typeof reservationId !== "string" || !reservationId) {
    redirectWithError("No se recibió la reservación a cancelar.");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!reservation) {
    redirectWithError("La reservación no existe.");
  }

  if (reservation.status === ReservationStatus.COMPLETED) {
    redirectWithError("No se puede cancelar una reservación completada.");
  }

  if (reservation.status !== ReservationStatus.CANCELLED) {
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: ReservationStatus.CANCELLED },
    });
  }

  revalidatePath("/reservations");
  revalidatePath("/");

  redirect("/reservations?cancelled=1");
}
