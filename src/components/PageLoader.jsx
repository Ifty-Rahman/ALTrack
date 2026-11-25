import { TrophySpin } from "react-loading-indicators";

// The app's loading spinner. `inline` fits it to its container instead of the
// viewport, for pages that keep a toolbar or measured grid on screen while loading.
function PageLoader({ inline = false }) {
  return (
    <div
      className={`loading-indicator${inline ? " loading-indicator--inline" : ""}`}
      role="status"
      aria-label="Loading"
    >
      <TrophySpin color="var(--primary)" size="large" />
    </div>
  );
}

export default PageLoader;
