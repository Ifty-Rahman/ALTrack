import { useState } from "react";
import "../css/Contentcard.css";

function ContentCard({ content }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const title = content.title.english || content.title.romaji || "Untitled";

  // preventDefault keeps the title popup from following a wrapping <Link>.
  const handleTitleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsPopupOpen(true);
  };

  const closePopup = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    setIsPopupOpen(false);
  };

  return (
    <div className="content-card" onMouseLeave={() => setIsPopupOpen(false)}>
      <img
        src={content.coverImage.large}
        alt={title}
        className={`anime-image${isImageLoaded ? " is-loaded" : ""}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsImageLoaded(true)}
      />
      {isPopupOpen && (
        <div className="content-title-popup" onClick={closePopup}>
          <div
            className="content-title-popup-content"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <p>{title}</p>
          </div>
        </div>
      )}

      <h3 className="content-title" onClick={handleTitleClick} title={title}>
        {title}
      </h3>
    </div>
  );
}

export default ContentCard;
