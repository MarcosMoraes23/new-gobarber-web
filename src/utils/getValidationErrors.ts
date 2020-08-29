import { ValidationError } from 'yup';

interface Errors {
  [key: string]: string;
}

export default function getValidationErrors(error: ValidationError): Errors {
  const validationErrors: Errors = {};

  error.inner.forEach((item) => {
    validationErrors[item.path] = item.message;
  });

  return validationErrors;
}
