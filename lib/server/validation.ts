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

export function validateProfileUpdate(input: {
  fullName?: unknown;
  newPassword?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";

  if (!fullName) errors.fullName = "Full name is required.";
  else if (fullName.length < 2) errors.fullName = "Full name is too short.";

  if (typeof input.newPassword === "string" && input.newPassword.length > 0) {
    if (input.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters.";
    }
  }

  return errors;
}

export function validateParkingSubmission(input: {
  name?: unknown;
  address?: unknown;
  city?: unknown;
  lat?: unknown;
  lng?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const address = typeof input.address === "string" ? input.address.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";

  if (!name) errors.name = "Parking name is required.";
  if (!address) errors.address = "Address is required.";
  if (!city) errors.city = "City is required.";
  if (typeof input.lat !== "number" || typeof input.lng !== "number") {
    errors.location = "Drop a pin on the map to set the location.";
  }

  return errors;
}

const VALID_VEHICLE_TYPES = ["Car", "Motorcycle", "Bike", "Van/SUV", "Truck"];

export function validateReview(input: {
  rating?: unknown;
  comment?: unknown;
  vehicleType?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const rating = typeof input.rating === "number" ? input.rating : Number(input.rating);
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  const vehicleType = typeof input.vehicleType === "string" ? input.vehicleType : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Choose a rating from 1 to 5 stars.";
  }

  if (!comment) errors.comment = "Share a few words about your experience.";
  else if (comment.length < 5) errors.comment = "Review is too short.";
  else if (comment.length > 1000) errors.comment = "Review is too long (max 1000 characters).";

  if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
    errors.vehicleType = "Select a vehicle type.";
  }

  return errors;
}

const VALID_REPORT_REASONS = [
  "Incorrect information",
  "Permanently closed",
  "Inappropriate content",
  "Duplicate listing",
  "Other",
];

export function validateReport(input: { reason?: unknown; details?: unknown }): FieldErrors {
  const errors: FieldErrors = {};
  const reason = typeof input.reason === "string" ? input.reason : "";
  const details = typeof input.details === "string" ? input.details.trim() : "";

  if (!VALID_REPORT_REASONS.includes(reason)) {
    errors.reason = "Select a reason for reporting.";
  }
  if (reason === "Other" && !details) {
    errors.details = "Add a few details so moderators know what's wrong.";
  }
  if (details.length > 1000) {
    errors.details = "Details are too long (max 1000 characters).";
  }

  return errors;
}

const VALID_CONTACT_SUBJECTS = [
  "General Inquiry",
  "Report Incorrect Information",
  "Partnership",
  "Bug Report",
];

export function validateContactMessage(input: {
  fullName?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const subject = typeof input.subject === "string" ? input.subject : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!fullName) errors.fullName = "Your name is required.";
  else if (fullName.length > 120) errors.fullName = "Name is too long.";

  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!VALID_CONTACT_SUBJECTS.includes(subject)) errors.subject = "Choose a subject.";

  if (!message) errors.message = "Write a message.";
  else if (message.length < 10) errors.message = "Message is too short.";
  else if (message.length > 5000) errors.message = "Message is too long (max 5000 characters).";

  return errors;
}

export function validateNewsletter(input: { email?: unknown }): FieldErrors {
  const errors: FieldErrors = {};
  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
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
