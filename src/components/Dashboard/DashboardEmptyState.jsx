import PageState from "../PageState.jsx";

function DashboardEmptyState({ typeLabel, mediaType }) {
  const verb = mediaType === "MANGA" ? "reading" : "watching";
  return (
    <PageState
      title={`You're not ${verb} any ${typeLabel} right now`}
      message={`Titles you mark as currently ${verb} on AniList show up here, so you can update progress and scores quickly.`}
      actions={[
        { label: "Find something on Discover", to: mediaType === "ANIME" ? "/Discover" : `/Discover?type=${mediaType}` },
        { label: "Open your lists", to: mediaType === "ANIME" ? "/Userlist" : `/Userlist?type=${mediaType}` },
      ]}
    />
  );
}

export default DashboardEmptyState;
