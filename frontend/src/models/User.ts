export abstract class User{
    protected id: number;
    public name: string;
    public email: string;
    public profilePicURL: string;

    constructor(id: number, name: string, email: string, profilePicURL: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePicURL = profilePicURL;
    }
    abstract getRole(): string;
}

export class Student extends User {
    public department: string;
    protected studentID: string;
    reviewCount: number;
    constructor(id: number, name: string, email: string, profilePicURL: string, department: string, studentID: string) {
        super(id, name, email, profilePicURL);
        this.department = department;
        this.studentID = studentID;
        this.reviewCount = 0;
    }
    getRole(): string {
        return "Student";
    }
    incrementReviewCount() {
        this.reviewCount++;
    }
}