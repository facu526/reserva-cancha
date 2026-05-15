export type Court = {
  id: string;
  slug?: string;
  name: string;
  sport_type: string;
  description: string | null;
  surface?: string | null;
  location?: string | null;
  price_per_hour: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export type Reservation = {
  id: string;
  user_id?: string | null;
  court_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  total_price: number | null;
  created_at: string;
  courts?: Pick<Court, "name" | "sport_type"> | null;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
};

export type ActionState = {
  ok: boolean;
  message: string;
};
