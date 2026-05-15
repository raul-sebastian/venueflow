import { randomBytes } from "node:crypto";
import { CheckInStatus, PrismaClient } from "@prisma/client";

export function createCheckInToken() {
  return randomBytes(32).toString("hex");
}

export async function createUniqueCheckInToken(prisma: PrismaClient) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = createCheckInToken();
    const existingToken = await prisma.checkIn.findUnique({
      where: { token },
      select: { id: true },
    });

    if (!existingToken) {
      return token;
    }
  }

  throw new Error("No se pudo generar un token único de check-in.");
}

export async function ensureCheckInsForEvent(prisma: PrismaClient, eventId: string) {
  const attendees = await prisma.eventAttendee.findMany({
    where: { eventId },
    include: { checkIn: true },
  });

  await Promise.all(
    attendees
      .filter((attendee) => !attendee.checkIn)
      .map(async (attendee) => {
        const token = await createUniqueCheckInToken(prisma);

        return prisma.checkIn.create({
          data: {
            eventId,
            eventAttendeeId: attendee.id,
            token,
            status: CheckInStatus.PENDING,
          },
        });
      }),
  );
}

export async function getEventCheckInSummary(prisma: PrismaClient, eventId: string) {
  const [attendees, pending, checkedIn] = await Promise.all([
    prisma.eventAttendee.count({ where: { eventId } }),
    prisma.checkIn.count({
      where: {
        eventId,
        status: CheckInStatus.PENDING,
      },
    }),
    prisma.checkIn.count({
      where: {
        eventId,
        status: CheckInStatus.CHECKED_IN,
      },
    }),
  ]);

  return { attendees, pending, checkedIn };
}
