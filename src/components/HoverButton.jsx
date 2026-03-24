import { useState } from "react";

export default function HoverButton({ baseStyle, hoverStyle, children, ...props }) {
  const [h, setH] = useState(false);
  return (
    <button
      {...props}
      onPointerEnter={() => setH(true)}
      onPointerLeave={() => setH(false)}
      style={{ ...baseStyle, ...(h ? hoverStyle : {}), transition: "all 0.15s ease" }}
    >
      {children}
    </button>
  );
}
