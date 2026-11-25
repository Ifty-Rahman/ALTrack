import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { Box, Stack } from "@mui/material";
import { GET_MEDIA_DETAILS } from "../services/Queries.jsx";
import DetailsCoverSection from "../components/Details/DetailsCoverSection.jsx";
import DetailsInfoSection from "../components/Details/DetailsInfoSection.jsx";
import DetailsRelationsSection from "../components/Details/DetailsRelationsSection.jsx";
import DetailsCharactersSection from "../components/Details/DetailsCharactersSection.jsx";
import DetailsStaffSection from "../components/Details/DetailsStaffSection.jsx";
import "../css/Details.css";
import { TrophySpin } from "react-loading-indicators";
import PageState from "../components/PageState.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";

function Details() {
  const [searchParams] = useSearchParams();
  const id = parseInt(searchParams.get("id"));
  const rawType = searchParams.get("type");
  const type = rawType ? rawType.toUpperCase() : null;

  const skipQuery = Number.isNaN(id) || !type;

  const { loading, error, data, previousData, refetch } = useQuery(
    GET_MEDIA_DETAILS,
    {
      variables: { id, type },
      skip: skipQuery,
      notifyOnNetworkStatusChange: true,
    },
  );

  const media = data?.Media ?? previousData?.Media;
  const isInitialLoading = loading && !data && !previousData;

  if (skipQuery) {
    return (
      <Box className="details-page">
        <PageState
          title="This link doesn't point to a title"
          message="It's missing the title's ID or type. Find the title on Discover or with Search."
          actions={[{ label: "Go to Discover", to: "/Discover" }]}
        />
      </Box>
    );
  }

  const isRateLimited = isRateLimitError(error);

  // While rate limited the overlay is up and refetches when it clears.
  if (isInitialLoading || (isRateLimited && !media))
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );

  if (error && !isRateLimited && !media) {
    return (
      <Box className="details-page">
        <PageState
          role="alert"
          title="Couldn't load this title"
          message={getApiErrorMessage(error, "Please try again in a moment.")}
          actions={[
            { label: "Try again", onClick: () => refetch() },
            { label: "Go to Discover", to: "/Discover" },
          ]}
        />
      </Box>
    );
  }

  if (!media) {
    return (
      <Box className="details-page">
        <PageState
          title="Title not found"
          message="AniList has no title with this ID. It may have been removed or merged."
          actions={[{ label: "Go to Discover", to: "/Discover" }]}
        />
      </Box>
    );
  }

  return (
    <Box className="details-page">
      <Box className="details-container">
        <Box className="details-card">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 4 }}
          >
            <DetailsCoverSection
              media={media}
              type={type}
              mediaId={id}
              onMediaRefetch={refetch}
            />
            <DetailsInfoSection media={media} type={type} />
          </Stack>
        </Box>

        <DetailsRelationsSection media={media} />
        <DetailsCharactersSection media={media} />
        <DetailsStaffSection media={media} />
      </Box>
    </Box>
  );
}

export default Details;
