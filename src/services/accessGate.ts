export type AccessMode = 'SIGN_IN' | 'SIGN_UP';

export type AccessFormState = {
  codename: string;
  email: string;
  password: string;
};

export type AccessValidationResult = {
  ok: boolean;
  message: string;
  normalizedEmail?: string;
  normalizedCodename?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateAccessSubmission = (
  mode: AccessMode,
  form: AccessFormState,
): AccessValidationResult => {
  const normalizedEmail = form.email.trim().toLowerCase();
  const normalizedCodename = form.codename.trim().toUpperCase();

  if (mode === 'SIGN_UP' && normalizedCodename.length < 3) {
    return {
      ok: false,
      message: 'CODENAME MUST BE AT LEAST 3 CHARACTERS.',
    };
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      ok: false,
      message: 'VALID EMAIL REQUIRED FOR ACCESS AUTHORIZATION.',
    };
  }

  if (form.password.trim().length < 8) {
    return {
      ok: false,
      message: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS.',
    };
  }

  return {
    ok: true,
    message: mode === 'SIGN_UP' ? 'CONTRACT REGISTRATION ACCEPTED.' : 'ACCESS REQUEST ACCEPTED.',
    normalizedEmail,
    normalizedCodename,
  };
};