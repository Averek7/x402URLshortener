export default function StatusBox({ status }) {
  if (!status) return null;

  return (
    <div
      style={{
        background: "#f0f0f0",
        padding: "12px 16px",
        borderRadius: 8,
        marginTop: 16,
        fontSize: 14,
        whiteSpace: "pre-wrap",
      }}
    >
      {status}
    </div>
  );
}
