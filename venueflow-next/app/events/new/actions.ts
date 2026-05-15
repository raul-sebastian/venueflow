"use server";

import { EventStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateEventRequest } from "@/lib/event-validations";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithError(message: string) {
  redirect(`/events/new?error=${encodeURIComponent(message)}`);
}

function parseEventStatus(value: string) {
  return value === EventStatus.DRAFT ? EventStatus.DRAFT : EventStatus.PUBLISHED;
}

export async function createEvent(formData: FormData) {
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const spaceId = getString(formData, "spaceId");
  const startDateTime = new Date(getString(formData, "startDateTime"));
  const endDateTime = new Date(getString(formData, "endDateTime"));
  const capacity = Number(getString(formData, "capacity"));
  const status = parseEventStatus(getString(formData, "status"));

  const validation = await validateEventRequest(prisma, {
    name,
    spaceId,
    startDateTime,
    endDateTime,
    capacity,
  });

  if (!validation.ok) {
    redirectWithError(validation.message);
  }

  const organizer = await prisma.user.upsert({
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
  });

  const event = await prisma.event.create({
    data: {
      name,
      description: description || null,
      spaceId,
      organizerId: organizer.id,
      startDateTime,
      endDateTime,
      capacity,
      status,
    },
  });

  revalidatePath("/events");
  revalidatePath("/");

  redirect(`/events/${event.id}?created=1`);
}
