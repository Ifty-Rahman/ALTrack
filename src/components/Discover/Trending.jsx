import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_TRENDING_ANIMANGA } from "../../services/Queries.jsx";
import ContentCard from "../Contentcard.jsx";
import { TrophySpin } from "react-loading-indicators";

function Trending({ type }) {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_TRENDING_ANIMANGA, {
    variables: {
      page: 1,
      perPage: 15,
      sort: "TRENDING_DESC",
      type: type,
    },
    fetchPolicy: "cache-first",
  });
  const [trendingAnime, setTrendingAnime] = useState([]);

  useEffect(() => {
    if (data?.Page?.media) {
      setTrendingAnime(data.Page.media);
    }
  }, [data]);

  const handleViewAll = () => {
    navigate(`/Browse?section=trending&type=${type}`);
  };

  const handleButton = () => {
    navigate(`/Browse?section=trending&type=${type}`);
  };

  const handleCardClick = (content) => {
    navigate(`/Details?id=${content.id}&type=${content.type}`);
  };

  if (loading)
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );
  if (error)
    return toast.error(
      error?.message?.includes("429") || error?.graphQLErrors?.some(e => e.extensions?.code === "RATE_LIMITED")
        ? "API limit reached. Please try again 1 minute later."
        : `${error.message || "Error occurred"}, try again later`,
    );

  return (
    <>
      <div className="button-row">
        <button className="title-btn" onClick={handleButton}>
          Trending Now
        </button>
        <button className="view-all" onClick={handleViewAll}>
          view all
          <div className="arrow-wrapper">
            <div className="arrow"></div>
          </div>
        </button>
      </div>
      <div className="content-grid">
        {trendingAnime.map((content) => (
          <div key={content.id} onClick={() => handleCardClick(content)}>
            <ContentCard content={content} />
          </div>
        ))}
      </div>
    </>
  );
}

export default Trending;
