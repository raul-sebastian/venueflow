# VenueFlow - Checklist de Pruebas Manuales

## Autenticación y Roles

- [ ] Iniciar sesión como admin con `admin@venueflow.local / VenueFlow123!`.
- [ ] Iniciar sesión como usuario normal con `demo@venueflow.local / VenueFlow123!`.
- [ ] Registrar un usuario nuevo desde `/auth/register`.
- [ ] Cerrar sesión desde el botón `Salir`.
- [ ] Entrar a `/admin` sin sesión y verificar redirección a login.
- [ ] Entrar a `/admin` con usuario USER y verificar acceso restringido.
- [ ] Entrar a `/admin` con ADMIN y verificar métricas reales.

## Espacios y Reservaciones

- [ ] Abrir `/spaces` y verificar que muestra espacios desde PostgreSQL.
- [ ] Crear una reservación desde `/reservations/new`.
- [ ] Verificar que la reservación aparece en `/reservations`.
- [ ] Intentar crear una reservación con asistentes mayores a la capacidad.
- [ ] Intentar crear una reservación con fecha fin menor o igual a inicio.
- [ ] Intentar crear una reservación traslapada en el mismo espacio.
- [ ] Cancelar una reservación y verificar que cambia a CANCELLED.

## Eventos y Asistentes

- [ ] Crear un evento desde `/events/new`.
- [ ] Verificar que aparece en `/events`.
- [ ] Abrir `/events/[id]`.
- [ ] Registrar un asistente con nombre y correo.
- [ ] Intentar registrar el mismo correo dos veces.
- [ ] Intentar registrar asistentes hasta llenar cupo.
- [ ] Cancelar evento y verificar que no acepta nuevos asistentes.

## Check-In

- [ ] Entrar a `/events/[id]/check-in`.
- [ ] Verificar que se generan tokens para asistentes sin check-in.
- [ ] Abrir un enlace `/check-in/[token]`.
- [ ] Confirmar que marca CHECKED_IN.
- [ ] Reabrir el mismo enlace y verificar mensaje de check-in ya registrado.
- [ ] Probar un token inventado y verificar mensaje de código inválido.

## Recomendador

- [ ] Entrar a `/recommendations`.
- [ ] Buscar espacio para reunión con capacidad válida.
- [ ] Verificar recomendaciones con motivos.
- [ ] Probar presupuesto bajo y verificar que filtra resultados.
- [ ] Probar un horario ocupado y verificar que evita traslapes.
- [ ] Usar `Reservar este espacio` y verificar preselección en `/reservations/new`.

## Dashboard y Admin

- [ ] Verificar métricas del dashboard `/`.
- [ ] Verificar próximas reservaciones.
- [ ] Verificar próximos eventos.
- [ ] Verificar espacios más usados.
- [ ] Verificar eventos con más asistentes.
- [ ] Verificar analítica de admin:
  - [ ] ocupación por espacio
  - [ ] reservaciones por estado
  - [ ] eventos por estado
  - [ ] asistencia/check-ins
