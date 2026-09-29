export function ok<T>(data: T) {
  return { success: true, data, error: null };
}

export function fail(code: string, message: string) {
  return { success: false, data: null, error: { code, message } };
}

export type ApiResponse<T> = ReturnType<typeof ok<T>> | ReturnType<typeof fail>;

export function errorEnvelope(code: string, message: string) {
  return fail(code, message);
}