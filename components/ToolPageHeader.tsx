import Link from "next/link";

type ToolPageHeaderProps = {
  title: string;
  description: string;
};

export function ToolPageHeader({ title, description }: ToolPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex text-sm text-slate-500 hover:text-accent"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-slate-600">{description}</p>
    </div>
  );
}
