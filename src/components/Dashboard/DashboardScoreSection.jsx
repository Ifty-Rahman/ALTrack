import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { isRateLimitError } from "../../services/RateLimit.js";
import { MdOutlineEdit } from "react-icons/md";

function getScoreDisplay(entry, scoreFormat) {
  const score = entry?.score ?? 0;

  switch (scoreFormat) {
    case "POINT_100":
      return `${score} / 100`;
    case "POINT_10":
      return `${score} / 10`;
    case "POINT_10_DECIMAL":
      return `${score.toFixed(1)} / 10`;
    case "POINT_5":
      return `${score} / 5`;
    case "POINT_3":
      return `${score} / 3`;
    default:
      return `${score}`;
  }
}

function validateScore(value, format) {
  const num = parseFloat(value);
  switch (format) {
    case "POINT_100":
      return /^\d{1,3}$/.test(value) && num >= 0 && num <= 100;
    case "POINT_10":
      return /^\d{1,2}$/.test(value) && num >= 0 && num <= 10;
    case "POINT_10_DECIMAL":
      return /^\d{1,2}(\.\d)?$/.test(value) && num >= 0 && num <= 10;
    case "POINT_5":
      return /^[0-5]$/.test(value) && num >= 0 && num <= 5;
    case "POINT_3":
      return /^[1-3]$/.test(value) && num >= 1 && num <= 3;
    default:
      return true;
  }
}

function DashboardScoreSection({
  entry,
  mediaType,
  scoreFormat,
  updateAnimeEntry,
  updateMangaEntry,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempScore, setTempScore] = useState(entry.score?.toString() || "");
  const scoreSectionRef = useRef(null);

  useEffect(() => {
    setIsEditing(false);
    setTempScore(entry.score?.toString() || "");
  }, [entry.id, entry.score]);

  const handleScoreUpdate = async () => {
    const value = tempScore.trim();
    if (!validateScore(value, scoreFormat)) {
      toast.error("Enter a valid score for your format!");
      return;
    }

    const updateEntry =
      mediaType === "ANIME" ? updateAnimeEntry : updateMangaEntry;

    if (!updateEntry) {
      toast.error("Unable to update score right now.");
      return;
    }

    try {
      await updateEntry({
        variables: {
          mediaId: entry.media.id,
          score: parseFloat(value),
        },
        optimisticResponse: {
          SaveMediaListEntry: {
            __typename: "MediaList",
            id: entry.id,
            score: parseFloat(value),
            progress: entry.progress,
            progressVolumes: entry.progressVolumes,
            status: entry.status,
            updatedAt: Date.now(),
          },
        },
      });
      toast.success("Score updated!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      if (isRateLimitError(err)) return;
      toast.error("Failed to update score.");
    }
  };

  const handleCancelEdit = useCallback(() => {
    setTempScore(entry.score?.toString() || "");
    setIsEditing(false);
  }, [entry.score]);

  const handleStartEdit = () => {
    setTempScore(entry.score?.toString() || "");
    setIsEditing(true);
  };

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }

    const cardElement = scoreSectionRef.current?.closest(".dashboard-card");

    const handlePointerEvent = (event) => {
      if (cardElement && !cardElement.contains(event.target)) {
        handleCancelEdit();
      }
    };

    document.addEventListener("pointerdown", handlePointerEvent);
    document.addEventListener("pointerover", handlePointerEvent);

    return () => {
      document.removeEventListener("pointerdown", handlePointerEvent);
      document.removeEventListener("pointerover", handlePointerEvent);
    };
  }, [handleCancelEdit, isEditing]);

  return (
    <div className="dashboard-score-section" ref={scoreSectionRef}>
      <span className="dashboard-score-text">Score:</span>
      <button
        type="button"
        className="dashboard-score-display"
        onClick={handleStartEdit}
        aria-haspopup="dialog"
        aria-expanded={isEditing}
      >
        {getScoreDisplay(entry, scoreFormat)} <MdOutlineEdit size={19} />
      </button>

      {isEditing && (
        <div
          className="dashboard-score-popup"
          role="dialog"
          aria-label="Edit score"
        >
          <input
            type="text"
            className="dashboard-score-input"
            value={tempScore}
            onChange={(e) => setTempScore(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleScoreUpdate();
              } else if (e.key === "Escape") {
                handleCancelEdit();
              }
            }}
            autoFocus
          />
          <div className="dashboard-score-popup-actions">
            <button
              className="dashboard-score-save-btn"
              onClick={handleScoreUpdate}
            >
              <span>Save</span>
            </button>
            <button
              className="dashboard-score-close-btn"
              onClick={handleCancelEdit}
            >
              <span>Exit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardScoreSection;
