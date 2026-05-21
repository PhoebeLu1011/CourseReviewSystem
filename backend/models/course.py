class Course:
    def __init__(
        self, 
        courseID,         
        title,              
        serialNumber,        
        department,          
        professors,           
        timeAndLocation,      
        academicYear,        
        semester,          
        syllabusURL="",      
        averageSweetness=0.0,
        averageWorkload=0.0,  
        reviewCount=0         
    ):
        self.courseID = courseID
        self.title = title
        self.serialNumber = serialNumber
        self.department = department
        self.professors = professors
        self.timeAndLocation = timeAndLocation
        self.academicYear = academicYear
        self.semester = semester
        self.syllabusURL = syllabusURL
        
        # Aggregated stats
        self.averageSweetness = float(averageSweetness)
        self.averageWorkload = float(averageWorkload)
        self.reviewCount = int(reviewCount)

    def to_dict(self):
        return {
            "courseID": self.courseID,
            "title": self.title,
            "serialNumber": self.serialNumber,
            "department": self.department,
            "professors": self.professors,
            "timeAndLocation": self.timeAndLocation,
            "syllabusURL": self.syllabusURL,
            "academicYear": self.academicYear,
            "semester": self.semester,
            "averageSweetness": self.averageSweetness,
            "averageWorkload": self.averageWorkload,
            "reviewCount": self.reviewCount
        }