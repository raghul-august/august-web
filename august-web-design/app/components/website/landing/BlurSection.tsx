export default function BlurSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={className}
      style={{ scrollMarginTop: "100px" }}
    >
      {children}
    </section>
  );
}
