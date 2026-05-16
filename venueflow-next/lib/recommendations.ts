import { EventStatus, ReservationStatus, Space, SpaceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UseCase =
  | "reunion"
  | "coworking"
  | "conferencia"
  | "taller"
  | "presentacion"
  | "otro";

export type RecommendationInput = {
  attendees: number;
  startDateTime: Date;
  endDateTime: Date;
  useCase: UseCase;
  maxPricePerHour?: number;
  notes?: string;
};

export type SpaceRecommendation = {
  space: Space;
  score: number;
  reasons: string[];
};

const compatibleTypes: Record<UseCase, SpaceType[]> = {
  reunion: [SpaceType.MEETING_ROOM, SpaceType.COWORKING],
  coworking: [SpaceType.COWORKING, SpaceType.MEETING_ROOM],
  conferencia: [SpaceType.EVENT_HALL, SpaceType.AUDITORIUM, SpaceType.CLASSROOM],
  taller: [SpaceType.CLASSROOM, SpaceType.COWORKING, SpaceType.EVENT_HALL],
  presentacion: [SpaceType.EVENT_HALL, SpaceType.AUDITORIUM, SpaceType.MEETING_ROOM],
  otro: [
    SpaceType.COWORKING,
    SpaceType.MEETING_ROOM,
    SpaceType.EVENT_HALL,
    SpaceType.CLASSROOM,
    SpaceType.AUDITORIUM,
    SpaceType.OTHER,
  ],
};

export function validateRecommendationInput(input: RecommendationInput) {
  if (!Number.isInteger(input.attendees) || input.attendees <= 0) {
    return "El número de personas debe ser mayor a cero.";
  }

  if (Number.isNaN(input.startDateTime.getTime())) {
    return "La fecha de inicio no es válida.";
  }

  if (Number.isNaN(input.endDateTime.getTime())) {
    return "La fecha de fin no es válida.";
  }

  if (input.endDateTime <= input.startDateTime) {
    return "La fecha de fin debe ser mayor a la fecha de inicio.";
  }

  if (input.maxPricePerHour !== undefined && input.maxPricePerHour <= 0) {
    return "El presupuesto debe ser mayor a cero.";
  }

  return null;
}

export async function recommendSpaces(input: RecommendationInput) {
  const validationError = validateRecommendationInput(input);

  if (validationError) {
    return { error: validationError, recommendations: [] as SpaceRecommendation[] };
  }

  const spaces = await prisma.space.findMany({
    where: {
      isActive: true,
      capacity: { gte: input.attendees },
      ...(input.maxPricePerHour
        ? { pricePerHour: { lte: input.maxPricePerHour } }
        : {}),
    },
    orderBy: { capacity: "asc" },
  });

  const recommendations: SpaceRecommendation[] = [];

  for (const space of spaces) {
    const [overlappingReservations, overlappingEvents] = await Promise.all([
      prisma.reservation.count({
        where: {
          spaceId: space.id,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          startDateTime: { lt: input.endDateTime },
          endDateTime: { gt: input.startDateTime },
        },
      }),
      prisma.event.count({
        where: {
          spaceId: space.id,
          status: { in: [EventStatus.DRAFT, EventStatus.PUBLISHED] },
          startDateTime: { lt: input.endDateTime },
          endDateTime: { gt: input.startDateTime },
        },
      }),
    ]);

    if (overlappingReservations > 0 || overlappingEvents > 0) {
      continue;
    }

    const reasons: string[] = [
      `Tiene capacidad para ${input.attendees} personas.`,
      "Está disponible en el horario solicitado.",
    ];
    let score = 40;

    if (compatibleTypes[input.useCase].includes(space.type)) {
      score += 35;
      reasons.push("Su tipo de espacio encaja con la actividad.");
    }

    if (input.maxPricePerHour) {
      score += 15;
      reasons.push("Se mantiene dentro del presupuesto indicado.");
    }

    const capacityGap = space.capacity - input.attendees;
    if (capacityGap <= Math.max(4, input.attendees * 0.4)) {
      score += 10;
      reasons.push("Aprovecha bien la capacidad disponible.");
    }

    if (space.equipment && input.notes) {
      score += 5;
      reasons.push("Cuenta con equipo registrado que puede apoyar tu actividad.");
    }

    recommendations.push({ space, score, reasons });
  }

  return {
    error: null,
    recommendations: recommendations.sort((a, b) => b.score - a.score),
  };
}

export function getAssistantSummary(
  input: RecommendationInput,
  recommendations: SpaceRecommendation[],
) {
  const requestSummary = `Analicé una solicitud para ${input.attendees} personas, actividad "${input.useCase}", del ${input.startDateTime.toLocaleString(
    "es-MX",
  )} al ${input.endDateTime.toLocaleString("es-MX")}.`;

  if (recommendations.length === 0) {
    return `${requestSummary} No encontré espacios disponibles que cumplan capacidad, horario y presupuesto. Prueba con otro horario o ajusta tus necesidades.`;
  }

  const best = recommendations[0];

  return `${requestSummary} Encontré ${recommendations.length} opción(es). Te sugiero empezar por ${best.space.name}, porque combina capacidad suficiente, disponibilidad y buen ajuste para tu actividad.`;
}
