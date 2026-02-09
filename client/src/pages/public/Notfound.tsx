import { useLocation } from "react-router-dom";

export default function NotFound() {
  const loc = useLocation();
  return (
    <div style={{ padding: 24 }}>
      404: {loc.pathname}
    </div>
  );
}
