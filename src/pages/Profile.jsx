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
import { toast } from "react-toastify";

function ProfilePage() {
  const { authToken } = useAuth();

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "cache-first",
    skip: !authToken,
  });

  const user = userData?.Viewer;
  const username = user?.name;

  const { loading, error, data } = useQuery(GET_USER_STATISTICS, {
    variables: { userName: username },
    skip: !authToken || !username,
    fetchPolicy: "cache-first",
  });

  const stats = useMemo(() => data?.Viewer?.statistics, [data]);
  const favourites = useMemo(() => data?.Viewer?.favourites, [data]);

  if (userLoading || loading)
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );
  if (userError) return <p>Error: {userError.message}</p>;
  if (error)
    return toast.error(
      error?.status?.includes(429)
        ? "API limit reached. Please try again 1 minute later."
        : `${error.message}, try again later`,
    );

  return (
    <div className="profile-main">
      {authToken ? (
        <div className="profile-container">
          <ProfileMedia user={user} />
          <UserStats stats={stats} />
          <Favorites favourites={favourites} />
          <LogOut />
        </div>
      ) : (
        <div className="Not-Logged-In">
          <p>Please log in to see your profile</p>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
