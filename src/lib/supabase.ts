import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const globalKey = "__supabase_client__";
type G = typeof globalThis & { [globalKey]?: ReturnType<typeof createClient> };
const g = globalThis as G;
if (!g[globalKey]) {
  g[globalKey] = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { storage: localStorage, persistSession: true, autoRefreshToken: true }
  });
}
export const supabase = g[globalKey]!;
