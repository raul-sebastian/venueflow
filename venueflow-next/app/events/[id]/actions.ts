"use server";

import { EventStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(eventId: string, message: string) {
  redirect(`/events/${eventId}?error=${encodeURIComponent(message)}`);
}

export async function registerEventAttendee(formData: FormData) {
  const eventId = getString(formData, "eventId");
  const fullName = getString(formData, "fullName");
  const email = getString(formData, "email").toLowerCase();

  if (!eventId) {
    redirect("/events?error=Evento%20no%20válido");
  }

  if (!fullName) {
    redirectWithError(eventId, "Agrega el nombre completo del asistente.");
  }

  if (!email) {
    redirectWithError(eventId, "Agrega el correo del asistente.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { attendees: true },
      },
    },
  });

  if (!event) {
    redirect("/events?error=El%20evento%20no%20existe");
  }

  if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) {
    redirectWithError(event.id, "No se pueden registrar asistentes en este evento.");
  }

  if (event._count.attendees >= event.capacity) {
    redirectWithError(event.id, "El cupo del evento ya está lleno.");
  }

  const duplicatedAttendee = await prisma.eventAttendee.findFirst({
    where: {
      eventId: event.id,
      email,
    },
    select: { id: true },
  });

  if (duplicatedAttendee) {
    redirectWithError(event.id, "Ese correo ya está registrado en este evento.");
  }

  await prisma.eventAttendee.create({
    data: {
      eventId: event.id,
      fullName,
      email,
    },
  });

  revalidatePath("/events");
  revalidatePath(`/events/${event.id}`);
  revalidatePath("/");

  redirect(`/events/${event.id}?registered=1`);
}

export async function cancelEvent(formData: FormData) {
  const eventId = getString(formData, "eventId");

  if (!eventId) {
    redirect("/events?error=Evento%20no%20válido");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!event) {
    redirect("/events?error=El%20evento%20no%20existe");
  }

  if (event.status === EventStatus.COMPLETED) {
    redirectWithError(event.id, "No se puede cancelar un evento completado.");
  }

  if (event.status !== EventStatus.CANCELLED) {
    await prisma.event.update({
      where: { id: event.id },
      data: { status: EventStatus.CANCELLED },
    });
  }

  revalidatePath("/events");
  revalidatePath(`/events/${event.id}`);
  revalidatePath("/");

  redirect(`/events/${event.id}?cancelled=1`);
}
