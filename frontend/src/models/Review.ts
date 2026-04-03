// src/models/Review.ts

// 1. Replaced the enum with an erasable Union Type
export type VisibilityState = "VISIBLE" | "HIDDEN" | "UNDER_REVIEW";

export class Review {
    public reviewID: string;
    public authorID: string;
    public content: string;
    public sweetnessScore: number;
    public workloadScore: number;
    private visibilityState: VisibilityState;
    private reportCount: number;

    constructor(id: string, authorID: string, content: string, sweetnessScore: number, workloadScore: number) {
        this.reviewID = id;
        this.authorID = authorID;
        this.content = content;
        this.sweetnessScore = sweetnessScore;
        this.workloadScore = workloadScore;
        
        // 2. Assign the string literal directly
        this.visibilityState = "VISIBLE"; 
        this.reportCount = 0;
    }

    public addReport() {
        this.reportCount++;
        if (this.reportCount >= 3) {
            // 3. Assign the string literal directly
            this.visibilityState = "UNDER_REVIEW";
        }
    }

    public isVisible(): boolean {
        // 4. Compare to the string literal
        return this.visibilityState === "VISIBLE";
    }
}