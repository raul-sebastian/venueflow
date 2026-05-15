import { EventStatus, PrismaClient, ReservationStatus } from "@prisma/client";

type EventValidationInput = {
  name: string;
  spaceId: string;
  startDateTime: Date;
  endDateTime: Date;
  capacity: number;
};

type ValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export async function validateEventRequest(
  prisma: PrismaClient,
  input: EventValidationInput,
): Promise<ValidationResult> {
  if (!input.name) {
    return { ok: false, message: "Agrega un nombre para el evento." };
  }

  if (!input.spaceId) {
    return { ok: false, message: "Selecciona un espacio." };
  }

  if (Number.isNaN(input.startDateTime.getTime())) {
    return { ok: false, message: "La fecha de inicio no es válida." };
  }

  if (Number.isNaN(input.endDateTime.getTime())) {
    return { ok: false, message: "La fecha de fin no es válida." };
  }

  if (input.endDateTime <= input.startDateTime) {
    return { ok: false, message: "La fecha de fin debe ser mayor a la fecha de inicio." };
  }

  if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
    return { ok: false, message: "La capacidad del evento debe ser mayor a cero." };
  }

  const space = await prisma.space.findUnique({
    where: { id: input.spaceId },
    select: {
      capacity: true,
      isActive: true,
    },
  });

  if (!space) {
    return { ok: false, message: "El espacio seleccionado no existe." };
  }

  if (!space.isActive) {
    return { ok: false, message: "El espacio seleccionado no está activo." };
  }

  if (input.capacity > space.capacity) {
    return {
      ok: false,
      message: `El evento no puede superar la capacidad del espacio (${space.capacity}).`,
    };
  }

  const overlappingEvent = await prisma.event.findFirst({
    where: {
      spaceId: input.spaceId,
      status: {
        in: [EventStatus.DRAFT, EventStatus.PUBLISHED],
      },
      startDateTime: {
        lt: input.endDateTime,
      },
      endDateTime: {
        gt: input.startDateTime,
      },
    },
    select: {
      id: true,
    },
  });

  if (overlappingEvent) {
    return {
      ok: false,
      message: "Ya existe un evento borrador o publicado en ese horario.",
    };
  }

  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      spaceId: input.spaceId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
      startDateTime: {
        lt: input.endDateTime,
      },
      endDateTime: {
        gt: input.startDateTime,
      },
    },
    select: {
      id: true,
    },
  });

  if (overlappingReservation) {
    return {
      ok: false,
      message: "Ya existe una reservación pendiente o confirmada en ese horario.",
    };
  }

  return { ok: true };
}
