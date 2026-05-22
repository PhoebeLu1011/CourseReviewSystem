// src/app/pages/CourseCatalog.tsx

const mockCourses = [
  {
    courseID: "CS101",
    courseName: "Introduction to Computer Science",
    department: "Computer Science",
    teacher: "Prof. Wang",
  },
  {
    courseID: "CE201",
    courseName: "Engineering Mechanics",
    department: "Civil Engineering",
    teacher: "Prof. Lin",
  },
];

export default function CourseCatalog() {
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Course Catalog</h1>
        <p className="mt-2 text-muted-foreground">
          Browse courses and read student reviews.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockCourses.map((course) => (
          <div
            key={course.courseID}
            className="rounded-lg border bg-card p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{course.courseName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.department}
            </p>
            <p className="mt-3 text-sm">Instructor: {course.teacher}</p>
            <p className="mt-1 text-sm">Course ID: {course.courseID}</p>
          </div>
        ))}
      </div>
    </section>
  );
}