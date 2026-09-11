import Link from 'next/link';

export function SectionHeader({
  eyebrow,
  title,
  description,
  linkHref,
  linkText = 'VER TODO',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="heading-lg mt-2 text-ink-950">{title}</h2>
        {description && (
          <p className="mt-3 max-w-xl text-[11px] leading-relaxed tracking-wider2 text-smoke-600">
            {description}
          </p>
        )}
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="link-underline shrink-0 text-[10px] font-semibold tracking-brand text-ink-950"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}
