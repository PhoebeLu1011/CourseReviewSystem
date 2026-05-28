import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Flag,
  Clock,
  User,
  Send,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

// ─── Types ───────────────────────────────────────────────────
interface Reply {
  replyID: string;
  author: string;
  initials: string;
  date: string;
  content: string;
  likes: number;
}

interface DiscussionPost {
  discussionID: string;
  courseID: string;
  courseLabel: string;
  title: string;
  author: string;
  initials: string;
  date: string;
  content: string;
  tags: string[];
  likes: number;
  replies: Reply[];
}

// ─── Mock Data ───────────────────────────────────────────────
const mockDiscussions: Record<string, DiscussionPost> = {
  d001: {
    discussionID: "d001",
    courseID: "CS101",
    courseLabel: "CS 101: Introduction to Computer Science",
    title: "Tips for the final project?",
    author: "Erik Pedersen",
    initials: "EP",
    date: "2026/4/9",
    content:
      "Hey everyone! I'm starting to think about the final project. For those who took this last semester, any advice on choosing a topic? I'm torn between a game and a web app.",
    tags: ["project", "advice"],
    likes: 15,
    replies: [
      {
        replyID: "rep001",
        author: "Sara Kristensen",
        initials: "SK",
        date: "2026/4/10",
        content:
          "I did a game last semester and it was fun, but make sure you scope it appropriately. A simple game with polish is better than an ambitious one that's buggy.",
        likes: 12,
      },
      {
        replyID: "rep002",
        author: "Thomas Eriksen",
        initials: "TE",
        date: "2026/4/11",
        content:
          "Web app is a solid choice - you can show it off easily and it looks good on your portfolio. Plus, Dr. Johnson has more resources for web debugging.",
        likes: 8,
      },
    ],
  },
  d002: {
    discussionID: "d002",
    courseID: "CS101",
    courseLabel: "CS 101: Introduction to Computer Science",
    title: "How do you approach debugging?",
    author: "Ida Johansen",
    initials: "IJ",
    date: "2026/4/16",
    content:
      "I keep getting stuck on bugs and spend hours trying to figure them out. What strategies do you all use when debugging your code? Any tips for a beginner?",
    tags: ["advice", "debugging"],
    likes: 23,
    replies: [
      {
        replyID: "rep003",
        author: "Lars Andersen",
        initials: "LA",
        date: "2026/4/16",
        content:
          "Print statements are your best friend when starting out. Add them at key points to see what values your variables have.",
        likes: 19,
      },
      {
        replyID: "rep004",
        author: "Mia Sørensen",
        initials: "MS",
        date: "2026/4/17",
        content:
          "Learn to use the debugger built into VS Code — breakpoints will change your life. You can step through your code line by line.",
        likes: 14,
      },
      {
        replyID: "rep005",
        author: "Ole Kristensen",
        initials: "OK",
        date: "2026/4/17",
        content:
          "Also, try explaining your code to someone else (or a rubber duck!). Often just talking through the logic helps you spot the bug yourself.",
        likes: 11,
      },
    ],
  },
};

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
      {initials}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function DiscussionDetail() {
  const { courseID, discussionID } = useParams<{
    courseID: string;
    discussionID: string;
  }>();

  const post = discussionID ? mockDiscussions[discussionID] : null;

  if (!post) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-xl font-semibold text-slate-700">Discussion not found.</p>
        <Link to={`/courses/${courseID}`} className="text-primary hover:underline text-sm">
          ← Back to course
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to={`/courses/${post.courseID}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back to All Discussions
        </Link>
        <span className="rounded-md border bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
          {post.courseLabel}
        </span>
      </div>

      {/* Main Post */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar initials={post.initials} />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{post.title}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User size={13} /> {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {post.date}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-slate-700">{post.content}</p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs rounded-full px-3">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-800">
                <ThumbsUp size={15} /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-800">
                <MessageSquare size={15} /> {post.replies.length} Replies
              </button>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500">
              <Flag size={14} /> Report Post
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <MessageSquare size={17} className="text-primary" />
          Replies ({post.replies.length})
        </h2>

        {post.replies.map((reply) => (
          <Card key={reply.replyID}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar initials={reply.initials} />
                <div>
                  <span className="font-bold text-slate-800 text-sm">{reply.author}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{reply.date}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 pl-[52px]">
                {reply.content}
              </p>
              <div className="pl-[52px]">
                <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-800">
                  <ThumbsUp size={13} /> {reply.likes}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post a Reply */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-slate-800">Post a Reply</h3>
          <textarea
            className="w-full resize-none rounded-lg border bg-slate-50 p-3 text-sm text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
            placeholder="Share your thoughts, answer questions, or contribute to the discussion..."
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Be respectful and constructive in your response
            </p>
            <Button size="sm" className="gap-2 font-semibold">
              <Send size={14} /> Login to Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-6 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-semibold">NTNU Course Selection Toolbox</p>
        <p>Spring 2026 • Academic Year 2025-2026</p>
      </footer>
    </div>
  );
}
