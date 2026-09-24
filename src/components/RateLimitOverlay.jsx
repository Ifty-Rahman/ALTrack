import { useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { MdHourglassEmpty } from "react-icons/md";
import { subscribeRateLimit, clearRateLimit } from "../services/RateLimit.js";
import "../css/RateLimitOverlay.css";

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

function RateLimitOverlay() {
  const client = useApolloClient();
  const [expiresAt, setExpiresAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const startedAtRef = useRef(null);
  const durationRef = useRef(0);
  const refetchingRef = useRef(false);

  useEffect(() => subscribeRateLimit(setExpiresAt), []);

  useEffect(() => {
    if (!expiresAt) {
      refetchingRef.current = false;
      setNow(Date.now());
      return;
    }
    if (!startedAtRef.current || startedAtRef.current > expiresAt) {
      startedAtRef.current = expiresAt;
      durationRef.current = Math.max(1, (expiresAt - Date.now()) / 1000);
    }
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || expiresAt > Date.now()) return;
    if (refetchingRef.current) return;
    refetchingRef.current = true;
    clearRateLimit();
    startedAtRef.current = null;
    client.reFetchObservableQueries().finally(() => {
      refetchingRef.current = false;
    });
  }, [expiresAt, now, client]);

  if (!expiresAt) return null;

  const remainingSeconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const progress =
    durationRef.current > 0
      ? Math.min(100, (remainingSeconds / durationRef.current) * 100)
      : 0;

  return (
    <div className="rate-limit-overlay" role="alert" aria-live="assertive">
      <div className="rate-limit-card">
        <div className="rate-limit-icon">
          <MdHourglassEmpty size={48} />
        </div>
        <h2 className="rate-limit-title">API limit reached</h2>
        <p className="rate-limit-message">
          AniList is rate limiting requests right now. You can continue in...
        </p>
        <div className="rate-limit-timer" aria-label={formatDuration(remainingSeconds)}>
          {formatDuration(remainingSeconds)}
        </div>
        <div className="rate-limit-progress">
          <div
            className="rate-limit-progress__fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default RateLimitOverlay;