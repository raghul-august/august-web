import React from "react";

export default function LandingParallaxStack({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;

        // Sticky Hero Section
        if (i === 0) {
          const element = child as React.ReactElement<{ style?: React.CSSProperties }>;
          return React.cloneElement(element, {
            style: {
              ...(element.props.style || {}),
              position: "sticky",
              top: 0,
              zIndex: 1,
              minHeight: "100vh",
              overflow: "hidden",
            },
          });
        }

        // Framed second section
        if (i === 1) {
          return (
            <div
              style={{
                position: "relative",
                zIndex: 2,
                borderTopLeftRadius: "28px",
                borderTopRightRadius: "28px",
                boxShadow: "0px -20px 60px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              {child}
            </div>
          );
        }

        // Subsequent sections
        return (
          <div style={{ position: "relative", zIndex: i + 1 }}>
            {child}
          </div>
        );
      })}
    </div>
  );
}
