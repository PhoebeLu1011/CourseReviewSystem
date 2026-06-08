import { type Discussion } from "../api/discussionApi";

// ─── STRATEGY PATTERN: Sorting Algorithms ──────────────────────────────
export interface SortStrategy {
  sort(discussions: Discussion[]): Discussion[];
}

export class SortByRecent implements SortStrategy {
  sort(discussions: Discussion[]): Discussion[] {
    return [...discussions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export class SortByLikes implements SortStrategy {
  sort(discussions: Discussion[]): Discussion[] {
    return [...discussions].sort((a, b) => b.likeCount - a.likeCount);
  }
}

export class SortByRelevance implements SortStrategy {
  sort(discussions: Discussion[]): Discussion[] {
    return [...discussions].sort((a, b) => this.calculateScore(b) - this.calculateScore(a));
  }
  
  private calculateScore(discussion: Discussion): number {
    const hoursOld = Math.max(0, (Date.now() - new Date(discussion.timestamp).getTime()) / (1000 * 60 * 60));
    const decayFactor = 1 + (0.125 * hoursOld); // 4x penalty after 24 hours
    return (discussion.likeCount + 1) / decayFactor;
  }
}

export class DiscussionSorter {
  private strategy: SortStrategy;
  constructor(strategy: SortStrategy) { this.strategy = strategy; }
  setStrategy(strategy: SortStrategy) { this.strategy = strategy; }
  executeSort(discussions: Discussion[]): Discussion[] { return this.strategy.sort(discussions); }
}