import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface HomeHeroProps {
  isGuest: boolean;
  displayName: string;
}

export function HomeHero({ isGuest, displayName }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl md:p-12">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600 opacity-30 blur-3xl" />
      <div className="relative z-10 max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-blue-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          114 學年度第二學期
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          {isGuest ? (
            <>
              歡迎使用 <span className="text-blue-300">師大選課工具箱</span>
            </>
          ) : (
            <>
              歡迎回來，<span className="text-blue-300"> {displayName}</span>！
            </>
          )}
        </h1>

        <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-slate-300">
          整合課程評價、找組員、課表管理與討論的一站式選課平台。
        </p>

        {isGuest && (
          <div className="flex flex-wrap gap-4">
            <Link
              to="/auth/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              立即登入 <ChevronRight size={18} />
            </Link>
            <Link
              to="/courses"
              className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 font-bold text-white"
            >
              瀏覽課程
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
