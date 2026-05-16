import { EventStatus, PrismaClient, SpaceType, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/passwords";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const defaultPassword = "VenueFlow123!";

const users = [
  { name: "Administrador VenueFlow", email: "admin@venueflow.local", role: UserRole.ADMIN },
  { name: "Usuario Demo", email: "demo@venueflow.local", role: UserRole.USER },
  { name: "Organizador Demo", email: "organizador@venueflow.local", role: UserRole.ORGANIZER },
];

const spaces = [
  {
    name: "Sala silenciosa de estudio",
    type: SpaceType.CLASSROOM,
    capacity: 18,
    location: "Biblioteca norte",
    pricePerHour: 180,
    description: "Ambiente tranquilo para estudio individual o sesiones guiadas.",
  },
  {
    name: "Cabina individual de concentración",
    type: SpaceType.OTHER,
    capacity: 1,
    location: "Planta baja",
    pricePerHour: 90,
    description: "Cabina privada para llamadas, entrevistas o trabajo profundo.",
  },
  {
    name: "Aula de capacitación",
    type: SpaceType.CLASSROOM,
    capacity: 35,
    location: "Edificio académico",
    pricePerHour: 450,
    description: "Aula equipada para cursos, talleres y sesiones de formación.",
  },
  {
    name: "Auditorio principal",
    type: SpaceType.AUDITORIUM,
    capacity: 180,
    location: "Edificio principal",
    pricePerHour: 1800,
    description: "Auditorio para conferencias, presentaciones y eventos institucionales.",
  },
  {
    name: "Terraza para networking",
    type: SpaceType.EVENT_HALL,
    capacity: 70,
    location: "Azotea",
    pricePerHour: 950,
    description: "Espacio abierto para networking, convivencia y presentaciones informales.",
  },
  {
    name: "Laboratorio creativo",
    type: SpaceType.COWORKING,
    capacity: 24,
    location: "Ala creativa",
    pricePerHour: 520,
    description: "Espacio flexible para ideación, prototipado y trabajo colaborativo.",
  },
  {
    name: "Sala de juntas ejecutiva",
    type: SpaceType.MEETING_ROOM,
    capacity: 14,
    location: "Tercer piso",
    pricePerHour: 650,
    description: "Sala formal para reuniones estratégicas y presentaciones ejecutivas.",
  },
  {
    name: "Coworking abierto",
    type: SpaceType.COWORKING,
    capacity: 40,
    location: "Planta baja",
    pricePerHour: 380,
    description: "Área abierta para trabajo colaborativo y sesiones de comunidad.",
  },
  {
    name: "Salón de conferencias",
    type: SpaceType.EVENT_HALL,
    capacity: 90,
    location: "Edificio principal",
    pricePerHour: 1300,
    description: "Salón amplio para conferencias, paneles y actividades grupales.",
  },
  {
    name: "Estudio multimedia",
    type: SpaceType.OTHER,
    capacity: 10,
    location: "Centro audiovisual",
    pricePerHour: 700,
    description: "Estudio para producción de video, fotografía y contenido digital.",
  },
  {
    name: "Sala de lectura",
    type: SpaceType.CLASSROOM,
    capacity: 22,
    location: "Biblioteca central",
    pricePerHour: 160,
    description: "Sala cómoda para clubes de lectura y estudio grupal.",
  },
  {
    name: "Sala de mentorías",
    type: SpaceType.MEETING_ROOM,
    capacity: 8,
    location: "Segundo piso",
    pricePerHour: 260,
    description: "Sala pequeña para mentorías, asesorías y entrevistas.",
  },
  {
    name: "Sala de pintura",
    type: SpaceType.CLASSROOM,
    capacity: 20,
    location: "Ala artística",
    pricePerHour: 320,
    description: "Aula iluminada para pintura, dibujo y actividades creativas.",
  },
  {
    name: "Aula de idiomas",
    type: SpaceType.CLASSROOM,
    capacity: 28,
    location: "Edificio académico",
    pricePerHour: 300,
    description: "Aula para clases conversacionales, talleres y dinámicas grupales.",
  },
  {
    name: "Laboratorio de biología",
    type: SpaceType.CLASSROOM,
    capacity: 24,
    location: "Laboratorios",
    pricePerHour: 850,
    description: "Laboratorio equipado para prácticas introductorias y demostraciones.",
  },
  {
    name: "Espacio maker",
    type: SpaceType.COWORKING,
    capacity: 30,
    location: "Ala maker",
    pricePerHour: 620,
    description: "Espacio para prototipos, makerspaces y talleres prácticos.",
  },
  {
    name: "Sala de podcast",
    type: SpaceType.OTHER,
    capacity: 6,
    location: "Centro audiovisual",
    pricePerHour: 420,
    description: "Sala acondicionada para grabación de podcast y audio.",
  },
  {
    name: "Sala de innovación",
    type: SpaceType.COWORKING,
    capacity: 32,
    location: "Hub de innovación",
    pricePerHour: 680,
    description: "Sala versátil para innovación, diseño y colaboración interdisciplinaria.",
  },
  {
    name: "Biblioteca tranquila",
    type: SpaceType.CLASSROOM,
    capacity: 16,
    location: "Biblioteca sur",
    pricePerHour: 140,
    description: "Espacio silencioso para estudio, lectura y concentración.",
  },
  {
    name: "Salón de workshops",
    type: SpaceType.EVENT_HALL,
    capacity: 60,
    location: "Edificio de talleres",
    pricePerHour: 780,
    description: "Salón flexible para workshops, bootcamps y actividades intensivas.",
  },
];

const events = [
  ["Curso de Marketing Digital", "Salón de conferencias", "2026-06-01T10:00:00", "2026-06-01T12:00:00", 60],
  ["Introducción a la Inteligencia Artificial", "Auditorio principal", "2026-06-02T11:00:00", "2026-06-02T13:00:00", 120],
  ["Taller de Inglés Conversacional", "Aula de idiomas", "2026-06-03T09:00:00", "2026-06-03T11:00:00", 24],
  ["Clase de Pintura Creativa", "Sala de pintura", "2026-06-04T16:00:00", "2026-06-04T18:00:00", 18],
  ["Biología para Principiantes", "Laboratorio de biología", "2026-06-05T10:00:00", "2026-06-05T12:00:00", 20],
  ["Finanzas Personales", "Sala de juntas ejecutiva", "2026-06-08T17:00:00", "2026-06-08T19:00:00", 14],
  ["Diseño UX/UI", "Laboratorio creativo", "2026-06-09T15:00:00", "2026-06-09T18:00:00", 22],
  ["Taller de Emprendimiento", "Salón de workshops", "2026-06-10T09:00:00", "2026-06-10T13:00:00", 50],
  ["Club de Lectura", "Sala de lectura", "2026-06-11T18:00:00", "2026-06-11T20:00:00", 18],
  ["Introducción a Python", "Aula de capacitación", "2026-06-12T10:00:00", "2026-06-12T13:00:00", 30],
  ["Fotografía Básica", "Estudio multimedia", "2026-06-15T12:00:00", "2026-06-15T14:00:00", 10],
  ["Oratoria y Presentaciones", "Salón de conferencias", "2026-06-16T16:00:00", "2026-06-16T18:00:00", 70],
  ["Escritura Creativa", "Biblioteca tranquila", "2026-06-17T17:00:00", "2026-06-17T19:00:00", 15],
  ["Productividad y Gestión del Tiempo", "Coworking abierto", "2026-06-18T09:00:00", "2026-06-18T11:00:00", 35],
  ["Branding Personal", "Sala de innovación", "2026-06-19T10:00:00", "2026-06-19T12:00:00", 28],
  ["Fundamentos de Ciberseguridad", "Aula de capacitación", "2026-06-22T15:00:00", "2026-06-22T18:00:00", 32],
  ["Excel para Negocios", "Aula de capacitación", "2026-06-23T09:00:00", "2026-06-23T12:00:00", 30],
  ["Taller de Liderazgo", "Terraza para networking", "2026-06-24T17:00:00", "2026-06-24T19:00:00", 55],
  ["Networking Profesional", "Terraza para networking", "2026-06-25T18:00:00", "2026-06-25T20:00:00", 65],
  ["Ciencia de Datos Introductoria", "Sala de innovación", "2026-06-26T10:00:00", "2026-06-26T13:00:00", 30],
] as const;

async function upsertByName<T extends { name: string }>(
  find: (name: string) => Promise<{ id: string } | null>,
  update: (id: string, data: T) => Promise<unknown>,
  create: (data: T) => Promise<unknown>,
  data: T,
) {
  const existing = await find(data.name);

  if (existing) {
    await update(existing.id, data);
  } else {
    await create(data);
  }
}

async function main() {
  const passwordHash = await hashPassword(defaultPassword);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    });
  }

  for (const space of spaces) {
    await upsertByName(
      (name) => prisma.space.findFirst({ where: { name }, select: { id: true } }),
      (id, data) => prisma.space.update({ where: { id }, data }),
      (data) => prisma.space.create({ data }),
      { ...space, isActive: true },
    );
  }

  const organizer = await prisma.user.findUniqueOrThrow({
    where: { email: "organizador@venueflow.local" },
  });
  const allSpaces = await prisma.space.findMany({ select: { id: true, name: true } });
  const spaceIdByName = new Map(allSpaces.map((space) => [space.name, space.id]));

  for (const [name, spaceName, start, end, capacity] of events) {
    const spaceId = spaceIdByName.get(spaceName);

    if (!spaceId) {
      throw new Error(`Missing space for event: ${spaceName}`);
    }

    const data = {
      name,
      description: `Actividad demo: ${name}.`,
      spaceId,
      organizerId: organizer.id,
      startDateTime: new Date(start),
      endDateTime: new Date(end),
      capacity,
      status: EventStatus.PUBLISHED,
    };

    await upsertByName(
      (eventName) => prisma.event.findFirst({ where: { name: eventName }, select: { id: true } }),
      (id, eventData) => prisma.event.update({ where: { id }, data: eventData }),
      (eventData) => prisma.event.create({ data: eventData }),
      data,
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
