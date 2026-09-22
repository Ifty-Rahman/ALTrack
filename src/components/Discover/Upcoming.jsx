import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_UPCOMING_SEASONAL_ANIME } from "../../services/Queries.jsx";
import ContentCard from "../Contentcard.jsx";

function UpcomingNextSeason({ type }) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let season = "WINTER";
  if (month >= 3 && month <= 5) season = "SPRING";
  else if (month >= 6 && month <= 8) season = "SUMMER";
  else if (month >= 9 && month <= 11) season = "FALL";
  let nextSeason = "";
  let nextYear = year;
  if (season === "WINTER") {
    nextSeason = "SPRING";
  } else if (season === "SPRING") {
    nextSeason = "SUMMER";
  } else if (season === "SUMMER") {
    nextSeason = "FALL";
  } else if (season === "FALL") {
    nextSeason = "WINTER";
    nextYear += 1;
  }

  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_UPCOMING_SEASONAL_ANIME, {
    variables: {
      page: 1,
      perPage: 15,
      sort: "POPULARITY_DESC",
      season: nextSeason,
      seasonYear: nextYear,
    },
    fetchPolicy: "cache-first",
  });
  const [upcoming_seasonal_anime, setUpcomingAnime] = useState([]);

  useEffect(() => {
    if (data?.Page?.media) {
      setUpcomingAnime(data.Page.media);
    }
  }, [data]);

  const handleViewAll = () => {
    navigate(`/Browse?section=upcoming&type=${type}`);
  };

  const handleButton = () => {
    navigate(`/Browse?section=upcoming&type=${type}`);
  };

  const handleCardClick = (content) => {
    navigate(`/Details?id=${content.id}&type=${content.type}`);
  };

  if (error)
    return toast.error(
      error?.message?.includes("429") || error?.graphQLErrors?.some(e => e.extensions?.code === "RATE_LIMITED")
        ? "API limit reached. Please try again 1 minute later."
        : `${error.message || "Error occurred"}, try again later`,
    );
  if (loading) return;

  return (
    <>
      <div className="button-row">
        <button className="title-btn" onClick={handleButton}>
          Upcoming Next Season
        </button>
        <button className="view-all" onClick={handleViewAll}>
          view all
          <div className="arrow-wrapper">
            <div className="arrow"></div>
          </div>
        </button>
      </div>
      <div className="content-grid">
        {upcoming_seasonal_anime.map((content) => (
          <div key={content.id} onClick={() => handleCardClick(content)}>
            <ContentCard content={content} />
          </div>
        ))}
      </div>
    </>
  );
}

export default UpcomingNextSeason;
