import { Link } from "react-router";

import { AchievementsPanel } from "../components/profile/AchievementsPanel";
import { CommunityPanel } from "../components/profile/CommunityPanel";
import { FavoriteCoursesPanel } from "../components/profile/FavoriteCoursesPanel";
import { GroupManagementPanel } from "../components/profile/GroupManagementPanel";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileStats } from "../components/profile/ProfileStats";
import { ReportsPanel } from "../components/profile/ReportsPanel";
import { ReviewsPanel } from "../components/profile/ReviewsPanel";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useUserProfile } from "../hooks/useUserProfile";

export default function UserProfile() {
  const profile = useUserProfile();

  if (!profile.authUser) {
    return (
      <Card className="border-dashed border-2 border-slate-200 shadow-none">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">請先登入</h2>
          <p className="mt-2 text-sm text-slate-500">登入後才能查看個人資料。</p>
          <Button asChild className="mt-4">
            <Link to="/auth/login">前往登入</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {profile.errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {profile.errorMsg}
        </div>
      )}

      <ProfileHeader
        user={profile.user}
        editForm={profile.editForm}
        isEditing={profile.isEditing}
        isLoading={profile.isLoading}
        fileInputRef={profile.fileInputRef}
        onEditFormChange={profile.setEditForm}
        onStartEdit={() => profile.setIsEditing(true)}
        onCancelEdit={profile.cancelEdit}
        onSave={profile.saveProfile}
        onAvatarChange={profile.changeAvatar}
      />

      <ProfileStats
        reviewCount={profile.user.reviewCount || profile.myReviews.length}
        replyCount={profile.user.replyCount || profile.myReplies.length}
        applyCount={profile.user.applyCount}
      />

      <Tabs defaultValue="favorites" className="w-full">
        <ProfileTabList showGroups={profile.authUser.role === "Student"} />

        <TabsContent value="favorites" className="mt-6">
          <FavoriteCoursesPanel
            courses={profile.favoriteCourses}
            isLoading={profile.favoritesLoading}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-4">
          <ReviewsPanel
            reviews={profile.myReviews}
            isLoading={profile.isLoadingReviews}
            editingReviewId={profile.editingReviewId}
            editForm={profile.editReviewForm}
            onEditingReviewChange={profile.setEditingReviewId}
            onEditFormChange={profile.setEditReviewForm}
            onUpdate={profile.updateMyReview}
            onDelete={profile.deleteMyReview}
          />
        </TabsContent>

        <TabsContent value="posts" className="mt-6 space-y-8">
          <CommunityPanel
            discussions={profile.myDiscussions}
            replies={profile.myReplies}
            editingDiscussionId={profile.editingDiscId}
            discussionForm={profile.editDiscForm}
            editingReplyId={profile.editingReplyId}
            replyContent={profile.editReplyContent}
            onEditingDiscussionChange={profile.setEditingDiscId}
            onDiscussionFormChange={profile.setEditDiscForm}
            onUpdateDiscussion={profile.updateMyDiscussion}
            onDeleteDiscussion={profile.deleteMyDiscussion}
            onEditingReplyChange={profile.setEditingReplyId}
            onReplyContentChange={profile.setEditReplyContent}
            onUpdateReply={profile.updateMyReply}
            onDeleteReply={profile.deleteMyReply}
          />
        </TabsContent>

        {profile.authUser.role === "Student" && (
          <TabsContent value="groups" className="mt-6">
            <GroupManagementPanel />
          </TabsContent>
        )}

        <TabsContent value="achievements" className="mt-6">
          <AchievementsPanel
            badges={profile.achievementBadges}
            score={profile.achievementScore}
            isLoading={profile.isLoadingAchievements}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsPanel
            reports={profile.myReportsList}
            contents={profile.reportContents}
            isLoading={profile.reportsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTabList({ showGroups }: { showGroups: boolean }) {
  const tabs = [
    ["favorites", "我的收藏"],
    ["reviews", "我的評論"],
    ["posts", "我的貼文"],
    ...(showGroups ? [["groups", "我的組隊"]] : []),
    ["achievements", "成就"],
    ["reports", "我的檢舉"],
  ];

  return (
    <TabsList className="mb-6 flex h-auto w-full flex-wrap rounded-xl bg-slate-100 p-1">
      {tabs.map(([value, label]) => (
        <TabsTrigger
          key={value}
          value={value}
          className="min-w-[120px] flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900"
        >
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
