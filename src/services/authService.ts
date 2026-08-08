import { supabase, isSupabaseConfigured } from '../../supabaseClient';

function getAuthUnavailableMessage(action: string) {
  return `${action} is unavailable because Supabase Auth is not configured.`;
}

export type AuthUser = {
  id?: string;
  email?: string | null;
  created_at?: string;
};

export type AuthSession = {
  user: AuthUser | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
};

export type AuthResult = {
  ok: boolean;
  message: string;
  user: AuthUser | null;
  requiresEmailConfirmation?: boolean;
  error?: string;
};

export function extractOperatorCodename(user: { email?: string | null } | null, fallback?: string) {
  if (user?.email) {
    return user.email.split('@')[0].toUpperCase();
  }
  return (fallback || 'OPERATOR').toUpperCase();
}

export function normalizeAuthSession(session: any): AuthSession {
  return {
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
      created_at: session.user.created_at,
    } : null,
    accessToken: session?.access_token ?? session?.accessToken ?? null,
    refreshToken: session?.refresh_token ?? session?.refreshToken ?? null,
    expiresAt: session?.expires_at ?? session?.expiresAt ?? null,
  };
}

export function isLiveAuthEnabled(): boolean {
  return isSupabaseConfigured();
}

export function isPeakPactEliteOverride(_email: string | null, _userId: string | null): boolean {
  return false;
}

export async function restoreOperatorSession(): Promise<AuthSession | null> {
  if (!isLiveAuthEnabled()) {
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      return null;
    }

    return normalizeAuthSession(session);
  } catch {
    return null;
  }
}

export async function signInOperator({ email, password }: { email: string; password: string }): Promise<AuthResult> {
  if (!isLiveAuthEnabled()) {
    return {
      ok: false,
      message: getAuthUnavailableMessage('Sign in'),
      user: null,
      error: 'Supabase Auth is not configured.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return {
        ok: false,
        message: error.message || 'AUTH FAILED',
        user: null,
        error: error.message,
      };
    }

    return {
      ok: true,
      message: 'ACCESS GRANTED',
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      requiresEmailConfirmation: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AUTH FAILED';
    return {
      ok: false,
      message,
      user: null,
      error: message,
    };
  }
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
  if (!isLiveAuthEnabled()) {
    return {
      ok: false,
      message: getAuthUnavailableMessage('Sign up'),
      user: null,
      error: 'Supabase Auth is not configured.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { codename },
      },
    });

    if (error) {
      return {
        ok: false,
        message: error.message || 'ACCOUNT CREATION FAILED',
        user: null,
        error: error.message,
      };
    }

    return {
      ok: true,
      message: data.session ? 'ACCOUNT CREATED' : 'CHECK YOUR EMAIL',
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      requiresEmailConfirmation: !data.session,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ACCOUNT CREATION FAILED';
    return {
      ok: false,
      message,
      user: null,
      error: message,
    };
  }
}

export async function resetOperatorPassword(email: string): Promise<AuthResult> {
  if (!isLiveAuthEnabled()) {
    return {
      ok: false,
      message: getAuthUnavailableMessage('Password reset'),
      user: null,
      error: 'Supabase Auth is not configured.',
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return {
        ok: false,
        message: error.message || 'RESET FAILED',
        user: null,
        error: error.message,
      };
    }

    return {
      ok: true,
      message: 'PASSWORD RESET REQUESTED',
      user: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RESET FAILED';
    return {
      ok: false,
      message,
      user: null,
      error: message,
    };
  }
}

export async function signOutOperator(): Promise<{ ok: boolean; message: string }> {
  if (!isLiveAuthEnabled()) {
    return { ok: false, message: 'Sign out is unavailable because Supabase Auth is not configured.' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { ok: false, message: error.message || 'SIGN OUT FAILED' };
    }

    return { ok: true, message: 'TERMINAL LOCKED' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'SIGN OUT FAILED' };
  }
}

export function subscribeToAuthState(callback: (event: unknown, session: AuthSession | null) => void) {
  if (!isLiveAuthEnabled()) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
    callback(event, normalizeAuthSession(session));
  });

  return subscription;
}
