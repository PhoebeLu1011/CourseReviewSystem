import { Card, CardContent } from "../ui/card";

interface ProfileStatsProps {
  reviewCount: number;
  replyCount: number;
  applyCount: number;
}

export function ProfileStats({
  reviewCount,
  replyCount,
  applyCount,
}: ProfileStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <StatCard label="評論數" value={reviewCount} />
      <StatCard label="回覆數" value={replyCount} />
      <StatCard label="申請數" value={applyCount} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
