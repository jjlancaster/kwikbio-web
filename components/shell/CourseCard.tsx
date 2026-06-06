import Link from "next/link";
import type { Course } from "@/lib/courses";

export default function CourseCard({ course }: { course: Course }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden>
          {course.icon}
        </span>
        <span className="rounded-md border border-shell-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-ink-secondary">
          {course.track}
        </span>
      </div>
      <div className="mt-3 font-medium text-ink-primary">{course.title}</div>
      <p className="mt-1 line-clamp-3 text-sm text-ink-secondary">
        {course.blurb}
      </p>

      {course.locked ? (
        <div className="mt-4 inline-flex items-center gap-1 text-xs text-ink-secondary/50">
          🔒 Locked
        </div>
      ) : (
        <div className="mt-4">
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
      )}
    </>
  );

  const cls =
    "block rounded-xl border border-shell-border bg-shell-surface p-5 transition-colors";

  if (course.locked) {
    return (
      <div className={`${cls} cursor-not-allowed opacity-60`} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/courses/${course.slug}`} className={`${cls} hover:border-accent`}>
      {inner}
    </Link>
  );
}
