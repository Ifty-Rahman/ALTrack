import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { GET_CURRENT_USER, GET_USER_MEDIA_LIST } from "../services/Queries.jsx";
import { TrophySpin } from "react-loading-indicators";
import "../css/Userlist.css";
import UserListGrid from "../components/Userlist/UserListGrid.jsx";
import UserListSelect from "../components/Userlist/UserListSelect.jsx";
import MediaTypeToggle from "../components/MediaTypeToggle.jsx";
import PageState from "../components/PageState.jsx";
import SignedOutState from "../components/SignedOutState.jsx";
import { isRateLimitError } from "../services/RateLimit.js";
import { getApiErrorMessage } from "../utils/errorHandling.js";
import { normalizeType } from "../utils/discoverSections.js";

const DEFAULT_LIST_NAME = "planning";

function UserList() {
  const { authToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const mediaType = normalizeType(searchParams.get("type"));
  const requestedList = searchParams.get("list");

  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUser,
  } = useQuery(GET_CURRENT_USER, {
    skip: !authToken,
  });

  const username = userData?.Viewer?.name;

  const {
    loading: listsLoading,
    error: listsError,
    data,
    refetch,
  } = useQuery(GET_USER_MEDIA_LIST, {
    variables: { userName: username },
    skip: !authToken || !username,
    fetchPolicy: "cache-first",
  });

  if (!authToken) {
    return <SignedOutState message="Log in with your AniList account to see your anime and manga lists." />;
  }

  const activeError = userError || listsError;
  const isRateLimited = isRateLimitError(activeError);

  // While rate limited the overlay is up and refetches when it clears.
  if (userLoading || listsLoading || (isRateLimited && !data))
    return (
      <div className="loading-indicator">
        <TrophySpin color="var(--primary)" size="large" />
      </div>
    );

  if (activeError && !isRateLimited) {
    return (
      <div className="anime-list-container">
        <PageState
          role="alert"
          title="Couldn't load your lists"
          message={getApiErrorMessage(activeError, "Please try again in a moment.")}
          actions={[{ label: "Try again", onClick: () => (userError ? refetchUser() : refetch()) }]}
        />
      </div>
    );
  }

  const isAnime = mediaType === "ANIME";
  const typeLabel = isAnime ? "anime" : "manga";
  const activeLists = ((isAnime ? data?.anime?.lists : data?.manga?.lists) ?? []).filter(
    (list) => Boolean(list.name),
  );

  // The URL's list wins, then "Planning", then whatever list exists first.
  const selectedList =
    activeLists.find((list) => list.name === requestedList) ??
    activeLists.find((list) => list.name.toLowerCase() === DEFAULT_LIST_NAME) ??
    activeLists[0];
  const selectedEntries = selectedList?.entries ?? [];
  const discoverUrl = isAnime ? "/Discover" : `/Discover?type=${mediaType}`;

  const updateParams = (type, list) => {
    const params = new URLSearchParams();
    if (type !== "ANIME") params.set("type", type);
    if (list) params.set("list", list);
    setSearchParams(params, { replace: true });
  };

  let content;
  if (!activeLists.length) {
    content = (
      <PageState
        title={`No ${typeLabel} lists yet`}
        message={`Add ${typeLabel} from Discover or Search and your lists will show up here.`}
        actions={[{ label: "Go to Discover", to: discoverUrl }]}
      />
    );
  } else if (!selectedEntries.length) {
    content = (
      <PageState
        title={`"${selectedList.name}" is empty`}
        message={`Pick another list above, or find new ${typeLabel} on Discover.`}
        actions={[{ label: "Go to Discover", to: discoverUrl }]}
      />
    );
  } else {
    content = <UserListGrid entries={selectedEntries} isAnime={isAnime} fallbackType={mediaType} />;
  }

  return (
    <div className="anime-list-container">
      <div className="userlist-header">
        <MediaTypeToggle value={mediaType} onChange={(type) => updateParams(type, null)} />
        {activeLists.length > 0 && (
          <UserListSelect
            className="userlist-select"
            value={selectedList.name}
            options={activeLists.map((list) => ({
              value: list.name,
              label: `${list.name} (${list.entries?.length ?? 0})`,
            }))}
            onChange={(event) => updateParams(mediaType, event.target.value)}
          />
        )}
      </div>
      {content}
    </div>
  );
}

export default UserList;
