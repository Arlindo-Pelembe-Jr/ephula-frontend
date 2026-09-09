export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-error shadow-sm">
      <span>{message || "Ocorreu um erro ao comunicar com o servidor."}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
