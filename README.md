# Reserva Cancha

Reserva Cancha is a full stack web application for managing sports court reservations.

The platform allows users to browse available courts, create an account, book time slots, view their reservations, and receive a reservation receipt. It also includes an admin dashboard to manage reservations, court availability, prices, and reservation statuses.

## Features

- Public landing page
- Court listing
- User registration and login
- Protected reservation flow
- Reservation receipt page
- User dashboard for personal reservations
- Admin dashboard protected by user roles
- Reservation status management
- Court price and availability management
- Duplicate time slot prevention
- Supabase database integration
- Responsive design

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security policies

## Main Routes

- `/`
- `/canchas`
- `/login`
- `/registro`
- `/mis-reservas`
- `/reservar/[slug]`
- `/reserva-exitosa?id=...`
- `/admin`

## Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=