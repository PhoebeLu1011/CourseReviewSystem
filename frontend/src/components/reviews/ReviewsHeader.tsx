interface ReviewsHeaderProps {
  isWriting: boolean;
  onToggleWriting: () => void;
}

export function ReviewsHeader({ isWriting, onToggleWriting }: ReviewsHeaderProps) {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">課程評價</h1>
        <p className="text-muted-foreground mt-1">查看所有學生的課程評論與評分</p>
      </div>
      <button
        onClick={onToggleWriting}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        {isWriting ? "取消" : "撰寫評論"}
      </button>
    </div>
  );
}
