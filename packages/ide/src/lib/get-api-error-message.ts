import { isAxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!isAxiosError(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;

  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return fallbackMessage;
}
