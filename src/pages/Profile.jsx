import "../css/Profile.css";
import { useAuth } from "../contexts/AuthContext.js";
import Favorites from "../components/Profile/Favorites.jsx";
import LogOut from "../components/Profile/LogoutButton.jsx";
import ProfileMedia from "../components/Profile/ProfileMedia.jsx";
import UserStats from "../components/Profile/UserStats.jsx";
import { GET_CURRENT_USER, GET_USER_STATISTICS } from "../services/Queries.jsx";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { TrophySpin } from "react-loading-indicators";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";
import PageState from "../components/PageState.jsx";
import SignedOutState from "../components/SignedOutState.jsx";

function ProfilePage() {
  const { authToken } = useAuth();

  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUser,
  } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "cache-first",
    skip: !authToken,
  });

  const user = userData?.Viewer;
  const username = user?.name;

  const { loading, error, data, refetch } = useQuery(GET_USER_STATISTICS, {
    variables: { userName: username },
    skip: !authToken || !username,
    fetchPolicy: "cache-first",
  });

  const stats = useMemo(() => data?.Viewer?.statistics, [data]);
  const favourites = useMemo(() => data?.Viewer?.favourites, [data]);

  if (!authToken) {
    return <SignedOutState message="Log in with your AniList account to see your stats and favourites." />;
  }

  const activeError = userError || error;
  const isRateLimited = isRateLimitError(activeError);

  // While rate limited the overlay is up and refetches when it clears.
  if (userLoading || loading || (isRateLimited && !user))
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );

  if (activeError && !isRateLimited) {
    return (
      <div className="profile-main">
        <PageState
          role="alert"
          title="Couldn't load your profile"
          message={getApiErrorMessage(activeError, "Please try again in a moment.")}
          actions={[{ label: "Try again", onClick: () => (userError ? refetchUser() : refetch()) }]}
        />
      </div>
    );
  }

  return (
    <div className="profile-main">
      <div className="profile-container">
        <ProfileMedia user={user} />
        <UserStats stats={stats} />
        <Favorites favourites={favourites} />
        <LogOut />
      </div>
    </div>
  );
}

export default ProfilePage;
