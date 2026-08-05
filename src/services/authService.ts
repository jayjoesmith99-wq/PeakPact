import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';

export type AuthOutcome = {
  ok: boolean;
  message: string;
  requiresEmailConfirmation?: boolean;
  session?: Session | null;
  user?: User | null;
};

export const isLiveAuthEnabled = (): boolean => !!supabase;

export const isPeakPactEliteOverride = (email?: string | null, userId?: string | null): boolean => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedUserId = userId?.trim();
  return normalizedEmail === 'peakpactelite@gmail.com' || normalizedUserId === '5fa53d43-819c-45cb-9178-bb54a8b9077d';
};

const formatAuthErrorMessage = (fallback: string, errorMessage?: string): string =>
  errorMessage?.trim() ? errorMessage.toUpperCase() : fallback;

export const extractOperatorCodename = (user?: User | null, fallbackEmail?: string): string => {
  const metadataCodename = typeof user?.user_metadata?.codename === 'string'
    ? user.user_metadata.codename.trim()
    : '';

  if (metadataCodename) {
    return metadataCodename.toUpperCase();
  }

  const emailValue = user?.email ?? fallbackEmail ?? '';
  const handle = emailValue.split('@')[0]?.trim();
  return handle ? handle.toUpperCase() : 'OPERATOR';
};

export const signUpOperator = async ({
  email,
  password,
  codename,
}: {
  email: string;
  password: string;
  codename: string;
}): Promise<AuthOutcome> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        codename,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      message: formatAuthErrorMessage('AUTH REGISTRATION FAILED.', error.message),
    };
  }

  if (!data.session) {
    return {
      ok: true,
      message: 'CHECK EMAIL TO COMPLETE AUTHORIZATION.',
      requiresEmailConfirmation: true,
      session: null,
      user: data.user,
    };
  }

  return {
    ok: true,
    message: 'ACCESS GRANTED.',
    session: data.session,
    user: data.user,
  };
};

export const signInOperator = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthOutcome> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: formatAuthErrorMessage('ACCESS DENIED.', error.message),
    };
  }

  return {
    ok: true,
    message: 'ACCESS GRANTED.',
    session: data.session,
    user: data.user,
  };
};

export const restoreOperatorSession = async (): Promise<Session | null> => {
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: null }; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null }, error: new Error('Auth timeout') }), 2500)
    );

    const result = (await Promise.race([sessionPromise, timeoutPromise])) as any;
    if (result.error) {
      return null;
    }

    return result.data?.session ?? null;
  } catch {
    return null;
  }
};

export const subscribeToAuthState = (
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): Subscription => {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
};

export const signOutOperator = async (): Promise<AuthOutcome> => {
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    return {
      ok: false,
      message: formatAuthErrorMessage('SIGN OUT FAILED.', error.message),
    };
  }

  return {
    ok: true,
    message: 'TERMINAL LOCKED.',
  };
};