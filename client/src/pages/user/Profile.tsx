import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { Gender, User } from "../../types/auth";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";
import { Select } from "../../components/common/Select";
import { updateMe, uploadProfileImage } from "../../api/users";

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<User | null>(user ? { ...user } : null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) setForm({ ...user });
  }, [user]);

  const set = <K extends keyof User>(k: K, v: User[K]) =>
    setForm((p) => (p ? { ...p, [k]: v } : p));

  const onAvatar = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => set("avatarDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  const apiOrigin = useMemo(() => {
    const v = (import.meta as any).env?.VITE_API_URL as string | undefined;
    return (v || "").replace(/\/$/, "");
  }, []);

  const avatarSrc = useMemo(() => {
    if (!form?.avatarDataUrl) return "";
    if (form.avatarDataUrl.startsWith("data:")) return form.avatarDataUrl;
    if (form.avatarDataUrl.startsWith("/static")) return `${apiOrigin}${form.avatarDataUrl}`;
    return form.avatarDataUrl;
  }, [form?.avatarDataUrl, apiOrigin]);

  const save = async () => {
    if (!form) return;

    setSaving(true);
    try {
      await updateMe({
        firstName: form.firstName,
        lastName: form.lastName,
        birthDate: form.dateOfBirth,
        gender: form.gender as any,
        country: form.country,
        street: form.street,
        number: form.streetNumber,
      });

      if (avatarFile) {
        await uploadProfileImage(avatarFile);
        setAvatarFile(null);
      }

      await refreshMe();
      alert("Sačuvano!");
    } finally {
      setSaving(false);
    }
  };

  if (!user || !form) return <div className="p-4">Nisi ulogovan.</div>;

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
            <div className="text-xs tracking-widest uppercase text-white/80">DRS Fly • Profil</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Moj profil</h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Ažuriraj svoje podatke i sliku profila.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                {form.avatarDataUrl ? (
                  <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-gray-400 font-semibold">?</div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Slika profila</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onAvatar(e.target.files?.[0])}
                  className="text-sm"
                />
                <div className="text-xs text-gray-500">PNG/JPG • preporuka: kvadratna slika</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ime</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Prezime</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={form.email} disabled className="rounded-2xl" />
                </div>
                <div className="grid gap-2">
                  <Label>Datum rođenja</Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Pol</Label>
                  <Select
                    value={form.gender as Gender}
                    onChange={(e) => set("gender", e.target.value as any)}
                    className="rounded-2xl"
                  >
                    <option value="M">M</option>
                    <option value="Z">Ž</option>
                    <option value="OSTALO">Ostalo</option>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Država</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 grid gap-2">
                  <Label>Ulica</Label>
                  <Input
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Broj</Label>
                  <Input
                    value={form.streetNumber}
                    onChange={(e) => set("streetNumber", e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  disabled={saving}
                  onClick={save}
                  className="rounded-2xl px-5"
                >
                  {saving ? "Čuvam..." : "Sačuvaj promene"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
