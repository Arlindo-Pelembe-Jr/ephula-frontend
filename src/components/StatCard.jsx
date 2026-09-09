export default function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body flex-row items-center gap-4 py-5">
        {Icon && (
          <div className="rounded-full bg-primary/10 text-primary p-3">
            <Icon size={24} />
          </div>
        )}
        <div>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="text-sm text-base-content/60">{label}</p>
        </div>
      </div>
    </div>
  );
}
