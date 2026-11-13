import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);
export type Project = { id: string; title: string; caption: string; tags: string[]; url: string; repo: string; image: string };
export type Profile = { name: string; role: string; tagline: string; bio: string; email: string; github: string; available: boolean };
export type Message = { id: string; name: string; email: string; budget: string; text: string; read: boolean; created_at: string };
export const defaultProfile: Profile = { name: "Ky", role: "Full-Stack Geliştirici", tagline: "Yağmur dinmiyordu. Kod da öyle.", bio: "", email: "", github: "https://github.com/cn-Ky", available: true };
