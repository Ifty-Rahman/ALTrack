import { Link } from "react-router-dom";

function DashboardCardImage({ entry, fallbackMediaType }) {
  const targetType = entry.media.type || fallbackMediaType;
  const title = entry.media.title.english || entry.media.title.romaji;

  return (
    <Link
      to={`/Details?id=${entry.media.id}&type=${targetType}`}
      className="dashboard-card-image"
      style={{ backgroundImage: `url(${entry.media.coverImage.large})` }}
      aria-label={title}
    >
      <h3 className="dashboard-anime-title">{title}</h3>
    </Link>
  );
}

export default DashboardCardImage;
