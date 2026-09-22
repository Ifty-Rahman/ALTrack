import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_POPULAR_ANIMANGA } from "../../services/Queries.jsx";
import ConentCard from "../Contentcard.jsx";

function PopularAllTime({ type }) {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_POPULAR_ANIMANGA, {
    variables: {
      page: 1,
      perPage: 15,
      sort: "POPULARITY_DESC",
      type: type,
    },
    fetchPolicy: "cache-first",
  });
  const [popularMedia, setPopularMedia] = useState([]);

  useEffect(() => {
    if (data?.Page?.media) {
      setPopularMedia(data.Page.media);
    }
  }, [data]);

  const handleViewAll = () => {
    navigate(`/Browse?section=popular&type=${type}`);
  };

  const handleButton = () => {
    navigate(`/Browse?section=popular&type=${type}`);
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
          All Time Popular
        </button>
        <button className="view-all" onClick={handleViewAll}>
          view all
          <div className="arrow-wrapper">
            <div className="arrow"></div>
          </div>
        </button>
      </div>
      <div className="content-grid">
        {popularMedia.map((content) => (
          <div key={content.id} onClick={() => handleCardClick(content)}>
            <ConentCard content={content} />
          </div>
        ))}
      </div>
    </>
  );
}

export default PopularAllTime;
