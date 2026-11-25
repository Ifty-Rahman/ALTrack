import { Link } from "react-router-dom";

function UserListGrid({ entries, isAnime, fallbackType }) {
  return (
    <div className="anime-grid-list">
      {entries.map(({ media, score, progress, progressVolumes }) => {
        const title = media.title.english || media.title.romaji;
        const total = isAnime ? media.episodes : media.chapters;
        const progressText = `${isAnime ? "Ep" : "Ch"} ${progress ?? 0}/${total ?? "?"}`;
        const volumeText = `Vol ${progressVolumes ?? 0}/${media.volumes ?? "?"}`;
        const scoreText = score ? `Score ${score}` : "Not scored";

        return (
          <div className="anime-card-list" key={media.id}>
            <Link
              to={`/Details?id=${media.id}&type=${media.type || fallbackType}`}
              className="anime-card-image"
              style={{ backgroundImage: `url(${media.coverImage.large})` }}
              aria-label={title}
            >
              <h3 className="anime-card-title">{title}</h3>
            </Link>
            <div className="anime-info-list">
              <p>{progressText}</p>
              {!isAnime && <p>{volumeText}</p>}
              <p className={score ? undefined : "anime-info-muted"}>{scoreText}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UserListGrid;
