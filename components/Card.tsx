import Link from "next/link";

type CardProps = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

export function Card({ title, description, icon, href }: CardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    >
      <span className="mb-3 text-3xl" aria-hidden>
        {icon}
      </span>
      <h2 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-accent">
        {title}
      </h2>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}
