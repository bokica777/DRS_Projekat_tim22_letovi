import { useEffect, useState } from "react";
import { createSocket } from "../ws/socket";

export default function WSTest() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const socket = createSocket("http://localhost:5000", "admin1", "ADMIN");

    const events = [
      "flight.created.pending",
      "flight.approved",
      "flight.rejected",
      "flight.cancelled",
      "flight.status.changed",
    ] as const;

    const addLog = (msg: string) => setLogs((p) => [msg, ...p]);

    socket.on("connect", () => {
  addLog(`connected: ${socket.id}`);


  socket.emit(
    "ping",
    { time: Date.now(), from: "WSTest" },
    (ack: any) => {
      addLog(`ping ack: ${JSON.stringify(ack)}`);
    }
  );
});
    socket.on("connect_error", (err) => addLog(`connect_error: ${err.message}`));

    events.forEach((ev) => {
      socket.on(ev, (data) => addLog(`${ev}: ${JSON.stringify(data)}`));
    });

    return () => {
      // cleanup mora da bude void
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>WS Test</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{logs.join("\n\n")}</pre>
    </div>
  );
}
