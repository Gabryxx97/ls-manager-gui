import { FieldValues } from "react-hook-form";

export const sanitizeUser = (values: FieldValues) => {
  const user = { ...values };
  delete user.confirmPassword;
  if (!user.password) delete user.password;
  return user;
};

export const validateUserForm = (isEdit = false) => (values: FieldValues) => {
  const errors: Record<string, string> = {};
  const password = typeof values.password === "string" ? values.password : "";
  const confirmation =
    typeof values.confirmPassword === "string" ? values.confirmPassword : "";

  if (!isEdit && !password.trim()) {
    errors.password = "La password è obbligatoria";
  }
  if (isEdit && password && !password.trim()) {
    errors.password = "La password non può essere vuota";
  }
  if (isEdit && confirmation && !password) {
    errors.password = "Inserisci la nuova password";
  }
  if ((password || confirmation) && password !== confirmation) {
    errors.confirmPassword = "Le password non coincidono";
  }
  return errors;
};
