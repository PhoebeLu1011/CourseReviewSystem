import { BookOpen } from "lucide-react";

export function CourseCatalogHero() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
        尋找你的課程
      </h1>
      <p className="max-w-xl text-base text-muted-foreground">
        探索師大 9,000+ 門課程。透過關鍵字搜尋，或依系所篩選。
      </p>
    </div>
  );
}
