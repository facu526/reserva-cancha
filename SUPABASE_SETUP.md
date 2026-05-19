# Configuración de Supabase

Esta guía conecta Reserva Cancha con Supabase para guardar reservas reales y evitar turnos duplicados.

## 1. Crear el proyecto

1. Entrá a https://supabase.com.
2. Creá un proyecto nuevo.
3. Abrí Project Settings > API.
4. Copiá:
   - Project URL
   - anon public key

## 2. Crear `.env.local`

En la raíz del proyecto creá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
RESEND_API_KEY=
```

No uses la `service_role` key en el frontend ni en este proyecto.
`RESEND_API_KEY` es opcional: si no está configurada, las reservas se guardan igual y solo se omite el email de confirmación.

## 3. Crear tablas y políticas

En Supabase:

1. Abrí SQL Editor.
2. Pegá todo el contenido de `supabase/schema.sql`.
3. Ejecutá el SQL.
4. Pegá y ejecutá `supabase/admin-policies.sql`.
5. Pegá y ejecutá `supabase/user-auth-reservations.sql`.
6. Pegá y ejecutá `supabase/site-settings.sql`.

`supabase/user-auth-reservations.sql` también deja actualizada la función segura `get_reservation_receipt`. Si venís de una instalación anterior, este archivo reemplaza la versión pública del comprobante.

Ese archivo crea:

- `courts`
- `reservations`
- `profiles`
- datos iniciales de canchas
- políticas RLS
- función `has_active_reservation`
- función `get_reservation_receipt`
- función `is_admin`
- restricción única para bloquear doble reserva activa
- políticas para que solo administradores autenticados puedan leer y actualizar reservas
- columnas `profiles.full_name`, `profiles.phone` y `reservations.user_id`
- políticas para que cada usuario vea solo sus propias reservas
- tabla `site_settings` para editar contenido público desde `/admin`
- columnas `player_count` y `slot_duration_minutes` en `courts`
- políticas para que solo admins creen o editen canchas y configuración

## 4. Canchas iniciales

El SQL crea estas canchas:

- `/reservar/cancha-norte`
- `/reservar/arena-verde`
- `/reservar/central-club`

También podés volver a cargar solo las canchas ejecutando `supabase/seed.sql`.

## 5. Probar reservas reales

1. Reiniciá el servidor después de crear `.env.local`:

```bash
npm run dev
```

2. Abrí:

```text
http://localhost:3000/canchas
```

3. Entrá a una cancha, por ejemplo:

```text
http://localhost:3000/reservar/cancha-norte
```

4. Si no tenés sesión, la pantalla debe pedirte ingresar o crear una cuenta.
5. Ingresá o registrate y volvé automáticamente a esa cancha.
6. Completá:
   - fecha futura
   - horario
   - nombre
   - email válido
   - teléfono válido

7. Confirmá la reserva.

Si se guarda correctamente, la app redirige a:

```text
http://localhost:3000/reserva-exitosa?id=RESERVATION_ID
```

La página de éxito usa ese identificador para mostrar el comprobante de la reserva: cliente, cancha, deporte, fecha, horario, precio estimado, estado y contacto.

Para probar manualmente un comprobante existente, copiá el `id` de una fila de `reservations` y abrí:

```text
http://localhost:3000/reserva-exitosa?id=ID_DE_LA_RESERVA
```

Si `supabase/user-auth-reservations.sql` está aplicado correctamente, la página debe mostrar los datos concretos de esa reserva solamente al dueño de la reserva o a un administrador.

## 6. Probar bloqueo de duplicados

1. Creá una reserva para la misma cancha, fecha y horario.
2. Intentá crear otra reserva con esos mismos datos.
3. Debe aparecer:

```text
Ese horario ya fue reservado. Elegí otro turno disponible.
```

La protección está en dos capas:

- la server action consulta `has_active_reservation`
- Supabase tiene un índice único parcial sobre `court_id`, `reservation_date` y `start_time` para reservas `pending` o `confirmed`

La función `get_reservation_receipt` permite leer únicamente el comprobante solicitado por id desde la página de éxito, sin habilitar lectura pública completa de `reservations` ni mostrar errores técnicos en la interfaz.

## 7. Registrar usuarios normales

Abrí:

```text
http://localhost:3000/registro
```

Creá una cuenta con:

- nombre completo
- email
- contraseña
- teléfono opcional

El registro crea el usuario en Supabase Auth y una fila en `public.profiles` con `role = 'user'`.

Para probar una cuenta normal:

1. Cerrá sesión si estás como admin.
2. Entrá a `/registro`.
3. Creá una cuenta nueva.
4. Abrí `/canchas`.
5. Reservá una cancha.
6. Entrá a:

```text
http://localhost:3000/mis-reservas
```

Ahí solo deben aparecer las reservas asociadas a ese usuario.

## 8. Crear usuario administrador

El login es visible para usuarios y administradores. El panel de gestión no se muestra a usuarios normales:

- `/login`
- `/admin`

Para crear el acceso:

1. En Supabase abrí Authentication > Users.
2. Creá un usuario con email y contraseña.
3. Copiá o recordá el email exacto.
4. En SQL Editor ejecutá:

```sql
insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where email = 'tu-email@dominio.com'
on conflict (id) do update
set email = excluded.email,
    role = 'admin';
