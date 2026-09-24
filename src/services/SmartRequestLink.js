import { ApolloLink, Observable } from "@apollo/client";

export const SMART_LINK_CONFIG = {
  windowMs: 10000,
  maxRequestsPerWindow: 6,
  minGapMs: 300,
  maxQueueWaitMs: 2500,
  mutationMaxDelayMs: 300,
};

const schedule = [];

function trimSlots(now) {
  while (
    schedule.length &&
    schedule[0] <= now - SMART_LINK_CONFIG.windowMs
  ) {
    schedule.shift();
  }
}

function lastSlot() {
  return schedule[schedule.length - 1];
}

function isMutation(operation) {
  const definition = operation.query?.definitions?.find(
    (d) => d.kind === "OperationDefinition",
  );
  return definition?.operation === "mutation";
}

export const smartRequestLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const now = Date.now();
    trimSlots(now);
    const last = lastSlot();

    let reservedAt;
    if (isMutation(operation)) {
      const gap = last != null ? Math.max(now, last + SMART_LINK_CONFIG.minGapMs) : now;
      reservedAt = Math.min(gap, now + SMART_LINK_CONFIG.mutationMaxDelayMs);
    } else if (schedule.length >= SMART_LINK_CONFIG.maxRequestsPerWindow) {
      const budgetFreed = schedule[0] + SMART_LINK_CONFIG.windowMs;
      const nextGap = last != null ? last + SMART_LINK_CONFIG.minGapMs : now;
      reservedAt = Math.min(
        now + SMART_LINK_CONFIG.maxQueueWaitMs,
        Math.max(now, budgetFreed, nextGap),
      );
    } else {
      reservedAt = Math.max(now, last != null ? last + SMART_LINK_CONFIG.minGapMs : now);
    }

    schedule.push(reservedAt);

    const debug =
      typeof import.meta.env !== "undefined" &&
      import.meta.env.VITE_LOG_QUERIES;
    if (debug) {
      const name = operation.query?.definitions?.[0]?.name?.value ?? "operation";
      const kind = isMutation(operation) ? "mutation" : "query";
      console.log(
        `[api] ${kind} ${name} (slot +${Math.max(0, reservedAt - now)}ms, ` +
          `${schedule.length}/${SMART_LINK_CONFIG.maxRequestsPerWindow} in window)`,
      );
    }

    let innerSubscription;
    let fired = false;

    const fire = () => {
      if (fired) return;
      fired = true;
      innerSubscription = forward(operation).subscribe({
        next: (value) => observer.next(value),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    };

    const timer = setTimeout(fire, Math.max(0, reservedAt - now));

    return () => {
      clearTimeout(timer);
      if (innerSubscription) innerSubscription.unsubscribe();
    };
  });
});