import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import {
  UPDATE_ANIME_ENTRY,
  UPDATE_MANGA_ENTRY,
} from "../../services/Mutation.jsx";
import { isRateLimitError } from "../../services/RateLimit.js";

const FIELD_TYPES = {
  EPISODE: "EPISODE",
  CHAPTER: "CHAPTER",
  VOLUME: "VOLUME",
};

function DashboardProgressSection({ entry, mediaType }) {
  const [updateAnimeEntry] = useMutation(UPDATE_ANIME_ENTRY);
  const [updateMangaEntry] = useMutation(UPDATE_MANGA_ENTRY);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const episodeRef = useRef(null);
  const chapterRef = useRef(null);
  const volumeRef = useRef(null);

  const handleProgressChange = async (delta, isVolume = false) => {
    const updateEntry =
      mediaType === "ANIME" ? updateAnimeEntry : updateMangaEntry;

    if (mediaType === "ANIME") {
      const newProgress = entry.progress + delta;
      if (newProgress < 0 || newProgress > (entry.media.episodes || Infinity))
        return;

      try {
        await updateEntry({
          variables: { mediaId: entry.media.id, progress: newProgress },
          optimisticResponse: {
            SaveMediaListEntry: {
              __typename: "MediaList",
              id: entry.id,
              progress: newProgress,
              score: entry.score,
              status: entry.status,
              updatedAt: Date.now(),
            },
          },
        });
      } catch (err) {
        if (isRateLimitError(err)) return;
        toast.error("Failed to update progress.");
      }
    } else {
      if (isVolume) {
        const newVolumes = (entry.progressVolumes || 0) + delta;
        if (newVolumes < 0 || newVolumes > (entry.media.volumes || Infinity))
          return;

        try {
          await updateEntry({
            variables: { mediaId: entry.media.id, progressVolumes: newVolumes },
            optimisticResponse: {
              SaveMediaListEntry: {
                __typename: "MediaList",
                id: entry.id,
                progress: entry.progress,
                progressVolumes: newVolumes,
                score: entry.score,
                status: entry.status,
                updatedAt: Date.now(),
              },
            },
          });
        } catch (err) {
          if (isRateLimitError(err)) return;
          toast.error("Failed to update volumes.");
        }
      } else {
        const newProgress = entry.progress + delta;
        if (newProgress < 0 || newProgress > (entry.media.chapters || Infinity))
          return;

        try {
          await updateEntry({
            variables: { mediaId: entry.media.id, progress: newProgress },
            optimisticResponse: {
              SaveMediaListEntry: {
                __typename: "MediaList",
                id: entry.id,
                progress: newProgress,
                progressVolumes: entry.progressVolumes,
                score: entry.score,
                status: entry.status,
                updatedAt: Date.now(),
              },
            },
          });
        } catch (err) {
          if (isRateLimitError(err)) return;
          toast.error("Failed to update chapters.");
        }
      }
    }
  };

  const getCurrentFieldValue = (field) => {
    switch (field) {
      case FIELD_TYPES.EPISODE:
        return entry.progress || 0;
      case FIELD_TYPES.CHAPTER:
        return entry.progress || 0;
      case FIELD_TYPES.VOLUME:
        return entry.progressVolumes || 0;
      default:
        return 0;
    }
  };

  const getFieldLimit = (field) => {
    switch (field) {
      case FIELD_TYPES.EPISODE:
        return entry.media.episodes ?? null;
      case FIELD_TYPES.CHAPTER:
        return entry.media.chapters ?? null;
      case FIELD_TYPES.VOLUME:
        return entry.media.volumes ?? null;
      default:
        return null;
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case FIELD_TYPES.EPISODE:
        return "episode";
      case FIELD_TYPES.CHAPTER:
        return "chapter";
      case FIELD_TYPES.VOLUME:
        return "volume";
      default:
        return "value";
    }
  };

  const handleStartEdit = (field) => {
    setTempValue(String(getCurrentFieldValue(field)));
    setEditingField(field);
  };

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setTempValue("");
  }, []);

  const handleManualSave = async () => {
    if (!editingField) return;

    const label = getFieldLabel(editingField);
    const trimmed = tempValue.trim();
    const parsedValue = Number(trimmed);

    if (
      trimmed === "" ||
      Number.isNaN(parsedValue) ||
      !Number.isInteger(parsedValue) ||
      parsedValue < 0
    ) {
      toast.error(`Enter a valid ${label} number.`);
      return;
    }

    const limit = getFieldLimit(editingField);
    if (typeof limit === "number" && parsedValue > limit) {
      toast.error(`Enter a ${label} number between 0 and ${limit}.`);
      return;
    }

    const updateEntry =
      editingField === FIELD_TYPES.EPISODE
        ? updateAnimeEntry
        : updateMangaEntry;

    const variables = { mediaId: entry.media.id };
    if (editingField === FIELD_TYPES.VOLUME) {
      variables.progressVolumes = parsedValue;
    } else {
      variables.progress = parsedValue;
    }

    try {
      await updateEntry({
        variables,
        optimisticResponse: {
          SaveMediaListEntry: {
            __typename: "MediaList",
            id: entry.id,
            progress:
              editingField === FIELD_TYPES.VOLUME
                ? (entry.progress ?? 0)
                : parsedValue,
            progressVolumes:
              editingField === FIELD_TYPES.VOLUME
                ? parsedValue
                : (entry.progressVolumes ?? 0),
            score: entry.score,
            status: entry.status,
            updatedAt: Date.now(),
          },
        },
      });
      toast.success(
        editingField === FIELD_TYPES.VOLUME
          ? "Volume updated!"
          : mediaType === "ANIME"
            ? "Episode updated!"
            : "Chapter updated!",
      );
      handleCancelEdit();
    } catch (err) {
      if (isRateLimitError(err)) return;
      toast.error(`Failed to update ${label}s.`);
    }
  };

  useEffect(() => {
    handleCancelEdit();
  }, [entry.id, entry.progress, entry.progressVolumes, handleCancelEdit]);

  useEffect(() => {
    if (!editingField) return undefined;

    const activeRef =
      editingField === FIELD_TYPES.EPISODE
        ? episodeRef.current
        : editingField === FIELD_TYPES.CHAPTER
          ? chapterRef.current
          : volumeRef.current;

    const cardElement = activeRef?.closest(".dashboard-card");

    const handlePointer = (event) => {
      if (cardElement && !cardElement.contains(event.target)) {
        handleCancelEdit();
      }
    };

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("pointerover", handlePointer);

    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("pointerover", handlePointer);
    };
  }, [editingField, handleCancelEdit]);

  const renderPopup = (field, label) => {
    if (editingField !== field) {
      return null;
    }

    return (
      <div
        className="dashboard-score-popup"
        role="dialog"
        aria-label={`Edit ${label} number`}
      >
        <input
          type="text"
          className="dashboard-score-input"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleManualSave();
            } else if (e.key === "Escape") {
              handleCancelEdit();
            }
          }}
          autoFocus
        />
        <div className="dashboard-score-popup-actions">
          <button
            type="button"
            className="dashboard-score-save-btn"
            onClick={handleManualSave}
          >
            <span>Save</span>
          </button>
          <button
            type="button"
            className="dashboard-score-close-btn"
            onClick={handleCancelEdit}
          >
            <span>Exit</span>
          </button>
        </div>
      </div>
    );
  };

  if (mediaType === "ANIME") {
    return (
      <div className="dashboard-progress-section">
        <div className="dashboard-progress-controls">
          <button
            className="dashboard-button"
            disabled={entry.progress <= 0}
            onClick={() => handleProgressChange(-1)}
          >
            −
          </button>
          <div className="dashboard-progress-text-wrapper" ref={episodeRef}>
            <button
              type="button"
              className="dashboard-progress-text-button"
              onClick={() => handleStartEdit(FIELD_TYPES.EPISODE)}
            >
              {entry.progress} / {entry.media.episodes || "?"}
            </button>
            {renderPopup(FIELD_TYPES.EPISODE, "episode")}
          </div>
          <button
            className="dashboard-button"
            onClick={() => handleProgressChange(1)}
            disabled={
              entry.media.episodes && entry.progress >= entry.media.episodes
            }
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-progress-section">
        <div className="dashboard-progress-label">Chapters</div>
        <div className="dashboard-progress-controls">
          <button
            className="dashboard-button"
            disabled={entry.progress <= 0}
            onClick={() => handleProgressChange(-1, false)}
          >
            −
          </button>
          <div className="dashboard-progress-text-wrapper" ref={chapterRef}>
            <button
              type="button"
              className="dashboard-progress-text-button"
              onClick={() => handleStartEdit(FIELD_TYPES.CHAPTER)}
            >
              {entry.progress} / {entry.media.chapters || "?"}
            </button>
            {renderPopup(FIELD_TYPES.CHAPTER, "chapter")}
          </div>
          <button
            className="dashboard-button"
            onClick={() => handleProgressChange(1, false)}
            disabled={
              entry.media.chapters && entry.progress >= entry.media.chapters
            }
          >
            +
          </button>
        </div>
      </div>
      <div className="dashboard-progress-section">
        <div className="dashboard-progress-label">Volumes</div>
        <div className="dashboard-progress-controls">
          <button
            className="dashboard-button"
            disabled={(entry.progressVolumes || 0) <= 0}
            onClick={() => handleProgressChange(-1, true)}
          >
            −
          </button>
          <div className="dashboard-progress-text-wrapper" ref={volumeRef}>
            <button
              type="button"
              className="dashboard-progress-text-button"
              onClick={() => handleStartEdit(FIELD_TYPES.VOLUME)}
            >
              {entry.progressVolumes || 0} / {entry.media.volumes || "?"}
            </button>
            {renderPopup(FIELD_TYPES.VOLUME, "volume")}
          </div>
          <button
            className="dashboard-button"
            onClick={() => handleProgressChange(1, true)}
            disabled={
              entry.media.volumes &&
              (entry.progressVolumes || 0) >= entry.media.volumes
            }
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

export default DashboardProgressSection;
