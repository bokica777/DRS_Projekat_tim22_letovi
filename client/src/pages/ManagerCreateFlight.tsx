import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAirlines } from "../mocks/handlers";
import type { Airline, Flight } from "../types/flights";
import { addFlight, getFlights } from "../mocks/flightStore";
import { useAuth } from "../auth/AuthContext";

export default function ManagerCreateFlightPage() {
    const nav = useNavigate();
    const { user, hasRole } = useAuth();

    const [airlines, setAirlines] = useState<Airline[]>([]);
    const [name, setName] = useState("");
    const [airlineId, setAirlineId] = useState<number>(1);
    const [distanceKm, setDistanceKm] = useState<number>(1000);
    const [durationMinutes, setDurationMinutes] = useState<number>(60);
    const [departureTime, setDepartureTime] = useState<string>("");
    const [from, setFrom] = useState("BEG");
    const [to, setTo] = useState("CDG");
    const [price, setPrice] = useState<number>(120);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        listAirlines().then((a) => {
            setAirlines(a);
            if (a[0]) setAirlineId(a[0].id);
        });
    }, []);

    if (!user || !hasRole(["MANAGER"])) {
        return <div style={{ padding: 16 }}>Nemaš pristup ovoj stranici.</div>;
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        if (!name.trim()) return setErr("Naziv leta je obavezan.");
        if (!departureTime) return setErr("Vrijeme polaska je obavezno.");
        if (!from.trim() || !to.trim()) return setErr("Aerodromi su obavezni.");
        if (price <= 0) return setErr("Cijena mora biti > 0.");

        const airlineName = airlines.find((x) => x.id === airlineId)?.name ?? "N/A";

        const newId = Math.max(0, ...getFlights().map((f) => f.id)) + 1;

        const flight: Flight = {
            id: newId,
            name: name.trim(),
            airlineId,
            airlineName,
            distanceKm,
            durationMinutes,
            departureTime: new Date(departureTime).toISOString(),
            from: from.trim().toUpperCase(),
            to: to.trim().toUpperCase(),
            price,
            status: "PENDING",
            createdBy: user.email as any,
        } as any;

        addFlight(flight);
        alert("Let poslat administratoru na odobrenje ✅ (mock)");
        nav("/flights");
    };

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
            <h2>Novi let (MENADŽER)</h2>

            <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <input
                    placeholder="Naziv leta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                />
                <label>Aviokompanija:</label>
                <select
                    value={airlineId}
                    onChange={(e) => setAirlineId(Number(e.target.value))}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                >
                    {airlines.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name}
                        </option>
                    ))}
                </select>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <label>Od:</label>
                    <input
                        placeholder="Aerodrom polaska (npr BEG)"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                    />
                    <label>Do:</label>
                    <input
                        placeholder="Aerodrom dolaska (npr CDG)"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                    />
                </div>
                <label>Datum i vreme poletanja:</label>     
                <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                />

                <div style={{ marginTop: 10 }}>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        <div>
                            <label>Dužina leta (km)</label>
                            <input
                                type="number"
                                value={distanceKm}
                                onChange={(e) => setDistanceKm(Number(e.target.value))}
                                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
                            />
                        </div>

                        <div>
                            <label>Trajanje leta (min)</label>
                            <input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
                            />
                        </div>

                        <div>
                            <label>Cena karte (€)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
                            />
                        </div>
                    </div>
                </div>


                {err && <div style={{ color: "crimson" }}>{err}</div>}

                <button
                    style={{
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                    }}
                >
                    Pošalji na odobrenje
                </button>
            </form>
        </div>
    );
}
