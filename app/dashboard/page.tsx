import { Card } from "@/components/Card";
import { tools } from "@/lib/tools";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Dev Utility Hub</h1>
        <p className="mt-2 text-slate-600">
          A collection of developer tools in one place. Pick a utility to get
          started.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
}
