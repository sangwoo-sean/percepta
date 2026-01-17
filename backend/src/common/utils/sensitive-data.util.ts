const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
];

const REDACTED = '[REDACTED]';

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(
    (field) =>
      lowerKey === field.toLowerCase() ||
      lowerKey.includes(field.toLowerCase()),
  );
}

export function maskSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item)) as T;
  }

  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        masked[key] = REDACTED;
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked as T;
  }

  return data;
}
