import { useState, useEffect, useRef, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";
import Badge from "@mui/material/Badge";
import { IoNotificationsSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
} from "../services/Queries";
import "../css/Notifications.css";
import { useAuth } from "../contexts/AuthContext.js";

const PAGE_SIZE = 20;
const MAX_NOTIFICATIONS = 100;

function formatRelativeTime(ts) {
  if (!ts) return "";
  const diffSeconds = Math.max(0, Date.now() / 1000 - ts);
  if (diffSeconds < 60) return "just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function truncate(text, maxLength = 90) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function getNotificationMeta(notification) {
  const type = notification.__typename;
  const time = formatRelativeTime(notification.createdAt);
  const userName = notification.user?.name;
  const avatar = notification.user?.avatar?.large;
  const media = notification.media;
  const mediaTitle =
    media?.title?.romaji || media?.title?.english || "a title";
  const mediaImage = media?.coverImage?.large;
  const mediaNav = media ? { id: media.id, type: media.type } : null;
  const threadTitle = notification.thread?.title;

  switch (type) {
    case "AiringNotification":
      return {
        image: mediaImage,
        title: mediaTitle,
        subtitle: `Episode ${notification.episode} aired`,
        time,
        nav: mediaNav,
      };
    case "FollowingNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} started following you`,
        subtitle: truncate(notification.context),
        time,
        nav: null,
      };
    case "ActivityMessageNotification":
      return {
        image: avatar,
        title: `${notification.message?.user?.name || userName || "A user"} sent you a message`,
        subtitle: truncate(notification.message?.message),
        time,
        nav: null,
      };
    case "ActivityMentionNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} mentioned you in a post`,
        subtitle: truncate(notification.context),
        time,
        nav: null,
      };
    case "ActivityReplyNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} replied to your activity`,
        subtitle: truncate(notification.context),
        time,
        nav: null,
      };
    case "ActivityReplySubscribedNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} replied in an activity you're following`,
        subtitle: truncate(notification.context),
        time,
        nav: null,
      };
    case "ActivityLikeNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} liked your activity`,
        subtitle: truncate(notification.context),
        time,
        nav: null,
      };
    case "ActivityReplyLikeNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} liked your reply`,
        subtitle: truncate(notification.context),
        time,
        nav: null,
      };
    case "ThreadCommentMentionNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} mentioned you in a forum comment`,
        subtitle: truncate(notification.context) || threadTitle || "",
        time,
        nav: null,
      };
    case "ThreadCommentReplyNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} replied to your forum comment`,
        subtitle: truncate(notification.context) || threadTitle || "",
        time,
        nav: null,
      };
    case "ThreadCommentSubscribedNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} commented in a thread you follow`,
        subtitle: truncate(notification.context) || threadTitle || "",
        time,
        nav: null,
      };
    case "ThreadCommentLikeNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} liked your forum comment`,
        subtitle: threadTitle || truncate(notification.context) || "",
        time,
        nav: null,
      };
    case "ThreadLikeNotification":
      return {
        image: avatar,
        title: `${userName || "A user"} liked your forum post`,
        subtitle: threadTitle || truncate(notification.context) || "",
        time,
        nav: null,
      };
    case "RelatedMediaAdditionNotification":
      return {
        image: mediaImage,
        title: truncate(notification.context) || "Related media added",
        subtitle: mediaTitle,
        time,
        nav: mediaNav,
      };
    case "MediaDataChangeNotification":
      return {
        image: mediaImage,
        title: truncate(notification.context) || "Media data changed",
        subtitle: `${mediaTitle}${notification.reason ? ` — ${notification.reason}` : ""}`,
        time,
        nav: mediaNav,
      };
    case "MediaMergeNotification":
      return {
        image: mediaImage,
        title: truncate(notification.context) || "Media entries merged",
        subtitle: `${mediaTitle}${notification.reason ? ` — ${notification.reason}` : ""}`,
        time,
        nav: mediaNav,
      };
    case "MediaDeletionNotification":
      return {
        image: null,
        title: truncate(notification.context) || "Media deleted",
        subtitle: notification.deletedMediaTitle || notification.reason || "",
        time,
        nav: null,
      };
    case "MediaSubmissionUpdateNotification":
      return {
        image: mediaImage,
        title: "Media submission update",
        subtitle: truncate(
          `${notification.submittedTitle || mediaTitle}${
            notification.context ? ` — ${notification.context}` : ""
          }`,
        ),
        time,
        nav: mediaNav,
      };
    case "StaffSubmissionUpdateNotification": {
      const fullName = notification.staff?.name?.full;
      return {
        image: notification.staff?.image?.large,
        title: "Staff submission update",
        subtitle: truncate(
          `${fullName ? `${fullName}: ` : ""}${notification.context || ""}`,
        ),
        time,
        nav: null,
      };
    }
    case "CharacterSubmissionUpdateNotification": {
      const fullName = notification.character?.name?.full;
      return {
        image: notification.character?.image?.large,
        title: "Character submission update",
        subtitle: truncate(
          `${fullName ? `${fullName}: ` : ""}${notification.context || ""}`,
        ),
        time,
        nav: null,
      };
    }
    default:
      return {
        image: avatar,
        title: "New notification",
        subtitle: "View details",
        time,
        nav: null,
      };
  }
}

