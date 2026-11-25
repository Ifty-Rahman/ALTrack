import { Link } from "react-router-dom";
import ContentCard from "./Contentcard.jsx";
import "../css/MediaCardLink.css";

function getDetailsUrl(content) {
  return `/Details?id=${content.id}&type=${content.type}`;
}

function MediaCardLink({ content }) {
  return (
    <Link className="media-card-link" to={getDetailsUrl(content)}>
      <ContentCard content={content} />
    </Link>
  );
}

export function MediaCardSkeleton() {
  return <div className="media-card-skeleton" aria-hidden="true" />;
}

export default MediaCardLink;
