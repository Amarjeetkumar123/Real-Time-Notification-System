export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#9ca3af",
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </p>
        <h2
          style={{
            margin: "6px 0 0",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#0f0f0f",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: 1.6,
            maxWidth: "640px",
          }}
        >
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
