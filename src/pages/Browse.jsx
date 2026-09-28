import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, useMediaQuery } from "@mui/material";
import ContentCard from "../components/Contentcard.jsx";
import { TrophySpin } from "react-loading-indicators";
import { toast } from "react-toastify";
import {
  GET_POPULAR_SEASONAL_ANIME,
  GET_UPCOMING_SEASONAL_ANIME,
  GET_POPULAR_ANIMANGA,
  GET_TRENDING_ANIMANGA,
  GET_POPULAR_MANHWA,
} from "../services/Queries.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import "../css/Browse.css";

const MIN_CARD = 170;
const ROWS_PER_PAGE = 6;

// Mirrors the CSS auto-fill track math so perPage always fills complete rows.
function getColumnsForWidth(width) {
  if (width <= 480) return 2;
  const gap = width <= 768 ? 15 : 20;
  const gridWidth = width - 40; // .browse-container padding
  return Math.max(1, Math.floor((gridWidth + gap) / (MIN_CARD + gap)));
}

function Browse() {
  const isMobile = useMediaQuery("(max-width: 480px)");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") || "trending";
  const type = searchParams.get("type") || "ANIME";
  const [page, setPage] = useState(1);
  const browseGridRef = useRef(null);
  const [columns, setColumns] = useState(() =>
    getColumnsForWidth(window.innerWidth),
  );

  useEffect(() => {
    setPage(1);
  }, [section]);

  useEffect(() => {
    const node = browseGridRef.current;
    if (!node) return;
    const updateColumns = () => {
      const width = node.getBoundingClientRect().width;
      const gap = window.innerWidth <= 768 ? 15 : 20;
      const next =
        window.innerWidth <= 480
          ? 2
          : Math.max(1, Math.floor((width + gap) / (MIN_CARD + gap)));
      setColumns((prev) => (prev === next ? prev : next));
    };
    updateColumns();
    const resizeObserver = new ResizeObserver(updateColumns);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  const perPage = columns * ROWS_PER_PAGE;

  const { query, variables } = getQueryAndVars(section, page, perPage);
  const { loading, error, data } = useQuery(query, {
    variables,
    fetchPolicy: "cache-first",
  });

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );
  if (error) {
    if (isRateLimitError(error)) return null;
    return toast.error(error?.message || "Failed to load");
  }

  const anime = data?.Page?.media || [];
  const pageInfo = data?.Page?.pageInfo;

  function getQueryAndVars(section, page, perPage) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let season = "WINTER";
    if (month >= 3 && month <= 5) season = "SPRING";
    else if (month >= 6 && month <= 8) season = "SUMMER";
    else if (month >= 9 && month <= 11) season = "FALL";

    switch (section) {
      case "popular":
        return {
          query: GET_POPULAR_ANIMANGA,
          variables: { page, perPage, sort: ["POPULARITY_DESC"], type: type },
        };
      case "manhwa":
        return {
          query: GET_POPULAR_MANHWA,
          variables: { page, perPage, sort: ["POPULARITY_DESC"], type: type },
        };
      case "seasonal":
        return {
          query: GET_POPULAR_SEASONAL_ANIME,
          variables: {
            page,
            perPage,
            sort: ["POPULARITY_DESC"],
            season,
            seasonYear: year,
            type: type,
          },
        };
      case "upcoming": {
        const nextSeason = getNextSeason(season);
        const nextYear = season === "FALL" ? year + 1 : year;
        return {
          query: GET_UPCOMING_SEASONAL_ANIME,
          variables: {
            page,
            perPage,
            sort: ["POPULARITY_DESC"],
            season: nextSeason,
            seasonYear: nextYear,
            type: type,
          },
        };
      }
      default:
        return {
          query: GET_TRENDING_ANIMANGA,
          variables: { page, perPage, sort: ["TRENDING_DESC"], type: type },
        };
    }
  }

  function getNextSeason(current) {
    const order = ["WINTER", "SPRING", "SUMMER", "FALL"];
    const index = order.indexOf(current);
    return order[(index + 1) % 4];
  }

  function getSectionTitle(section) {
    switch (section) {
      case "trending":
        return "Trending Now";
      case "popular":
        return "All Time Popular";
      case "seasonal":
        return "Popular This Season";
      case "upcoming":
        return "Upcoming Next Season";
      default:
        return "Browse Anime";
    }
  }

  const handleCardClick = (content) => {
    navigate(`/Details?id=${content.id}&type=${content.type}`);
  };

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1 className="browse-title">{getSectionTitle(section)}</h1>
        <p className="browse-subtitle">
          Page {page} of {pageInfo?.lastPage || 1}
        </p>
      </div>

      <div className="browse-grid" ref={browseGridRef}>
        {anime.map((content) => (
          <div key={content.id} onClick={() => handleCardClick(content)}>
            <ContentCard content={content} />
          </div>
        ))}
      </div>

      {pageInfo && pageInfo.lastPage > 1 && (
        <div className="browse-pagination">
          <Pagination
            count={pageInfo.lastPage}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
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
                backgroundColor: "rgba(110, 53, 255, 0.2)",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Browse;
