import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Circle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../utils/profileSearch";
import styles from "./notifications.module.css";
import { Button } from "../../../common";
const formatTimeAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const Notifications = ({
  compact = false,
  maxItems = 20,
  title = "Notification Alerts",
  onViewAll,
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const VIEW_THRESHOLD = 6;
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const fetchNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        setItems([]);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications?limit=${Math.max(1, maxItems)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-cache",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [maxItems, token],
  );
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "alerts") return;
      setSearchQuery(String(query || ""));
    };

    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, []);
  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );
  const markAsRead = async (id) => {
    if (!token || !id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      setItems((previous) =>
        previous.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };
  const markAllAsRead = async () => {
    if (!token || unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      setItems((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsMarkingAll(false);
    }
  };
  const openNotification = (notification) => {
    if (!notification?.payload?.url) return;
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    navigate(notification.payload.url);
  };
  const filteredItems = useMemo(() => {
    const query = String(searchQuery || "")
      .trim()
      .toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const searchable = [
        item?.title,
        item?.message,
        item?.payload?.url,
        item?._id,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return searchable.some((value) => value.includes(query));
    });
  }, [items, searchQuery]);

  const displayedItems = useMemo(() => {
    if (isExpanded || compact) return filteredItems;
    return filteredItems.slice(0, VIEW_THRESHOLD);
  }, [filteredItems, isExpanded, compact]);
  return (
    <section
      className={`${styles.wrapper} ${compact ? styles.compactWrapper : ""}`}
    >
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle} >What’s New & What’s Next</p>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </div>

        <div className={styles.actions}>
          {!compact && unreadCount > 0 && (
            <Button
              type="button"
              className={styles.textButton}
              onClick={markAllAsRead}
              disabled={isMarkingAll}
              variant="primary"
              size="md"
            >
              <CheckCheck size={14} />
              {isMarkingAll ? "Updating..." : "Mark all read"}
            </Button>
          )}
        </div>
      </header>

      {loading ? (
        <div className={styles.state}>Loading alerts...</div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.state}>
          {searchQuery.trim()
            ? "No alerts match your search."
            : "No alerts yet."}
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {displayedItems.map((item) => {
              const isUnread = !item.isRead;
              return (
                <article
                  key={item._id}
                  className={`${styles.item} ${isUnread ? styles.unreadItem : ""}`}
                  onClick={() => openNotification(item)}
                  role={item?.payload?.url ? "button" : undefined}
                  tabIndex={item?.payload?.url ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openNotification(item);
                    }
                  }}
                >
                  <div className={styles.itemHeader}>
                    <div className={styles.titleWithBadge}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                      {item.type === "NEW_RESCUE_REPORT" && (
                        <span className={styles.rescueBadge}>Rescue</span>
                      )}
                    </div>
                    <div className={styles.headerRight}>
                      <span className={styles.time}>
                        {formatTimeAgo(item.createdAt)}
                      </span>
                      {compact && isUnread && (
                        <button
                          type="button"
                          className={styles.unreadDotBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item._id);
                          }}
                          title="Mark as read"
                          aria-label="Mark as read"
                        />
                      )}
                    </div>
                  </div>

                  <p className={styles.message}>{item.message}</p>

                  {!compact && (
                    <div className={styles.metaRow}>
                      <span
                        className={`${styles.statusPill} ${isUnread ? styles.unreadPill : ""}`}
                      >
                        {isUnread ? (
                          <Circle size={10} />
                        ) : (
                          <CheckCheck size={12} />
                        )}
                        {isUnread ? "Unread" : "Read"}
                      </span>

                      <div className={styles.itemActions}>
                        {isUnread && (
                          <Button
                            type="button"
                            className={styles.markButton}
                            onClick={(event) => {
                              event.stopPropagation();
                              markAsRead(item._id);
                            }}
                            variant="primary"
                            size="md"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {(filteredItems.length > VIEW_THRESHOLD ||
            (compact && onViewAll)) && (
            <div className={styles.footerWrap}>
              {filteredItems.length > VIEW_THRESHOLD && !compact && (
                <Button
                  type="button"
                  className={styles.expandButton}
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  size="md"
                >
                  {isExpanded
                    ? "View Less"
                    : `View All (${filteredItems.length})`}
                </Button>
              )}

              {compact && onViewAll && (
                <Button
                  type="button"
                  className={styles.expandButton}
                  onClick={onViewAll}
                  variant="ghost"
                  size="md"
                  fullWidth
                >
                  View all notifications{" "}
                  <ExternalLink size={14} style={{ marginLeft: "4px" }} />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
export default Notifications;
