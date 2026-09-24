import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import "../css/Dashboard.css";
import { GET_CURRENT_MEDIA, GET_CURRENT_USER } from "../services/Queries.jsx";
import {
  UPDATE_ANIME_ENTRY,
  UPDATE_MANGA_ENTRY,
} from "../services/Mutation.jsx";
import { useState, useEffect } from "react";
import { TrophySpin } from "react-loading-indicators";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import DashboardCard from "../components/Dashboard/DashboardCard.jsx";
import DashboardEmptyState from "../components/Dashboard/DashboardEmptyState.jsx";
import { toast } from "react-toastify";
import { isRateLimitError } from "../services/RateLimit.js";

function Dashboard() {
  const navigate = useNavigate();
  const redirectToDiscover = () => navigate("/");
  const { authToken, login } = useAuth();
  const [mediaType, setMediaType] = useState("ANIME");
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

  const { loading, error, data } = useQuery(GET_CURRENT_MEDIA, {
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

  if (loading)
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );
  if (error) {
    if (isRateLimitError(error)) return null;
    return toast.error(`${error?.message || "Error occurred"}, try again later`);
  }

  const entries = data?.MediaListCollection?.lists?.[0]?.entries || [];
  const scoreFormat = data?.User?.mediaListOptions?.scoreFormat;
  const hasEntries = entries.length > 0;

  return (
    <div>
      {authToken ? (
        <div className="dashboard-container">
          <div className="dashboard-toggle">
            <ToggleButtonGroup
              className="toggle-group"
              value={mediaType}
              exclusive
              color="white"
              onChange={(e, value) => {
                if (value) setMediaType(value);
              }}
            >
              <ToggleButton
                className="toggle-anime"
                value="ANIME"
                aria-label="anime"
              >
                Anime
              </ToggleButton>
              <ToggleButton
                className="toggle-manga"
                value="MANGA"
                aria-label="manga"
              >
                Manga
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {!loading && data && hasEntries ? (
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
          ) : !loading && data ? (
            <DashboardEmptyState onRedirectToDiscover={redirectToDiscover} />
          ) : null}
        </div>
      ) : (
        <div className="Not-Logged-In">
          <p>Please log in to see dashboard</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
