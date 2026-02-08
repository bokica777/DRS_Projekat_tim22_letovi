import { useState } from "react";
import { Button } from "../../components/common/Button";
import { Label } from "../../components/common/Label";
import { Select } from "../../components/common/Select";
import { adminSendFlightsReport, type ReportTab } from "../../api/adminFlights";

type ReportType = "PLANNED" | "IN_PROGRESS" | "FINISHED";

function mapTypeToTab(t: ReportType): ReportTab {
  if (t === "PLANNED") return "planned";
  if (t === "IN_PROGRESS") return "in_progress";
  return "history";
}

function errMsg(e: any): string {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return String(d.error);
  if (d?.message) return String(d.message);
  return e?.message ? String(e.message) : "Greška";
}

export default function AdminReportsPage() {
  const [type, setType] = useState<ReportType>("PLANNED");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const generate = async () => {
    setErr(null);
    setLoading(true);
    try {
      const tab = mapTypeToTab(type);
      const res = await adminSendFlightsReport(tab);
      alert(`Poslato na mail ✅ (${res.count} letova)`);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
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
            <div className="text-xs tracking-widest uppercase text-white/80">DRS Fly • Admin</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Izveštaji</h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">Generiši PDF izveštaj i pošalji ga na mail.</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6 grid gap-4 max-w-2xl">
            <div className="grid gap-2">
              <Label>Tip izveštaja</Label>
              <Select value={type} onChange={(e) => setType(e.target.value as ReportType)} className="rounded-2xl">
                <option value="PLANNED">Letovi koji nisu počeli</option>
                <option value="IN_PROGRESS">Letovi u toku</option>
                <option value="FINISHED">Završeni + otkazani letovi</option>
              </Select>
            </div>

            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="primary" className="rounded-2xl px-5" disabled={loading} onClick={generate}>
                {loading ? "Šaljem..." : "Pošalji PDF na mail"}
              </Button>
              <Button variant="secondary" className="rounded-2xl" type="button" onClick={() => setType("PLANNED")}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