function Notifications() {
  const { authToken } = useAuth();
  const client = useApolloClient();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchError, setFetchError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const dropdownRef = useRef(null);
  const sentinelRef = useRef(null);
  const listRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchPage = useCallback(
    async (pageNumber, reset) => {
      const { data } = await client.query({
        query: GET_NOTIFICATIONS,
        variables: {
          page: pageNumber,
          perPage: PAGE_SIZE,
          resetNotificationCount: reset === true,
        },
        fetchPolicy: "network-only",
      });
      return data?.Page ?? null;
    },
    [client],
  );

  const refreshUnreadCount = useCallback(async () => {
    if (!authToken) return;
    try {
      const { data } = await client.query({
        query: GET_UNREAD_NOTIFICATION_COUNT,
        fetchPolicy: "network-only",
      });
      setUnreadCount(data?.Viewer?.unreadNotificationCount ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, [authToken, client]);

  const applyPage = useCallback((Page) => {
    if (!Page) return;
    const items = Page.notifications ?? [];
    setNotifications(items);
    setHasNextPage(Boolean(Page.pageInfo?.hasNextPage));
    setPage(1);
    setFetchError(null);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    if (notifications.length >= MAX_NOTIFICATIONS) {
      setHasNextPage(false);
      return;
    }
    setLoadingMore(true);
    try {
      const Page = await fetchPage(page + 1, false);
      if (Page) {
        const items = Page.notifications ?? [];
        setNotifications((prev) => {
          const seen = new Set(prev.map((n) => n.id));
          const merged = [...prev, ...items.filter((n) => !seen.has(n.id))];
          return merged;
        });
        setHasNextPage(Boolean(Page.pageInfo?.hasNextPage));
        setPage((prev) => prev + 1);
      }
    } catch {
      setHasNextPage(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage, notifications.length, page, fetchPage]);

  loadMoreRef.current = loadMore;

  const markAllReadAndRefresh = useCallback(async () => {
    if (!authToken) return;
    setUnreadCount(0);
    setLoading(true);
    try {
      const Page = await fetchPage(1, true);
      applyPage(Page);
    } catch {
      setFetchError("Failed to load notifications");
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
    refreshUnreadCount();
  }, [authToken, fetchPage, applyPage, refreshUnreadCount]);

  useEffect(() => {
    if (!authToken) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      setFetchError(null);
      setPage(1);
      setHasNextPage(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    refreshUnreadCount();
    fetchPage(1, false)
      .then((Page) => {
        if (cancelled) return;
        applyPage(Page);
      })
      .catch(() => {
        if (!cancelled) setFetchError("Failed to load notifications");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authToken, fetchPage, applyPage, refreshUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    markAllReadAndRefresh();
  }, [isOpen, markAllReadAndRefresh]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !sentinelRef.current) return;
    const root = listRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      { root, rootMargin: "100px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isOpen, notifications.length]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleItemClick = (meta) => {
    if (meta?.nav) {
      navigate(`/Details?id=${meta.nav.id}&type=${meta.nav.type}`);
      setIsOpen(false);
    }
  };

  const showEmptyState =
    authToken && !loading && !fetchError && notifications.length === 0;

  return (
    <div className="notifications" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="notifications__button"
        type="button"
        aria-label="Notifications"
      >
        <Badge
          badgeContent={unreadCount}
          max={99}
          color="error"
          overlap="circular"
          invisible={!authToken || unreadCount <= 0}
        >
          <IoNotificationsSharp className="notification-icon" size={24} />
        </Badge>
      </button>

      {isOpen && (
        <div
          className={`notifications__dropdown${isMobile ? " notifications__dropdown--mobile" : ""}`}
        >
          <div className="notifications__header">
            <h3 className="notifications__title">Notifications</h3>
          </div>

          <div className="notifications__list" ref={listRef}>
            {loading && notifications.length === 0 && (
              <div className="notifications__state">
                Loading notifications...
              </div>
            )}

            {fetchError && notifications.length === 0 && (
              <div className="notifications__state notifications__state--error">
                Failed to load notifications
              </div>
            )}

            {!authToken && (
              <div className="notifications__state">
                Log in to view your notifications
              </div>
            )}

            {showEmptyState && (
              <div className="notifications__state">
                You're all caught up — no notifications yet
              </div>
            )}

            {authToken &&
              notifications.map((notification) => {
                const meta = getNotificationMeta(notification);
                return (
                  <div
                    key={notification.id}
                    className="notifications__item"
                    onClick={() => handleItemClick(meta)}
                  >
                    {meta.image ? (
                      <img
                        src={meta.image}
                        alt=""
                        className="notifications__thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div className="notifications__thumb notifications__thumb--fallback">
                        <IoNotificationsSharp size={18} />
                      </div>
                    )}
                    <div className="notifications__item-content">
                      <div className="notifications__item-title">
                        {meta.title}
                      </div>
                      {meta.subtitle && (
                        <div className="notifications__item-subtitle">
                          {meta.subtitle}
                        </div>
                      )}
                      <div className="notifications__item-meta">
                        <span className="notifications__time">{meta.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {authToken && loadingMore && (
              <div className="notifications__state">Loading more...</div>
            )}

            {authToken && !loadingMore && !hasNextPage && notifications.length > 0 && (
              <div className="notifications__state">
                You've reached the end
              </div>
            )}

            <div ref={sentinelRef} className="notifications__sentinel" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;