from io import BytesIO
from datetime import datetime
from typing import List, Dict, Tuple

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def _safe_str(x) -> str:
    return "" if x is None else str(x)


def generate_flights_report_pdf(tab: str, flights: List[Dict]) -> Tuple[bytes, str]:
    """
    Pravi jednostavan PDF izveštaj za listu letova (tab: planned / in_progress / history).
    Vraća (pdf_bytes, filename).
    """
    now = datetime.now()
    ts = now.strftime("%Y%m%d_%H%M%S")
    filename = f"izvestaj_letovi_{tab}_{ts}.pdf"

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, height - 40, "Izveštaj o letovima (Avio Letovi)")

    c.setFont("Helvetica", 10)
    c.drawString(40, height - 60, f"Tab: {tab}")
    c.drawString(200, height - 60, f"Generisano: {now.strftime('%d.%m.%Y %H:%M:%S')}")

    c.setFont("Helvetica", 10)
    c.drawString(40, height - 80, f"Ukupno letova: {len(flights)}")

    y = height - 110
    c.setFont("Helvetica-Bold", 9)
    c.drawString(40, y, "ID")
    c.drawString(70, y, "Naziv")
    c.drawString(210, y, "Kompanija")
    c.drawString(330, y, "Ruta")
    c.drawString(460, y, "Polazak")
    c.drawString(540, y, "Status")

    c.line(40, y - 4, width - 40, y - 4)

    c.setFont("Helvetica", 8)
    y -= 18

    def new_page():
        nonlocal y
        c.showPage()
        c.setFont("Helvetica-Bold", 14)
        c.drawString(40, height - 40, "Izveštaj o letovima (Avio Letovi)")
        c.setFont("Helvetica", 10)
        c.drawString(40, height - 60, f"Tab: {tab}")
        c.drawString(200, height - 60, f"Generisano: {now.strftime('%d.%m.%Y %H:%M:%S')}")
        y = height - 100
        c.setFont("Helvetica-Bold", 9)
        c.drawString(40, y, "ID")
        c.drawString(70, y, "Naziv")
        c.drawString(210, y, "Kompanija")
        c.drawString(330, y, "Ruta")
        c.drawString(460, y, "Polazak")
        c.drawString(540, y, "Status")
        c.line(40, y - 4, width - 40, y - 4)
        c.setFont("Helvetica", 8)
        y -= 18

    for f in flights:
        if y < 60:
            new_page()

        fid = _safe_str(f.get("id"))
        name = _safe_str(f.get("name"))
        comp = _safe_str((f.get("company") or {}).get("name"))
        frm = _safe_str(f.get("from_airport"))
        to = _safe_str(f.get("to_airport"))
        route = f"{frm}->{to}" if frm or to else ""
        dep = _safe_str(f.get("departure_time"))
        status = _safe_str(f.get("status"))

        if len(name) > 22:
            name = name[:22] + "…"
        if len(comp) > 16:
            comp = comp[:16] + "…"
        if len(route) > 20:
            route = route[:20] + "…"
        if len(dep) > 16:
            dep = dep[:16] + "…"
        if len(status) > 10:
            status = status[:10] + "…"

        c.drawString(40, y, fid)
        c.drawString(70, y, name)
        c.drawString(210, y, comp)
        c.drawString(330, y, route)
        c.drawString(460, y, dep)
        c.drawString(540, y, status)

        y -= 14

    c.showPage()
    c.save()

    pdf_bytes = buf.getvalue()
    buf.close()
    return pdf_bytes, filename