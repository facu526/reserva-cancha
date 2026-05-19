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
  player_count?: number | null;
  slot_duration_minutes?: number | null;
  is_active: boolean;
  created_at: string;
};

export type SiteSettings = {
  key: string;
  club_name: string;
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  footer_description: string;
  primary_cta_label: string;
  hero_badge_text: string;
  home_card_title: string;
  home_card_subtitle: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  hero_image_url?: string | null;
  home_featured_image_url?: string | null;
  contact_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HeaderUser = {
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
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
