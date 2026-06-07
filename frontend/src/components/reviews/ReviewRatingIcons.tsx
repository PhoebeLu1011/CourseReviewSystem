import { BookOpen, Star } from "lucide-react";

interface ReviewRatingIconsProps {
  rating: number;
  type: "sweetness" | "workload";
  interactive?: boolean;
  setRating?: (rating: number) => void;
}

export function ReviewRatingIcons({
  rating,
  type,
  interactive = false,
  setRating = () => undefined,
}: ReviewRatingIconsProps) {
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
            interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
          }`}
          onClick={() => interactive && setRating(index + 1)}
        />
      ))}
    </span>
  );
}
