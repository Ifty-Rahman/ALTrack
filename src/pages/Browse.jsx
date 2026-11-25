import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Link, useNavigationType, useSearchParams } from "react-router-dom";
import { Pagination, useMediaQuery } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import MediaCardLink from "../components/MediaCardLink.jsx";
import PageLoader from "../components/PageLoader.jsx";
import PageState from "../components/PageState.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";
import {
  getBrowseQuery,
  getSection,
  getSectionSubtitle,
  normalizeType,
} from "../utils/discoverSections.js";
import "../css/Browse.css";

const MIN_CARD = 170;
const MAX_ROWS_PER_PAGE = 6;
// AniList silently caps perPage at 50.
const MAX_PER_PAGE = 50;

function getGap(viewportWidth) {
  return viewportWidth <= 768 ? 15 : 20;
}

// Mirrors the CSS auto-fill track math so perPage always fills complete rows.
function getColumns(gridWidth, viewportWidth) {
  if (viewportWidth <= 480) return 2;
  const gap = getGap(viewportWidth);
  return Math.max(1, Math.floor((gridWidth + gap) / (MIN_CARD + gap)));
}

function getPerPage(columns) {
  const rows = Math.max(1, Math.min(MAX_ROWS_PER_PAGE, Math.floor(MAX_PER_PAGE / columns)));
  return columns * rows;
}

function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function Browse() {
  const isMobile = useMediaQuery("(max-width: 480px)");
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = normalizeType(searchParams.get("type"));
  const section = getSection(searchParams.get("section"), type);
  const page = parsePage(searchParams.get("page"));

  const gridRef = useRef(null);
  const [columns, setColumns] = useState(() =>
    getColumns(window.innerWidth - 40, window.innerWidth),
  );

  // Layout effect so the measured column count is in place before the first fetch.
  useLayoutEffect(() => {
    const node = gridRef.current;
    if (!node) return;
    const updateColumns = () => {
      const next = getColumns(node.getBoundingClientRect().width, window.innerWidth);
      setColumns((prev) => (prev === next ? prev : next));
    };
    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  // Back/forward should land where the user left off; fresh navigations start at the top.
  useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [section.key, type, page, navigationType]);

  const perPage = getPerPage(columns);
  const { query, variables } = getBrowseQuery(section.key, type, page, perPage);
  const { loading, error, data, previousData, refetch } = useQuery(query, {
    variables,
    fetchPolicy: "cache-first",
  });

  // While a new page loads, keep the previous page of the same list on screen.
  const listKey = `${type}:${section.key}`;
  const lastListKeyRef = useRef(null);
  const visibleData =
    data ?? (lastListKeyRef.current === listKey ? previousData : undefined);
  useEffect(() => {
    if (data) lastListKeyRef.current = listKey;
  }, [data, listKey]);

  const media = visibleData?.Page?.media ?? [];
  const pageInfo = visibleData?.Page?.pageInfo;
  const isRateLimited = isRateLimitError(error);
  const hardError = error && !isRateLimited;
  const showLoader = !visibleData && !hardError;
  const isRefreshing = Boolean(visibleData) && (loading || isRateLimited) && !data;

  // AniList's lastPage is an estimate; trust hasNextPage near the end.
  const lastPage = pageInfo
    ? pageInfo.hasNextPage
      ? Math.max(pageInfo.lastPage || 1, page + 1)
      : pageInfo.currentPage || page
    : page;

  const goTo = (nextSection, nextType, nextPage = 1) => {
    const params = new URLSearchParams({ section: nextSection, type: nextType });
    if (nextPage > 1) params.set("page", String(nextPage));
    setSearchParams(params);
  };

  const subtitle = getSectionSubtitle(section);
  const typeLabel = type === "ANIME" ? "Anime" : "Manga";

  return (
    <div className="browse-container">
      <div className="browse-header">
        <Link className="browse-back" to={type === "ANIME" ? "/Discover" : `/Discover?type=${type}`}>
          <MdArrowBack size={18} aria-hidden="true" />
          Discover
        </Link>
        <div className="browse-heading">
          <h1 className="browse-title">{section.title}</h1>
          <p className="browse-subtitle">
            {subtitle ? `${subtitle} ${typeLabel.toLowerCase()}` : typeLabel}
            {pageInfo && media.length > 0 && (
              <span className="browse-page-count">
                Page {page} of {lastPage}
              </span>
            )}
          </p>
        </div>
      </div>

      {hardError && (
        <PageState
          role="alert"
          title="Couldn't load this list"
          message={getApiErrorMessage(error, "Please try again in a moment.")}
          actions={[{ label: "Try again", onClick: () => refetch() }]}
        />
      )}

      <div
        className={`browse-grid${isRefreshing ? " is-refreshing" : ""}`}
        ref={gridRef}
        aria-busy={isRefreshing}
        hidden={Boolean(hardError)}
      >
        {media.map((content) => (
          <MediaCardLink key={content.id} content={content} />
        ))}
      </div>

      {showLoader && <PageLoader inline />}

      {!showLoader && !hardError && media.length === 0 && (
        <PageState
          title={page > 1 ? "You've reached the end" : "Nothing here yet"}
          message={
            page > 1
              ? "There are no more titles in this list."
              : "AniList has no titles in this list right now."
          }
          actions={
            page > 1
              ? [{ label: "Back to first page", onClick: () => goTo(section.key, type, 1) }]
              : []
          }
        />
      )}

      {media.length > 0 && lastPage > 1 && (
        <div className="browse-pagination">
          <Pagination
            count={lastPage}
            page={Math.min(page, lastPage)}
            onChange={(_, value) => goTo(section.key, type, value)}
            disabled={isRefreshing}
            color="primary"
            size={isMobile ? "medium" : "large"}
            siblingCount={isMobile ? 0 : 1}
            boundaryCount={1}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "var(--text)",
                fontSize: "1rem",
                fontWeight: 500,
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "var(--primary)",
                color: "var(--text)",
                "&:hover": { backgroundColor: "var(--hover)" },
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: "rgba(4, 107, 217, 0.2)",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Browse;
