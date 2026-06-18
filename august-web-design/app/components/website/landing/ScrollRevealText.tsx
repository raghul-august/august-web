export default function ScrollRevealText({
  children,
  as: Tag = "h2",
  id,
  className,
  style,
  highlight,
}: {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  highlight?: { words?: string[]; range?: [number, number]; color?: string; italic?: boolean };
}) {
  return (
    <Tag id={id} className={className} style={{ scrollMarginTop: "80px", ...style }}>
      {children.split(" ").map((word, i) => {
        const cleanWord = word.replace(/\u00A0/g, "");
        const matchesWord = highlight?.words?.some(
          (hw) => cleanWord.toLowerCase().includes(hw.toLowerCase())
        );
        const matchesRange = highlight?.range && i >= highlight.range[0] && i <= highlight.range[1];
        const isHighlighted = matchesWord || matchesRange;
        return (
          <span
            key={i}
            className="sr-word"
            style={{
              display: "inline-block",
              marginRight: "0.25em",
              ...(isHighlighted && {
                color: highlight?.color,
                fontStyle: highlight?.italic ? "italic" : undefined,
              }),
            }}
          >
            {word}
          </span>
        );
      })}
    </Tag>
  );
}
