import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import Trending from "../components/Discover/Trending.jsx";
import PopularThisSeason from "../components/Discover/PopularThisSeason.jsx";
import UpcomingNextSeason from "../components/Discover/Upcoming.jsx";
import PopularManhwa from "../components/Discover/PopularManhwa.jsx";
import PopularAllTime from "../components/Discover/PopularAllTime.jsx";
import { GET_DISCOVER_PAGE } from "../services/Queries.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { TrophySpin } from "react-loading-indicators";
import "../css/Discover.css";

function getSeasons(now = new Date()) {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let season = "WINTER";
  if (month >= 3 && month <= 5) season = "SPRING";
  else if (month >= 6 && month <= 8) season = "SUMMER";
  else if (month >= 9 && month <= 11) season = "FALL";

  let nextSeason = "SPRING";
  if (season === "SPRING") nextSeason = "SUMMER";
  else if (season === "SUMMER") nextSeason = "FALL";
  else if (season === "FALL") nextSeason = "WINTER";

  const nextYear = season === "FALL" ? year + 1 : year;
  return { season, year, nextSeason, nextYear };
}

function Discover() {
  const [mediaType, setMediaType] = useState("ANIME");
  const { season, year, nextSeason, nextYear } = getSeasons();

  const { loading, error, data } = useQuery(GET_DISCOVER_PAGE, {
    variables: {
      type: mediaType,
      perPage: 15,
      season,
      seasonYear: year,
      nextSeason,
      nextYear,
    },
    fetchPolicy: "cache-first",
  });

  let content = null;
  if (loading) {
    content = (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );
  } else if (error) {
    if (!isRateLimitError(error)) {
      toast.error(`${error.message || "Error occurred"}, try again later`);
    }
  } else {
    content = (
      <>
        <Trending media={data?.trending?.media ?? []} type={mediaType} />
        {mediaType === "ANIME" ? (
          <>
            <PopularThisSeason media={data?.seasonal?.media ?? []} type={mediaType} />
            <UpcomingNextSeason media={data?.upcoming?.media ?? []} type={mediaType} />
          </>
        ) : (
          <PopularManhwa media={data?.manhwa?.media ?? []} type={mediaType} />
        )}
        <PopularAllTime media={data?.popular?.media ?? []} type={mediaType} />
      </>
    );
  }

  return (
    <div className="discover">
      <div className="discover-toggle">
        <ToggleButtonGroup
          className="toggle-group"
          value={mediaType}
          exclusive
          onChange={(_, value) => value && setMediaType(value)}
        >
          <ToggleButton value="ANIME" aria-label="anime">
            Anime
          </ToggleButton>
          <ToggleButton value="MANGA" aria-label="manga">
            Manga
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {content}
    </div>
  );
}

export default Discover;