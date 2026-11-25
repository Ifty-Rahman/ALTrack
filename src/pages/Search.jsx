import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import { GET_SEARCH_DATA } from "../services/Queries.jsx";
import MediaCardLink from "../components/MediaCardLink.jsx";
import PageLoader from "../components/PageLoader.jsx";
import PageState from "../components/PageState.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";
import { normalizeType } from "../utils/discoverSections.js";
import "../css/Search.css";

const RESULT_COUNT = 30;

function Search() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("query") || "").trim();
  const type = normalizeType((searchParams.get("type") || "").toUpperCase());
  const typeLabel = type === "ANIME" ? "anime" : "manga";
  const otherType = type === "ANIME" ? "Manga" : "Anime";

  const { loading, error, data, refetch } = useQuery(GET_SEARCH_DATA, {
    variables: { page: 1, perPage: RESULT_COUNT, search: query, type },
    skip: !query,
  });

  if (!query) {
    return (
      <div className="search-results">
        <PageState
          title={`Search for ${typeLabel}`}
          message="Type a title in the search bar at the top to find it."
          actions={[{ label: "Browse Discover instead", to: "/Discover" }]}
        />
      </div>
    );
  }

  const results = data?.Page?.media ?? [];
  const isWaiting = loading || isRateLimitError(error);
  const hardError = error && !isRateLimitError(error);

  let body;
  if (hardError) {
    body = (
      <PageState
        role="alert"
        title="Search failed"
        message={getApiErrorMessage(error, "Please try again in a moment.")}
        actions={[{ label: "Try again", onClick: () => refetch() }]}
      />
    );
  } else if (isWaiting && !data) {
    body = <PageLoader inline />;
  } else if (results.length === 0) {
    const params = new URLSearchParams({ query, type: otherType });
    body = (
      <PageState
        title={`No ${typeLabel} matches "${query}"`}
        message="Check the spelling, try the Japanese or English title, or search the other type."
        actions={[{ label: `Search ${otherType.toLowerCase()} instead`, to: `/Search?${params}` }]}
      />
    );
  } else {
    body = (
      <div className="search-grid">
        {results.map((content) => (
          <MediaCardLink key={content.id} content={content} />
        ))}
      </div>
    );
  }

  return (
    <div className="search-results">
      <h1 className="search-title">
        {typeLabel === "anime" ? "Anime" : "Manga"} results for “{query}”
      </h1>
      {body}
    </div>
  );
}

export default Search;
