import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
import "../css/Browse.css";

function Browse() {
  const isTablet = useMediaQuery("(max-width: 1440px)");
  const isMobile = useMediaQuery("(max-width: 480px)");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") || "trending";
  const type = searchParams.get("type") || "ANIME";
  const [page, setPage] = useState(1);
  const perPage = isTablet ? 28 : 50;

  useEffect(() => {
    setPage(1);
  }, [section]);

  const { query, variables } = getQueryAndVars(section, page, perPage);
  const { loading, error, data } = useQuery(query, {
    variables,
    fetchPolicy: "network-only",
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
  if (error)
    return toast.error(
      error.message.includes("429")
        ? "API limit reached. Please try again later."
        : error.message,
    );

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

      <div className="browse-grid">
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