```

Si el perfil ya existía, ese SQL lo convierte en administrador.

## 9. Probar login y panel admin

1. Abrí:

```text
http://localhost:3000/login
```

2. Ingresá con el usuario creado en Supabase Auth.
3. Si entrás directo a `/admin` y el perfil tiene `role = 'admin'`, la app muestra el panel.

```text
http://localhost:3000/admin
```

4. En `/admin` verificá:
   - tarjetas de reservas totales, pendientes, confirmadas y canceladas
   - ingresos estimados de reservas confirmadas
   - listado real de reservas
   - datos de cliente, cancha, deporte, fecha, horario, estado y precio

Para probar protección:

- abrí `/admin` sin sesión: debe redirigir a `/login`
- iniciá sesión con un usuario sin `role = 'admin'`: debe mostrar acceso denegado
- con un usuario normal, el header no debe mostrar `Panel admin`

## 10. Probar que un usuario solo ve sus reservas

1. Creá dos usuarios normales distintos.
2. Con el usuario A, creá una reserva.
3. Cerrá sesión.
4. Con el usuario B, entrá a `/mis-reservas`.
5. No debe aparecer la reserva del usuario A.
6. Si intentás abrir el comprobante del usuario A con el usuario B, la página no debe mostrar el detalle.

## 11. Probar gestión de reservas

1. Creá una reserva pública desde `/canchas`.
2. Entrá a `/admin`.
3. En el listado de reservas cambiá el estado a:
   - `Pendiente`
   - `Confirmada`
   - `Cancelada`
4. Presioná `Guardar`.
5. La tabla debe actualizarse y mostrar un aviso profesional de éxito.

Las actualizaciones dependen de `supabase/admin-policies.sql` y `supabase/user-auth-reservations.sql`. No habilites lectura pública total de `reservations`.

## 12. Probar gestión de canchas

En `/admin`, en la sección `Canchas`:

1. Creá una cancha nueva con nombre, slug, deporte, precio y duración.
2. Editá una cancha existente: nombre, slug, deporte, descripción, superficie, ubicación, imagen, jugadores, duración y precio.
3. Desactivá una cancha quitando `Activa`.
4. Presioná `Guardar`.
5. Revisá `/canchas`:
   - si la cancha está activa, debe aparecer públicamente
   - si está inactiva, no debe aparecer en el listado público
6. Probá un slug repetido: Supabase debe rechazarlo y el panel debe mostrar error.

No borres físicamente canchas con reservas asociadas. Para ocultarlas, usá `is_active = false`.

## 13. Probar configuración del sitio

En `/admin`, en la sección `Configuración`:

1. Cambiá el nombre del club, título principal, subtítulo, ubicación, WhatsApp, email, horarios y texto del botón.
2. Presioná `Guardar configuración`.
3. Revisá:
   - home `/`
   - header
   - footer
   - `/canchas`
   - `/reservar/cancha-norte`

La web pública debe usar los textos nuevos. Si Supabase no tiene la tabla o falla la consulta, la app usa textos fallback y no se rompe.

## 14. Comandos útiles

```bash
npm install
npm run dev
npm run lint
npm run build
```
