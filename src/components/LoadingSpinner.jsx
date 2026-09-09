export default function LoadingSpinner({ label = "A carregar..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-base-content/60">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
