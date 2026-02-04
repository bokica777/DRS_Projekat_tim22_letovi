import { useState } from "react";
import { Button } from "../../components/common/Button";
import { Label } from "../../components/common/Label";
import { Select } from "../../components/common/Select";

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
    await new Promise((r) => setTimeout(r, 1200));
    downloadMockPdf(`izvestaj-${type.toLowerCase()}-mock.pdf`);
    setLoading(false);
    alert("Izveštaj generisan (mock). U pravoj verziji ide i na mail.");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">

        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,.35) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-700/70 via-blue-800/65 to-indigo-900/70" />
          <div className="relative z-10 p-6 sm:p-10 text-white">
            <div className="text-xs tracking-widest uppercase text-white/80">
              DRS Fly • Admin
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Izveštaji
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Generiši PDF izveštaj po statusu letova (mock).
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6 grid gap-4 max-w-2xl">
            <div className="grid gap-2">
              <Label>Tip izveštaja</Label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ReportType)}
                className="rounded-2xl"
              >
                <option value="PLANNED">Letovi koji nisu počeli</option>
                <option value="IN_PROGRESS">Letovi u toku</option>
                <option value="FINISHED">Završeni + otkazani letovi</option>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="rounded-2xl px-5"
                disabled={loading}
                onClick={generate}
              >
                {loading ? "Generišem..." : "Generiši PDF"}
              </Button>
              <Button
                variant="secondary"
                className="rounded-2xl"
                type="button"
                onClick={() => setType("PLANNED")}
              >
                Reset
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              Kasnije: <code>POST /api/admin/reports</code> + slanje na mail.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
