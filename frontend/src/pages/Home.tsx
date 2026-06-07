import { useEffect, useState } from "react";

import { getPublicAnnouncements } from "../api/announcementApi";
import { AnnouncementDialog } from "../components/home/AnnouncementDialog";
import { AnnouncementPanel } from "../components/home/AnnouncementPanel";
import { HomeHero } from "../components/home/HomeHero";
import { HomeShortcuts } from "../components/home/HomeShortcuts";
import { useAuth } from "../context/AuthContext";
import type { Announcement } from "../models/Announcement";

export default function Home() {
  const { user } = useAuth();
  const displayName = (user?.name ?? "訪客").split(" ")[0];
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const isGuest = !user;

  useEffect(() => {
    let isMounted = true;

    getPublicAnnouncements()
      .then((items) => {
        if (!isMounted) return;

        const sortedItems = [...items].sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) {
            return a.is_pinned ? -1 : 1;
          }

          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        });

        setAnnouncements(sortedItems);
        setAnnouncementError(null);
      })
      .catch((error) => {
        console.warn("Failed to load public announcements:", error);
        if (isMounted) {
          setAnnouncementError("公告暫時無法載入");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAnnouncements(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <HomeHero isGuest={isGuest} displayName={displayName} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <HomeShortcuts isGuest={isGuest} />
        <AnnouncementPanel
          announcements={announcements}
          isLoading={isLoadingAnnouncements}
          error={announcementError}
          onSelect={setSelectedAnnouncement}
        />
      </div>

      {selectedAnnouncement && (
        <AnnouncementDialog
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}
