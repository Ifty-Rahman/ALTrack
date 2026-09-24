import { isRateLimitError } from "../services/RateLimit.js";

const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please log in again.";

function isSessionProblem(err) {
  const networkStatus = err?.networkError?.statusCode;
  const graphqlMessage = err?.graphQLErrors?.[0]?.message ?? "";
  return (
    networkStatus === 401 ||
    networkStatus === 403 ||
    /invalid token|not authenticated|session/i.test(graphqlMessage)
  );
}

export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  if (isRateLimitError(err)) return null;

  if (isSessionProblem(err)) return SESSION_EXPIRED_MESSAGE;

  if (err?.graphQLErrors?.length) {
    return err.graphQLErrors[0].message || fallback;
  }

  if (err?.networkError) {
    const networkMessage = err.networkError.message;
    if (typeof networkMessage === "string" && networkMessage.trim()) {
      if (/failed to fetch|network/i.test(networkMessage)) {
        return "Network error. Check your connection and try again.";
      }
      return networkMessage;
    }
    return "Network error. Check your connection and try again.";
  }

  return (typeof err?.message === "string" && err.message.trim()) || fallback;
}