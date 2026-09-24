import { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Button, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { GoCheck } from "react-icons/go";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext.js";
import {
  GET_CURRENT_MEDIA,
  GET_CURRENT_USER,
  GET_USER_MEDIA_LIST,
  GET_USER_MEDIA_STATUS,
} from "../../services/Queries.jsx";
import {
  SAVE_MEDIA_TO_LIST,
  TOGGLE_FAVOURITE,
  DELETE_MEDIA_LIST_ENTRY,
} from "../../services/Mutation.jsx";
import { isRateLimitError } from "../../services/RateLimit.js";
import { LIST_STATUSES, formatStatus } from "../../utils/detailsHelpers.js";

function DetailsCoverSection({ media, type, mediaId, onMediaRefetch }) {
  const resolvedMediaId = media?.id ?? mediaId;
  const { authToken } = useAuth();
  const isLoggedIn = Boolean(authToken);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const listMenuOpen = Boolean(anchorEl);

  // Media list state
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentListEntryId, setCurrentListEntryId] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isManuallyRemoved, setIsManuallyRemoved] = useState(false);

  // Fetch current user data
  const { data: viewerData } = useQuery(GET_CURRENT_USER, {
    skip: !authToken,
  });

  const viewerId = viewerData?.Viewer?.id;
  const username = viewerData?.Viewer?.name;

  // Fetch user's media status
  const skipStatusQuery = !viewerId || !resolvedMediaId;
  const { data: userMediaStatusData, refetch: refetchUserMediaStatus } =
    useQuery(GET_USER_MEDIA_STATUS, {
      variables: { userId: viewerId, mediaId: resolvedMediaId },
      skip: skipStatusQuery,
    });

  // Mutations
  const [saveToList, { loading: listUpdating }] =
    useMutation(SAVE_MEDIA_TO_LIST);
  const [deleteMediaListEntry, { loading: deleteListEntryLoading }] =
    useMutation(DELETE_MEDIA_LIST_ENTRY);
  const [toggleFavouriteMutation, { loading: favouriteUpdating }] =
    useMutation(TOGGLE_FAVOURITE);

  // Refetch queries
  const refetchListQueries = useMemo(() => {
    if (!username || !type) return [];
    return [
      {
        query: GET_CURRENT_MEDIA,
        variables: { userName: username, type },
      },
      {
        query: GET_USER_MEDIA_LIST,
        variables: { userName: username },
      },
    ];
  }, [username, type]);

  // Derive status and entry ID from queries
  const derivedStatus = useMemo(() => {
    const statusFromQuery = userMediaStatusData?.MediaList?.status;
    return statusFromQuery !== undefined
      ? statusFromQuery
      : (media?.mediaListEntry?.status ?? null);
  }, [userMediaStatusData?.MediaList?.status, media?.mediaListEntry?.status]);

  const derivedEntryId = useMemo(() => {
    const entryFromQuery = userMediaStatusData?.MediaList?.id;
    return entryFromQuery !== undefined
      ? entryFromQuery
      : (media?.mediaListEntry?.id ?? null);
  }, [userMediaStatusData?.MediaList?.id, media?.mediaListEntry?.id]);

  // Update local state when derived values change
  useEffect(() => {
    if (derivedStatus !== undefined && derivedStatus !== currentStatus) {
      // Don't update if we just manually removed the item
      if (!isManuallyRemoved) {
        setCurrentStatus(derivedStatus);
      }
      // Reset the flag once query data is refreshed with null status
      if (derivedStatus === null && isManuallyRemoved) {
        setIsManuallyRemoved(false);
      }
    }
  }, [derivedStatus, currentStatus, isManuallyRemoved]);

  useEffect(() => {
    if (derivedEntryId !== undefined && derivedEntryId !== currentListEntryId) {
      if (!isManuallyRemoved) {
        setCurrentListEntryId(derivedEntryId);
      }
    }
  }, [derivedEntryId, currentListEntryId, isManuallyRemoved]);

  useEffect(() => {
    setIsFavourite(Boolean(media?.isFavourite));
  }, [media?.isFavourite]);

  // Menu handlers
  const handleOpenMenu = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Refetch helper
  const performRefetches = useCallback(async () => {
    const refetchPromises = [];

    if (onMediaRefetch) {
      refetchPromises.push(
        onMediaRefetch().catch((err) =>
          console.error("Failed to refetch media:", err),
        ),
      );
    }

    if (!skipStatusQuery && refetchUserMediaStatus) {
      refetchPromises.push(
        refetchUserMediaStatus().catch((err) =>
          console.error("Failed to refetch media status:", err),
        ),
      );
    }

    await Promise.allSettled(refetchPromises);
  }, [onMediaRefetch, skipStatusQuery, refetchUserMediaStatus]);

  // Remove from list handler
  const handleRemoveFromList = useCallback(async () => {
    if (!currentListEntryId) {
      handleCloseMenu();
      return;
    }

    try {
      await deleteMediaListEntry({
        variables: { id: currentListEntryId },
        refetchQueries: refetchListQueries,
      });

      // Reset state immediately for instant UI feedback
      setCurrentStatus(null);
      setCurrentListEntryId(null);
      setIsManuallyRemoved(true); // Prevent derived state from overwriting
      toast.success("Removed from list.");

      await performRefetches();
    } catch (err) {
      if (isRateLimitError(err)) return;
      toast.error("Unable to remove from the list right now.");
      console.error(err);
    } finally {
      handleCloseMenu();
    }
  }, [
    currentListEntryId,
    deleteMediaListEntry,
    refetchListQueries,
    performRefetches,
    handleCloseMenu,
  ]);

  // Status select handler
  const handleStatusSelect = useCallback(
    async (status) => {
      if (!resolvedMediaId) return;

      // If selecting current status, remove from list
      if (status === currentStatus) {
        await handleRemoveFromList();
        return;
      }

      const previousStatus = currentStatus;

      try {
        // Reset manual removal flag when adding back to list
        setIsManuallyRemoved(false);

        const { data: saveResult } = await saveToList({
          variables: { mediaId: resolvedMediaId, status },
          refetchQueries: refetchListQueries,
        });

        const updatedEntryId =
          saveResult?.SaveMediaListEntry?.id ?? currentListEntryId ?? null;
        setCurrentListEntryId(updatedEntryId);
        setCurrentStatus(status);

        const formattedStatus = formatStatus(status, type);
        const message =
          status === previousStatus
            ? `Updated list as ${formattedStatus}.`
            : `Moved to ${formattedStatus}.`;
        toast.success(message);

        await performRefetches();
      } catch (err) {
        if (isRateLimitError(err)) return;
        toast.error("Unable to update the list right now.");
        console.error(err);
      } finally {
        handleCloseMenu();
      }
    },
    [
      resolvedMediaId,
      currentStatus,
      currentListEntryId,
      saveToList,
      refetchListQueries,
      type,
      performRefetches,
      handleCloseMenu,
      handleRemoveFromList,
    ],
  );

  // Toggle favourite handler
  const handleToggleFavourite = useCallback(async () => {
    if (!resolvedMediaId || !type) return;

    try {
      const favouriteVars =
        type === "ANIME"
          ? { animeId: resolvedMediaId }
          : { mangaId: resolvedMediaId };

      await toggleFavouriteMutation({ variables: favouriteVars });

      const nextFavourite = !isFavourite;
      setIsFavourite(nextFavourite);

      const message = nextFavourite
        ? "Added to favourites."
        : "Removed from favourites.";
      toast.success(message);

      if (onMediaRefetch) {
        await onMediaRefetch().catch((err) =>
          console.error("Failed to refetch media after favourite toggle:", err),
        );
      }
    } catch (err) {
      if (isRateLimitError(err)) return;
      toast.error("Unable to update favourites right now.");
      console.error(err);
    }
  }, [
    resolvedMediaId,
    type,
    isFavourite,
    toggleFavouriteMutation,
    onMediaRefetch,
  ]);

  // Computed values
  const listButtonLabel = currentStatus
    ? formatStatus(currentStatus, type)
    : "Add to List";
  const listMutationInFlight = listUpdating || deleteListEntryLoading;

  const coverImageSrc = media?.coverImage?.large || media?.coverImage?.medium;
  const coverImageAlt =
    media?.title?.userPreferred ||
    media?.title?.romaji ||
    media?.title?.english ||
    "Cover art";

  // Early return if no media
  if (!media) return null;

  return (
    <Box className="cover-section">
      <img src={coverImageSrc} alt={coverImageAlt} className="cover-img" />
      {isLoggedIn && (
        <Stack
          spacing={{ xs: 1, sm: 1.5 }}
          direction="row"
          className="cover-actions"
        >
          <Button
            id="list-menu-button"
            aria-haspopup="true"
            aria-expanded={listMenuOpen ? "true" : undefined}
            aria-controls={listMenuOpen ? "list-menu" : undefined}
            variant="contained"
            color="primary"
            startIcon={<FaListUl size={16} />}
            endIcon={<MdKeyboardArrowDown size={18} />}
            onClick={handleOpenMenu}
            disabled={listMutationInFlight}
            className="list-button"
          >
            {listMutationInFlight ? "Saving..." : listButtonLabel}
          </Button>

          <Menu
            id="list-menu"
            anchorEl={anchorEl}
            open={listMenuOpen}
            onClose={handleCloseMenu}
            MenuListProps={{ "aria-labelledby": "list-menu-button" }}
            className="list-menu"
          >
            {LIST_STATUSES.map((status) => (
              <MenuItem
                key={status}
                selected={status === currentStatus}
                onClick={() => handleStatusSelect(status)}
                disabled={listMutationInFlight}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  gap={1.5}
                >
                  <span>{formatStatus(status, type)}</span>
                  {status === currentStatus && <GoCheck size={16} />}
                </Stack>
              </MenuItem>
            ))}
          </Menu>

          <IconButton
            onClick={handleToggleFavourite}
            className={`favourite-button ${isFavourite ? "active" : ""}`}
            aria-label={
              isFavourite ? "Remove from favourites" : "Add to favourites"
            }
            disabled={favouriteUpdating}
          >
            {isFavourite ? (
              <AiFillHeart className="heart-icon filled" size={22} />
            ) : (
              <AiOutlineHeart className="heart-icon" size={22} />
            )}
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}

export default DetailsCoverSection;
