import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server client (Server Components, Server Actions, Route Handlers).
// Uses the anon key + the user's session cookies. Never use the service-role key here.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component: cookies are read-only there. Safe to ignore.
          }
        },
      },
    },
  );
}
