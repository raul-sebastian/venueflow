import { PrismaClient, SpaceType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const spaces = [
  {
    name: "Sala Coworking A",
    type: SpaceType.COWORKING,
    capacity: 20,
    location: "Planta baja",
    pricePerHour: 350,
    description: "Espacio flexible para trabajo colaborativo y reuniones informales.",
  },
  {
    name: "Salón de Eventos B",
    type: SpaceType.EVENT_HALL,
    capacity: 80,
    location: "Edificio principal",
    pricePerHour: 1200,
    description: "Salón amplio para eventos, conferencias y presentaciones.",
  },
  {
    name: "Sala de Reuniones C",
    type: SpaceType.MEETING_ROOM,
    capacity: 12,
    location: "Segundo piso",
    pricePerHour: 250,
    description: "Sala privada para juntas, entrevistas y sesiones de planeación.",
  },
];

async function main() {
  for (const space of spaces) {
    const existingSpace = await prisma.space.findFirst({
      where: { name: space.name },
      select: { id: true },
    });

    if (existingSpace) {
      await prisma.space.update({
        where: { id: existingSpace.id },
        data: space,
      });
    } else {
      await prisma.space.create({
        data: space,
      });
    }
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
