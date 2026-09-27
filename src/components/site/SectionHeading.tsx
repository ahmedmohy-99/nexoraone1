export function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-start"}>
      <h2 className="text-3xl font-bold sm:text-4xl">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle ? <p className="text-muted-foreground mt-3 text-base">{subtitle}</p> : null}
    </div>
  );
}
