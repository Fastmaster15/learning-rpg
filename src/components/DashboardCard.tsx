type DashboardCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function DashboardCard({ title, subtitle, children }: DashboardCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-panel/90 p-5 shadow-sm shadow-stone-200/70">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

