import { useState } from "react";

type ReportType = "PLANNED" | "IN_PROGRESS" | "FINISHED";

function downloadMockPdf(filename: string) {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 60 >>
stream
BT
/F1 24 Tf
72 720 Td
(Flights Report - MOCK) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
trailer
<< /Root 1 0 R /Size 5 >>
startxref
0
%%EOF`;

  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [type, setType] = useState<ReportType>("PLANNED");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulacija obrade
    downloadMockPdf(`report-${type.toLowerCase()}-mock.pdf`);
    setLoading(false);
    alert("Izveštaj generisan (mock). U pravoj verziji ide i na mail.");
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2>Izveštaji (ADMIN)</h2>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label>Tip izveštaja</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ReportType)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        >
          <option value="PLANNED">Letovi koji nisu počeli</option>
          <option value="IN_PROGRESS">Letovi u toku</option>
          <option value="FINISHED">Završeni + otkazani letovi</option>
        </select>

        <button
          disabled={loading}
          onClick={generate}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generišem..." : "Generiši PDF"}
        </button>

        <div style={{ fontSize: 12, color: "#777" }}>
          Kasnije: <code>POST /api/admin/reports</code> + slanje na mail.
        </div>
      </div>
    </div>
  );
}
