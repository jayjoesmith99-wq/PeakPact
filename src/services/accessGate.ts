<<<<<<< HEAD
export type AccessMode = 'SIGN_IN' | 'SIGN_UP';
=======
export type AccessMode = "SIGN_IN" | "SIGN_UP";
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37

export type AccessFormState = {
  codename: string;
  email: string;
  password: string;
};

<<<<<<< HEAD
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
=======
export function validateAccessSubmission(mode: AccessMode, form: AccessFormState) {
  const email = form.email.trim();
  const codename = form.codename.trim();
  const password = form.password.trim();

  if (!email) {
    return { ok: false, message: "EMAIL REQUIRED" };
  }
  if (mode === "SIGN_UP" && password.length < 6) {
    return { ok: false, message: "PASSWORD MUST BE 6+ CHARACTERS" };
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
  }

  return {
    ok: true,
<<<<<<< HEAD
    message: mode === 'SIGN_UP' ? 'CONTRACT REGISTRATION ACCEPTED.' : 'ACCESS REQUEST ACCEPTED.',
    normalizedEmail,
    normalizedCodename,
  };
};
=======
    normalizedEmail: email.toLowerCase(),
    normalizedCodename: codename ? codename.toUpperCase() : "OPERATOR",
    message: "ACCESS VALIDATED",
  };
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
