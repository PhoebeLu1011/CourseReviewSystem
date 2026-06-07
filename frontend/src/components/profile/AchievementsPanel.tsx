import { MessageSquare, Star, Trophy } from "lucide-react";

import type { Badge as AchievementBadge } from "../../models/Achievement";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface AchievementsPanelProps {
  badges: AchievementBadge[];
  score: number;
  isLoading: boolean;
}

export function AchievementsPanel({
  badges,
  score,
  isLoading,
}: AchievementsPanelProps) {
  return (
    <>
      <div className="mb-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-500">Achievement Score</p>
        <p className="mt-2 text-3xl font-black text-slate-900">{score}</p>
        <p className="mt-1 text-xs text-slate-400">
          根據評論數、回覆數與找組員申請數計算。
        </p>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">載入成就中...</p>
      ) : badges.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none">
          <CardContent className="p-8 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">尚未獲得成就</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              發表評論、參與討論或申請加入小組後，成就會顯示在這裡。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {badges.map((badge) => {
            const Icon = getAchievementIcon(badge.category);
            return (
              <Card key={badge.badgeID} className="border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                    <Icon size={24} />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{badge.badgeName}</h3>
                    <Badge variant="outline" className="rounded-full border-rose-200 text-rose-700">
                      Lv. {badge.level}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-400">
                    {getAchievementCategoryLabel(badge.category)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-500">{badge.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function getAchievementIcon(category: string) {
  if (category === "reviewer") return Star;
  if (category === "replier") return MessageSquare;
  return Trophy;
}

function getAchievementCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    reviewer: "評論成就",
    replier: "回覆成就",
    group_participant: "找組員成就",
    contributor: "平台貢獻",
  };
  return labels[category] || category;
}
