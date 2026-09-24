import { useCallback, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { Box, Button, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaListUl } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { GoCheck } from "react-icons/go";
import { useMutation, useQuery, useApolloClient } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext.js";
import {
  GET_CURRENT_MEDIA,
  GET_CURRENT_USER,
  GET_USER_MEDIA_LIST,
} from "../../services/Queries.jsx";
import {
  SAVE_MEDIA_TO_LIST,
  TOGGLE_FAVOURITE,
  DELETE_MEDIA_LIST_ENTRY,
} from "../../services/Mutation.jsx";
import { isRateLimitError } from "../../services/RateLimit.js";
import { getApiErrorMessage } from "../../utils/errorHandling.js";
import { LIST_STATUSES, formatStatus } from "../../utils/detailsHelpers.js";

const MEDIA_ACTIONS_PATCH = gql`
  fragment MediaActionsPatch on Media {
    mediaListEntry {
      id
      status
    }
    isFavourite
  }
`;

function DetailsCoverSection({ media, type, mediaId, onMediaRefetch }) {
  const resolvedMediaId = media?.id ?? mediaId;
  const { authToken } = useAuth();
  const isLoggedIn = Boolean(authToken);
  const client = useApolloClient();
  const cache = client.cache;

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const listMenuOpen = Boolean(anchorEl);

  // Source of truth for list status / favourite comes from the media query
  const currentStatus = media?.mediaListEntry?.status ?? null;
  const currentListEntryId = media?.mediaListEntry?.id ?? null;
  const isFavourite = Boolean(media?.isFavourite);

  // Fetch current user data (username feeds list refetch queries)
  const { data: viewerData } = useQuery(GET_CURRENT_USER, {
    skip: !authToken,
  });

  const username = viewerData?.Viewer?.name;

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

  const writeMediaPatch = useCallback(
    (patch) => {
      cache.writeFragment({
        id: `Media:${resolvedMediaId}`,
        fragment: MEDIA_ACTIONS_PATCH,
        data: patch,
      });
    },
    [cache, resolvedMediaId],
  );

  // Menu handlers
  const handleOpenMenu = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Refetch helper
  const performRefetches = useCallback(async () => {
    if (!onMediaRefetch) return;
    await onMediaRefetch().catch((err) =>
      console.error("Failed to refetch media:", err),
    );
  }, [onMediaRefetch]);

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
        optimisticResponse: {
          DeleteMediaListEntry: { __typename: "DeleteMediaListEntry", deleted: true },
        },
        update() {
          writeMediaPatch({ mediaListEntry: null });
        },
      });

      toast.success("Removed from list.");
      await performRefetches();
      handleCloseMenu();
    } catch (err) {
      if (isRateLimitError(err)) return;
      toast.error(
        getApiErrorMessage(err, "Unable to remove from the list right now."),
      );
      console.error(err);
    }
  }, [
    currentListEntryId,
    deleteMediaListEntry,
    refetchListQueries,
    writeMediaPatch,
    performRefetches,
    handleCloseMenu,
  ]);

  // Status select handler
  const handleStatusSelect = useCallback(
    async (status) => {
      if (!resolvedMediaId) return;

      // Selecting the current status removes the entry from the list
      if (status === currentStatus) {
        await handleRemoveFromList();
        return;
      }

      const previousStatus = currentStatus;

      try {
        await saveToList({
          variables: { mediaId: resolvedMediaId, status },
          refetchQueries: refetchListQueries,
          optimisticResponse: {
            SaveMediaListEntry: {
              __typename: "MediaList",
              id: currentListEntryId ?? -resolvedMediaId,
              mediaId: resolvedMediaId,
              status,
              updatedAt: Math.floor(Date.now() / 1000),
            },
          },
          update(_cache, { data }) {
            const entry = data?.SaveMediaListEntry;
            if (entry) {
              writeMediaPatch({ mediaListEntry: entry });
            }
          },
        });

        const formattedStatus = formatStatus(status, type);
        const message = previousStatus
          ? `Moved to ${formattedStatus}.`
          : `Added as ${formattedStatus}.`;
        toast.success(message);

        await performRefetches();
        handleCloseMenu();
      } catch (err) {
        if (isRateLimitError(err)) return;
        toast.error(
          getApiErrorMessage(err, "Unable to update the list right now."),
        );
        console.error(err);
      }
    },
    [
      resolvedMediaId,
      currentStatus,
      currentListEntryId,
      saveToList,
      refetchListQueries,
      writeMediaPatch,
      type,
      performRefetches,
      handleCloseMenu,
      handleRemoveFromList,
    ],
  );

  // Toggle favourite handler
  const handleToggleFavourite = useCallback(async () => {
    if (!resolvedMediaId || !type) return;

    const previousFavourite = isFavourite;

    try {
      const favouriteVars =
        type === "ANIME"
          ? { animeId: resolvedMediaId }
          : { mangaId: resolvedMediaId };

      await toggleFavouriteMutation({
        variables: favouriteVars,
        optimisticResponse: {
          ToggleFavourite: {
            __typename: "ToggleFavourite",
            anime: { __typename: "Favourites", nodes: [] },
            manga: { __typename: "Favourites", nodes: [] },
          },
        },
        update() {
          writeMediaPatch({ isFavourite: !previousFavourite });
        },
      });

      const message = previousFavourite
        ? "Removed from favourites."
        : "Added to favourites.";
      toast.success(message);

      await performRefetches();
    } catch (err) {
      if (isRateLimitError(err)) return;
      toast.error(
        getApiErrorMessage(err, "Unable to update favourites right now."),
      );
      console.error(err);
    }
  }, [
    resolvedMediaId,
    type,
    isFavourite,
    toggleFavouriteMutation,
    writeMediaPatch,
    performRefetches,
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