import { type AccessMode } from "./accessGate";

export function extractOperatorCodename(user: { email?: string } | null, fallback?: string) {
  if (user?.email) {
    return user.email.split("@")[0].toUpperCase();
  }
  return (fallback || "OPERATOR").toUpperCase();
}

export function isLiveAuthEnabled(): boolean {
  return false;
}

export function isPeakPactEliteOverride(email: string | null, userId: string | null): boolean {
  return false;
}

export async function restoreOperatorSession(): Promise<{ user: { email?: string; id?: string } } | null> {
  return null;
}

export type AuthResult = {
  ok: boolean;
  message: string;
  user: { email?: string; id?: string } | null;
  requiresEmailConfirmation?: boolean;
};

export async function signInOperator({ email, password }: { email: string; password: string }): Promise<AuthResult> {
  return {
    ok: true,
    message: "ACCESS GRANTED",
    user: { email, id: "local-user" },
    requiresEmailConfirmation: false,
  };
}

export async function signUpOperator({
  email,
  password,
  codename,
}: {
  email: string;
  password: string;
  codename: string;
}): Promise<AuthResult> {
  return {
    ok: true,
    message: "ACCOUNT CREATED",
    user: { email, id: "local-user" },
    requiresEmailConfirmation: false,
  };
}

export async function signOutOperator(): Promise<{ ok: boolean; message: string }> {
  return { ok: true, message: "TERMINAL LOCKED" };
}

export function subscribeToAuthState(
  callback: (event: unknown, session: { user?: { email?: string; id?: string } } | null) => void,
) {
  return {
    unsubscribe: () => {},
  };
}
