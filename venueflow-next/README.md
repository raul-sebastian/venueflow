# VenueFlow

VenueFlow es una plataforma web para administrar espacios, reservaciones y eventos. Esta versión funciona como entrega final universitaria: conecta una interfaz moderna con PostgreSQL local, valida disponibilidad, controla cupos, permite check-in por token y agrega un recomendador local preparado para futura integración con IA.

## Objetivo

Diseñar e implementar una aplicación web full stack para gestionar salas, salones o espacios de coworking por fecha y hora, evitando traslapes, administrando eventos con asistentes, mostrando métricas reales y preparando un módulo de recomendaciones tipo IA.

## Stack Tecnológico

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL local
- Cookies httpOnly firmadas para autenticación local
- Node crypto para hash de contraseñas y firma de sesión

## Módulos Implementados

- Registro e inicio de sesión local.
- Roles: USER, ADMIN y ORGANIZER.
- Panel admin protegido por rol.
- Dashboard con métricas reales.
- Catálogo de espacios.
- Reservaciones con validación de capacidad, horario y traslapes.
- Cancelación lógica de reservaciones.
- Eventos con cupo y asistentes.
- Registro de asistentes con validación de duplicados.
- Check-in por token único.
- Bloque visual de QR placeholder.
- Recomendador local de espacios basado en reglas.
- Documentación y checklist de pruebas.

## Instalación

```powershell
cd "C:\Users\raulg\Desktop\venueflow\venueflow-next"
npm install
```

## PostgreSQL Local

Crear una base de datos local:

```sql
CREATE DATABASE venueflow_db;
```

Configurar la variable `DATABASE_URL` en `.env`:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/venueflow_db?schema=public"
```

Aplicar migraciones si la base está vacía:

```powershell
npx prisma migrate dev --name init
```

Ejecutar seed inicial si se desea cargar espacios demo:

```powershell
npx prisma db seed
```

## Comandos Principales

```powershell
npm run dev
npm run lint
```

No se requiere OpenAI ni servicios externos para esta versión.

## Usuarios Demo

Al abrir `/auth/login`, el sistema asegura estos usuarios mediante upsert:

- admin@venueflow.local / VenueFlow123! / ADMIN
- demo@venueflow.local / VenueFlow123! / USER
- organizador@venueflow.local / VenueFlow123! / ORGANIZER

## Flujo De Pruebas Sugerido

1. Iniciar sesión como ADMIN.
2. Revisar dashboard y panel admin.
3. Consultar espacios.
4. Crear una reservación.
5. Intentar crear otra reservación traslapada.
6. Cancelar una reservación.
7. Crear un evento.
8. Registrar asistentes.
9. Abrir gestión de check-in del evento.
10. Usar un enlace `/check-in/[token]`.
11. Reabrir el mismo enlace para validar doble check-in bloqueado.
12. Usar `/recommendations` y reservar un espacio recomendado.

## Recomendador Local

El módulo `/recommendations` no usa OpenAI todavía. Evalúa reglas locales:

- capacidad suficiente
- espacio activo
- presupuesto máximo
- compatibilidad por tipo de uso
- disponibilidad
- traslapes contra reservaciones activas
- traslapes contra eventos activos

Está diseñado para que en una fase futura pueda conectarse a OpenAI y generar recomendaciones conversacionales más avanzadas.

## Autenticación

La autenticación actual es local y usa:

- `crypto.scrypt` para hash de contraseña
- `crypto.timingSafeEqual` para comparación segura
- cookie httpOnly firmada con HMAC

El proyecto queda preparado para migrar a Auth.js en una fase posterior sin cambiar el modelo principal `User`.

## Futuras Mejoras

- Integración real con OpenAI.
- QR real con imagen generada.
- CRUD completo de espacios desde admin.
- Gestión avanzada de usuarios y roles.
- Notificaciones persistentes.
- Pruebas automatizadas.
- Exportes o reportes.
- Deploy en Vercel con PostgreSQL administrado.
