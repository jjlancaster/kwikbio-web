import CourseCard from "@/components/shell/CourseCard";
import { COURSES } from "@/lib/courses";

export const metadata = { title: "Courses — kwiKBio" };

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">Courses</h1>
      <p className="mt-2 text-ink-secondary">
        Learn the ARS engine, then apply it in your vertical. Your progress syncs
        with your account.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((c) => (
          <CourseCard key={c.slug} course={c} />
        ))}
      </div>
    </div>
  );
}
