import { ApolloLink, Observable } from "@apollo/client";

const DEFAULT_RETRY_SECONDS = 60;

let rateLimitListener = null;
let rateLimitExpiresAt = null;

export function notifyRateLimit(retrySeconds) {
  const expiresAt = Date.now() + retrySeconds * 1000;
  rateLimitExpiresAt = rateLimitExpiresAt
    ? Math.max(rateLimitExpiresAt, expiresAt)
    : expiresAt;
  if (rateLimitListener) {
    rateLimitListener(rateLimitExpiresAt);
  }
}

export function clearRateLimit() {
  if (!rateLimitExpiresAt) return;
  rateLimitExpiresAt = null;
  if (rateLimitListener) {
    rateLimitListener(null);
  }
}

export function subscribeRateLimit(callback) {
  rateLimitListener = callback;
  if (rateLimitExpiresAt) {
    callback(rateLimitExpiresAt);
  }
  return () => {
    if (rateLimitListener === callback) {
      rateLimitListener = null;
    }
  };
}

function hasStatus(error, status) {
  const networkError = error?.networkError;
  if (networkError?.statusCode === status) return true;
  const errors = [
    ...(networkError?.result?.errors ?? []),
    ...(error?.graphQLErrors ?? []),
  ];
  return errors.some((e) => e?.status === status || e?.extensions?.code === "RATE_LIMITED");
}

export function isRateLimitError(error) {
  if (!error) return false;
  if (hasStatus(error, 429)) return true;
  const message = String(error.message || "");
  return message.includes("429") || message.includes("Too Many Requests");
}

export function getRetryAfter(error) {
  const retryAfter = error?.networkError?.response?.headers?.get("retry-after");
  const seconds = Number.parseInt(retryAfter, 10);
  return Number.isFinite(seconds) && seconds > 0
    ? seconds
    : DEFAULT_RETRY_SECONDS;
}

export const rateLimitLink = new ApolloLink((operation, forward) =>
  new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => observer.next(result),
      error: (error) => {
        if (isRateLimitError(error)) {
          notifyRateLimit(getRetryAfter(error));
        }
        observer.error(error);
      },
      complete: () => observer.complete(),
    });
    return () => subscription.unsubscribe();
  }),
);