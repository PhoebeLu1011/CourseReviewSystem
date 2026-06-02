export abstract class User{
    protected id: string | number;
    public name: string;
    public email: string;
    public profilePicURL: string;
    public role : string;

    constructor(id: string | number, name: string, email: string, profilePicURL: string, role: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePicURL = profilePicURL;
        this.role = role;
    }
    abstract getRole(): string;
}

export class Student extends User {
    public department: string;
    public studentID: string;
    reviewCount: number;
    replyCount: number;
    public applyCount: number;
    constructor(id: string | number, name: string, email: string, profilePicURL: string, department: string, studentID: string) {
        super(id, name, email, profilePicURL, "Student");
        this.department = department;
        this.studentID = studentID;
        this.reviewCount = 0;
        this.replyCount = 0;
        this.applyCount = 0;
    }
    getRole(): string {
        return "Student";
    }
    incrementReviewCount() {
        this.reviewCount++;
    }
}