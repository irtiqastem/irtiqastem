import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Singleton pattern to prevent multiple instances
const globalKey = "__supabase_client__";
type GlobalWithSupabase = typeof globalThis & { [globalKey]?: ReturnType<typeof createClient> };

const globalWithSupabase = globalThis as GlobalWithSupabase;

if (!globalWithSupabase[globalKey]) {
  globalWithSupabase[globalKey] = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = globalWithSupabase[globalKey]!;
