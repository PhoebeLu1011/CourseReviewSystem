import { BookOpen, Star } from "lucide-react";

export function RatingIcons({
  rating,
  type,
  interactive = false,
  setRating = () => {},
}: {
  rating: number;
  type: "sweetness" | "workload";
  interactive?: boolean;
  setRating?: (rating: number) => void;
}) {
  const Icon = type === "sweetness" ? Star : BookOpen;
  const activeClass =
    type === "sweetness"
      ? "fill-amber-400 text-amber-400"
      : "fill-blue-500 text-blue-500";
  const inactiveClass = "fill-slate-100 text-slate-200";

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon
          key={index}
          size={16}
          className={`${index < Math.round(rating) ? activeClass : inactiveClass} ${
            interactive ? "cursor-pointer transition-transform hover:scale-110" : ""
          }`}
          onClick={() => interactive && setRating(index + 1)}
        />
      ))}
    </span>
  );
}
