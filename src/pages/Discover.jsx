import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import DiscoverRow from "../components/Discover/DiscoverRow.jsx";
import MediaTypeToggle from "../components/MediaTypeToggle.jsx";
import PageState from "../components/PageState.jsx";
import PageLoader from "../components/PageLoader.jsx";
import { GET_DISCOVER_PAGE } from "../services/Queries.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";
import {
  getBrowseUrl,
  getSeasons,
  getSectionSubtitle,
  getSectionsForType,
  normalizeType,
} from "../utils/discoverSections.js";
import "../css/Discover.css";

const ROW_SIZE = 15;

function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mediaType = normalizeType(searchParams.get("type"));
  const seasons = useMemo(() => getSeasons(), []);
  const sections = getSectionsForType(mediaType);

  const { loading, error, data, refetch } = useQuery(GET_DISCOVER_PAGE, {
    variables: {
      type: mediaType,
      perPage: ROW_SIZE,
      season: seasons.season,
      seasonYear: seasons.year,
      nextSeason: seasons.nextSeason,
      nextYear: seasons.nextYear,
      isAnime: mediaType === "ANIME",
    },
    fetchPolicy: "cache-first",
  });

  // Rate-limit errors keep the spinner up; the overlay refetches when it clears.
  const isWaiting = loading || isRateLimitError(error);
  const hardError = error && !isRateLimitError(error);

  const handleTypeChange = (type) => {
    setSearchParams(type === "ANIME" ? {} : { type }, { replace: true });
  };

  return (
    <div className="discover">
      <div className="discover-toolbar">
        <MediaTypeToggle value={mediaType} onChange={handleTypeChange} />
      </div>

      {hardError ? (
        <PageState
          role="alert"
          title="Couldn't load this list"
          message={getApiErrorMessage(error, "Please try again in a moment.")}
          actions={[{ label: "Try again", onClick: () => refetch() }]}
        />
      ) : isWaiting && !data ? (
        <PageLoader inline />
      ) : (
        sections.map((section) => (
          <DiscoverRow
            key={`${mediaType}-${section.key}`}
            title={section.title}
            subtitle={getSectionSubtitle(section, seasons)}
            browseUrl={getBrowseUrl(section.key, mediaType)}
            media={data?.[section.dataKey]?.media ?? []}
          />
        ))
      )}
    </div>
  );
}

export default Discover;
