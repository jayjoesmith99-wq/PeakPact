declare module "https://deno.land/std@0.224.0/http/server.ts" {
  export interface DenoRequestLike {
    method?: string;
    json: () => Promise<unknown>;
  }

  export function serve(
    handler: (req: DenoRequestLike) => Response | Promise<Response>,
  ): void;
}
