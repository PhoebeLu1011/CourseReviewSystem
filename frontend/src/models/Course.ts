type CoursePayload = Partial<{
    courseID: string;
    courseCode: string;
    title: string;
    serialNumber: string;
    department: string;
    professors: string[] | string;
    timeAndLocation: string;
    academicYear: string;
    semester: string;
    syllabusURL: string;
    credits: number | string;
    capacity: number | string;
    level: string;
    averageSweetness: number | string;
    averageWorkload: number | string;
    reviewCount: number | string;
}>;

export class Course {
    public courseID: string;
    public courseCode: string;
    public title: string;
    public serialNumber: string;
    public department: string;
    public professors: string[];
    public timeAndLocation: string;
    public academicYear: string;
    public semester: string;
    public syllabusURL: string;
    public credits: number;
    public capacity: number;
    public level: string;
    public averageSweetness: number;
    public averageWorkload: number;
    public reviewCount: number;

    constructor(data: CoursePayload) {
        this.courseID = data.courseID || "";
        this.courseCode = data.courseCode || "";
        this.title = data.title || "";
        this.serialNumber = data.serialNumber || "";
        this.department = data.department || "";
        this.professors = Array.isArray(data.professors)
            ? data.professors
            : String(data.professors || "")
                .split(/[,，\s]+/)
                .filter(Boolean);
        this.timeAndLocation = data.timeAndLocation || "";
        this.academicYear = data.academicYear || "";
        this.semester = data.semester || "";
        this.syllabusURL = data.syllabusURL || "";
        this.credits = Number(data.credits) || 0;
        this.capacity = Number(data.capacity) || 0;
        this.level = data.level || "";
        
        this.averageSweetness = Number(data.averageSweetness) || 0.0;
        this.averageWorkload = Number(data.averageWorkload) || 0.0;
        this.reviewCount = Number(data.reviewCount) || 0;
    }
}
