import { useNavigate } from "react-router-dom";
import ContentCard from "../Contentcard.jsx";

function PopularManhwa({ media, type }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate(`/Browse?section=manhwa&type=${type}`);
  };

  const handleButton = () => {
    navigate(`/Browse?section=manhwa&type=${type}`);
  };

  const handleCardClick = (content) => {
    navigate(`/Details?id=${content.id}&type=${content.type}`);
  };

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="button-row">
        <button className="title-btn" onClick={handleButton}>
          Popular Manhwa
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
            <ContentCard content={content} />
          </div>
        ))}
      </div>
    </>
  );
}

export default PopularManhwa;