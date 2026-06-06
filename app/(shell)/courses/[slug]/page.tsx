import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES, getCourse } from "@/lib/courses";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  return { title: course ? `${course.title} — kwiKBio` : "Course — kwiKBio" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course || course.locked) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/courses" className="text-sm text-ink-secondary hover:text-accent">
        ← Courses
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {course.icon}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <div className="text-xs uppercase tracking-wide text-ink-secondary">
            {course.track} track
          </div>
        </div>
      </div>

      <p className="mt-4 text-ink-secondary">{course.blurb}</p>

      <div className="mt-6 rounded-lg border border-shell-border bg-shell-surface p-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-shell-bg">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${course.progress}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-ink-secondary">
          {course.progress}% complete
        </div>
      </div>

      <ol className="mt-8 space-y-3">
        {course.weeks.map((w, i) => (
          <li
            key={i}
            className="rounded-lg border border-shell-border bg-shell-surface p-5"
          >
            <div className="font-medium text-ink-primary">{w.title}</div>
            <p className="mt-1 text-sm text-ink-secondary">{w.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
