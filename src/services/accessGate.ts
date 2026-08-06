export type AccessMode = "SIGN_IN" | "SIGN_UP";

export type AccessFormState = {
  codename: string;
  email: string;
  password: string;
};

export function validateAccessSubmission(mode: AccessMode, form: AccessFormState) {
  const email = form.email.trim();
  const codename = form.codename.trim();
  const password = form.password.trim();

  if (!email) {
    return { ok: false, message: "EMAIL REQUIRED" };
  }
  if (mode === "SIGN_UP" && password.length < 6) {
    return { ok: false, message: "PASSWORD MUST BE 6+ CHARACTERS" };
  }

  return {
    ok: true,
    normalizedEmail: email.toLowerCase(),
    normalizedCodename: codename ? codename.toUpperCase() : "OPERATOR",
    message: "ACCESS VALIDATED",
  };
}
