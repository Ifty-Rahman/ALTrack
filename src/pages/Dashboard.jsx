import { useQuery, useMutation } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import "../css/Dashboard.css";
import { GET_CURRENT_MEDIA, GET_CURRENT_USER } from "../services/Queries.jsx";
import {
  UPDATE_ANIME_ENTRY,
  UPDATE_MANGA_ENTRY,
} from "../services/Mutation.jsx";
import { useEffect } from "react";
import { TrophySpin } from "react-loading-indicators";
import MediaTypeToggle from "../components/MediaTypeToggle.jsx";
import PageState from "../components/PageState.jsx";
import SignedOutState from "../components/SignedOutState.jsx";
import DashboardCard from "../components/Dashboard/DashboardCard.jsx";
import DashboardEmptyState from "../components/Dashboard/DashboardEmptyState.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";
import { normalizeType } from "../utils/discoverSections.js";

function Dashboard() {
  const { authToken, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const mediaType = normalizeType(searchParams.get("type"));
  const setMediaType = (type) =>
    setSearchParams(type === "ANIME" ? {} : { type }, { replace: true });
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const token = params.get("access_token");
      if (token) {
        login(token);
        window.history.replaceState(null, null, window.location.pathname);
        window.location.reload();
      }
    }
  }, [login]);

  const { data: viewerData } = useQuery(GET_CURRENT_USER, {
    skip: !authToken,
  });
  const username = viewerData?.Viewer?.name;

  const { loading, error, data, refetch } = useQuery(GET_CURRENT_MEDIA, {
    variables: { userName: username, type: mediaType },
    skip: !authToken || !username,
    fetchPolicy: "cache-first",
  });

  const [updateAnimeEntry] = useMutation(UPDATE_ANIME_ENTRY, {
    update(cache, { data: { SaveMediaListEntry } }) {
      cache.modify({
        id: cache.identify({
          __typename: "MediaList",
          id: SaveMediaListEntry.id,
        }),
        fields: {
          progress: () => SaveMediaListEntry.progress,
        },
      });
    },
  });

  const [updateMangaEntry] = useMutation(UPDATE_MANGA_ENTRY, {
    update(cache, { data: { SaveMediaListEntry } }) {
      cache.modify({
        id: cache.identify({
          __typename: "MediaList",
          id: SaveMediaListEntry.id,
        }),
        fields: {
          progress: () => SaveMediaListEntry.progress,
          progressVolumes: () => SaveMediaListEntry.progressVolumes,
        },
      });
    },
  });

  if (!authToken) {
    return <SignedOutState message="Log in with your AniList account to track what you're watching and reading." />;
  }

  if (loading)
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );

  const entries = data?.MediaListCollection?.lists?.[0]?.entries || [];
  const scoreFormat = data?.User?.mediaListOptions?.scoreFormat;
  const hasEntries = entries.length > 0;
  const typeLabel = mediaType === "ANIME" ? "anime" : "manga";

  let content = null;
  if (error && !isRateLimitError(error)) {
    content = (
      <PageState
        role="alert"
        title="Couldn't load your dashboard"
        message={getApiErrorMessage(error, "Please try again in a moment.")}
        actions={[{ label: "Try again", onClick: () => refetch() }]}
      />
    );
  } else if (data && hasEntries) {
    content = (
      <div className="dashboard-grid">
        {entries.map((entry) => (
          <DashboardCard
            key={entry.id}
            entry={entry}
            mediaType={mediaType}
            scoreFormat={scoreFormat}
            updateAnimeEntry={updateAnimeEntry}
            updateMangaEntry={updateMangaEntry}
          />
        ))}
      </div>
    );
  } else if (data) {
    content = <DashboardEmptyState typeLabel={typeLabel} mediaType={mediaType} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-toggle">
        <MediaTypeToggle value={mediaType} onChange={setMediaType} />
      </div>
      {content}
    </div>
  );
}

export default Dashboard;
