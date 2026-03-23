export default function Toast({ toast, t }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 999,
      background: t.toastBg, border: `2px solid ${t.toastBorder}`, borderRadius: 16,
      padding: "16px 28px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "slideDown 0.4s ease", maxWidth: "90vw",
    }}>
      <span style={{ fontSize: 32 }}>{toast.emoji}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{toast.msg}</span>
    </div>
  );
}
