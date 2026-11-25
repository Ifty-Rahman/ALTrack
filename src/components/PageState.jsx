import { Link } from "react-router-dom";

// Centered message for empty, error and signed-out states. An action is either
// { label, to } for navigation or { label, onClick } for an in-page action.
function PageState({ title, message, actions = [], role }) {
  return (
    <div className="page-state" role={role}>
      <p className="page-state__title">{title}</p>
      {message && <p className="page-state__message">{message}</p>}
      {actions.length > 0 && (
        <div className="page-state__actions">
          {actions.map((action, index) => {
            const className = `page-state__action${index > 0 ? " page-state__action--secondary" : ""}`;
            return action.to ? (
              <Link key={action.label} className={className} to={action.to}>
                {action.label}
              </Link>
            ) : (
              <button key={action.label} type="button" className={className} onClick={action.onClick}>
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PageState;
