import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, getServerEnv } from "../env";
import type { Database } from "./database.types";

let _supabaseAdmin: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_supabaseAdmin === null) {
    _supabaseAdmin = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
      getServerEnv().SUPABASE_SECRET_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Backwards compatibility - but prefer getSupabaseAdmin() for lazy loading
export const supabaseAdmin = {
  from: (...args: Parameters<SupabaseClient<Database>["from"]>) =>
    getSupabaseAdmin().from(...args),
};
