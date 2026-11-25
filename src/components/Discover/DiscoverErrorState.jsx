function DiscoverErrorState({ message, onRetry }) {
  return (
    <div className="discover-state" role="alert">
      <p className="discover-state__title">Couldn't load this list</p>
      <p className="discover-state__message">{message}</p>
      {onRetry && (
        <button type="button" className="discover-state__action" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default DiscoverErrorState;
