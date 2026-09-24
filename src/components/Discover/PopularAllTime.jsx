import { useNavigate } from "react-router-dom";
import ConentCard from "../Contentcard.jsx";

function PopularAllTime({ media, type }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate(`/Browse?section=popular&type=${type}`);
  };

  const handleButton = () => {
    navigate(`/Browse?section=popular&type=${type}`);
  };

  const handleCardClick = (content) => {
    navigate(`/Details?id=${content.id}&type=${content.type}`);
  };

  if (!media || media.length === 0) return null;

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
        {media.map((content) => (
          <div key={content.id} onClick={() => handleCardClick(content)}>
            <ConentCard content={content} />
          </div>
        ))}
      </div>
    </>
  );
}

export default PopularAllTime;