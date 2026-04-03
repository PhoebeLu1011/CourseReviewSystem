import {Review} from "./Review";

export class Course{
    public courseID: string;
    public courseName: string;  
    public reviews: Review[];
    public averageSweetness: number;
    public averageWorkload: number;
    constructor(courseID: string, courseName: string) {
        this.courseID = courseID;
        this.courseName = courseName;
        this.reviews = [];
        this.averageSweetness = 0;
        this.averageWorkload = 0;
    }

    public addReview(review: Review): void {
        this.reviews.push(review);
        this.calculateAverages();
    }
    private calculateAverages(): void {
        const visibleReviews = this.getVisibleReviews();
        if (visibleReviews.length === 0) return;
        let totalSweetness = 0;
        let totalWorkload = 0;
        visibleReviews.forEach(r => {
            totalSweetness += r.sweetnessScore;
            totalWorkload += r.workloadScore;
        });

        this.averageSweetness = totalSweetness / visibleReviews.length;
        this.averageWorkload = totalWorkload / visibleReviews.length;


    }
    public getVisibleReviews(): Review[] {
        return this.reviews.filter(r => r.isVisible());
    }
}
