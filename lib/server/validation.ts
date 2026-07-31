export interface FieldErrors {
  [field: string]: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(input: {
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};

  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!fullName) errors.fullName = "Full name is required.";
  else if (fullName.length < 2) errors.fullName = "Full name is too short.";

  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters.";

  return errors;
}

export function validateForgotPassword(input: { email?: unknown }): FieldErrors {
  const errors: FieldErrors = {};
  const email = typeof input.email === "string" ? input.email.trim() : "";

  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  return errors;
}

export function validateResetPassword(input: {
  token?: unknown;
  password?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const token = typeof input.token === "string" ? input.token.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!token) errors.token = "Reset link is missing or invalid.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters.";

  return errors;
}

export function validateLogin(input: { email?: unknown; password?: unknown }): FieldErrors {
  const errors: FieldErrors = {};

  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";

  return errors;
}
