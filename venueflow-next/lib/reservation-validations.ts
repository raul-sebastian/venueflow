import { PrismaClient, ReservationStatus } from "@prisma/client";

type ReservationValidationInput = {
  spaceId: string;
  startDateTime: Date;
  endDateTime: Date;
  attendeesCount: number;
};

type ReservationValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export async function validateReservationRequest(
  prisma: PrismaClient,
  input: ReservationValidationInput,
): Promise<ReservationValidationResult> {
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

  if (!Number.isInteger(input.attendeesCount) || input.attendeesCount < 1) {
    return { ok: false, message: "El número de asistentes debe ser mayor a cero." };
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

  if (input.attendeesCount > space.capacity) {
    return {
      ok: false,
      message: `El espacio solo permite ${space.capacity} asistentes.`,
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
