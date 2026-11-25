import { Link } from "react-router-dom";
import "../../css/Favorites.css";

function Favorites({ favourites }) {
  if (!favourites) return null;

  const sections = [
    {
      key: "anime",
      title: "Anime",
      nodes: favourites.anime?.nodes ?? [],
      getImage: (node) => node.coverImage?.large,
      getTitle: (node) => node.title?.english || node.title?.romaji,
      getLink: (node) => `/Details?id=${node.id}&type=ANIME`,
    },
    {
      key: "manga",
      title: "Manga",
      nodes: favourites.manga?.nodes ?? [],
      getImage: (node) => node.coverImage?.large,
      getTitle: (node) => node.title?.english || node.title?.romaji,
      getLink: (node) => `/Details?id=${node.id}&type=MANGA`,
    },
    {
      key: "characters",
      title: "Characters",
      nodes: favourites.characters?.nodes ?? [],
      getImage: (node) => node.image?.large,
      getTitle: (node) => node.name?.full,
    },
    {
      key: "staff",
      title: "Staff",
      nodes: favourites.staff?.nodes ?? [],
      getImage: (node) => node.image?.large,
      getTitle: (node) => node.name?.full,
    },
    {
      key: "studios",
      title: "Studios",
      nodes: favourites.studios?.nodes ?? [],
      getImage: () => null,
      getTitle: (node) => node.name,
    },
  ];

  const visibleSections = sections.filter(
    (section) => section.nodes && section.nodes.length > 0,
  );

  if (!visibleSections.length) return null;

  const renderInitial = (title) => {
    if (!title) return "?";
    return title.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="favorites-container">
      <h2 className="favorites-title">Favorites</h2>
      {visibleSections.map((section) => (
        <div key={section.key} className="favorites-section">
          <div className="favorites-section-header">
            <h3>{section.title}</h3>
            <span className="favorites-count">{section.nodes.length}</span>
          </div>
          <div className="favorites-grid">
            {section.nodes.map((node) => {
              const title = section.getTitle(node) || "Untitled";
              const image = section.getImage(node);
              const link = section.getLink?.(node);
              const CardTag = link ? Link : "div";
              return (
                <CardTag
                  key={`${section.key}-${node.id}`}
                  className={`favorite-card${link ? " favorite-card--link" : ""}`}
                  {...(link ? { to: link } : {})}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="favorite-card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="favorite-card-placeholder">
                      {renderInitial(title)}
                    </div>
                  )}
                  <p className="favorite-card-title" title={title}>
                    {title}
                  </p>
                </CardTag>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Favorites;
