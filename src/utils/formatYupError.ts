import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) =>
  err.inner.map(({ path, message }) => {
    return { path, message };
  });
