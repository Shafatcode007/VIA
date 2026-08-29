// src/lib/utils/apiError.ts
/**
 * Convert any thrown API error into one human-readable string.
 * Prevents the "[object Object]" toast bug caused by FastAPI 422 bodies
 * (detail = array of objects) or raw Response/Error-like objects.
 */

interface FastApiFieldError {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object') {
    const body = error as { detail?: unknown; message?: string };
    if (typeof body.message === 'string' && body.message) return body.message;
    if (typeof body.detail === 'string' && body.detail) return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((field) => {
            const item = field as FastApiFieldError;
            const where = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
            return where ? `${where}: ${item.msg ?? 'invalid'}` : item.msg ?? 'Invalid value';
          })
        .join(' | ');
    }
  }
  return 'Something went wrong. Please try again.';
}