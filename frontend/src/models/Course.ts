export class Course {
    public courseID: string;
    public title: string;
    public serialNumber: string;
    public department: string;
    public professors: string;
    public timeAndLocation: string;
    public academicYear: string;
    public semester: string;
    public syllabusURL: string;
    public averageSweetness: number;
    public averageWorkload: number;
    public reviewCount: number;

    constructor(data: any) {
        this.courseID = data.courseID;
        this.title = data.title;
        this.serialNumber = data.serialNumber;
        this.department = data.department;
        this.professors = data.professors;
        this.timeAndLocation = data.timeAndLocation;
        this.academicYear = data.academicYear;
        this.semester = data.semester;
        this.syllabusURL = data.syllabusURL || "";
        
        this.averageSweetness = Number(data.averageSweetness) || 0.0;
        this.averageWorkload = Number(data.averageWorkload) || 0.0;
        this.reviewCount = Number(data.reviewCount) || 0;
    }
}