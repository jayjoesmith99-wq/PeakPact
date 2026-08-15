declare module "https://deno.land/std@0.224.0/http/server.ts" {
  export interface DenoRequestLike {
    method?: string;
    headers: Headers;
    json: () => Promise<unknown>;
  }

  export function serve(
    handler: (req: DenoRequestLike) => Response | Promise<Response>,
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  type SupabaseUser = { id: string };

  export function createClient(
    url: string,
    key: string,
    options?: { global?: { headers?: Record<string, string> } },
  ): {
    auth: {
      getUser: () => Promise<{ data: { user: SupabaseUser | null }; error: unknown }>;
      admin: {
        deleteUser: (userId: string) => Promise<{ error: unknown }>;
      };
    };
  };
}

declare namespace Deno {
  namespace env {
    function get(name: string): string | undefined;
  }
}
