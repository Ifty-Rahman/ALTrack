import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_POPULAR_SEASONAL_ANIME } from "../../services/Queries.jsx";
import ContentCard from "../Contentcard.jsx";

function PopularThisSeason({ type }) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let season = "WINTER";
  if (month >= 3 && month <= 5) season = "SPRING";
  else if (month >= 6 && month <= 8) season = "SUMMER";
  else if (month >= 9 && month <= 11) season = "FALL";
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_POPULAR_SEASONAL_ANIME, {
    variables: {
      page: 1,
      perPage: 15,
      sort: "POPULARITY_DESC",
      season: season,
      seasonYear: year,
    },
    fetchPolicy: "cache-first",
  });
  const [popular_seasonal_anime, setPopularSeasonalAnime] = useState([]);

  useEffect(() => {
    if (data?.Page?.media) {
      setPopularSeasonalAnime(data.Page.media);
    }
  }, [data]);

  const handleViewAll = () => {
    navigate(`/Browse?section=seasonal&type=${type}`);
  };

  const handleButton = () => {
    navigate(`/Browse?section=seasonal&type=${type}`);
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
          Popular This Season
        </button>
        <button className="view-all" onClick={handleViewAll}>
          view all
          <div className="arrow-wrapper">
            <div className="arrow"></div>
          </div>
        </button>
      </div>
      <div className="content-grid">
        {popular_seasonal_anime.map((content) => (
          <div key={content.id} onClick={() => handleCardClick(content)}>
            <ContentCard content={content} />
          </div>
        ))}
      </div>
    </>
  );
}

export default PopularThisSeason;
