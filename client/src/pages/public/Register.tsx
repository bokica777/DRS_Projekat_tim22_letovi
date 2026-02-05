import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Gender } from "../../types/auth";
import { apiRegister } from "../../api/auth";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const selectBase =
  "w-full px-3 py-2 rounded-lg border outline-none bg-white " +
  "focus:ring-2 focus:ring-gray-200 focus:border-gray-300 " +
  "disabled:bg-gray-50 disabled:text-gray-500";

export default function RegisterPage() {
  const nav = useNavigate();

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    dateOfBirth: false,
    gender: false,
    country: false,
    street: false,
    streetNumber: false,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender>("OSTALO");

  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");

  const firstNameError = useMemo(() => {
    if (!firstName.trim()) return "Ime je obavezno.";
    return null;
  }, [firstName]);

  const lastNameError = useMemo(() => {
    if (!lastName.trim()) return "Prezime je obavezno.";
    return null;
  }, [lastName]);

  const emailError = useMemo(() => {
    const v = email.trim();
    if (!v) return "Email je obavezan.";
    if (!emailRegex.test(v)) return "Unesi ispravan email (npr. korisnik@test.com).";
    return null;
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "Lozinka je obavezna.";
    if (password.length < 4) return "Lozinka mora imati bar 4 karaktera.";
    return null;
  }, [password]);

  const dobError = useMemo(() => {
    if (!dateOfBirth) return "Datum rođenja je obavezan.";
    return null;
  }, [dateOfBirth]);

  const countryError = useMemo(() => {
    if (!country.trim()) return "Država je obavezna.";
    return null;
  }, [country]);

  const streetError = useMemo(() => {
    if (!street.trim()) return "Ulica je obavezna.";
    return null;
  }, [street]);

  const numberError = useMemo(() => {
    if (!streetNumber.trim()) return "Broj ulice je obavezan.";
    return null;
  }, [streetNumber]);

  const formValid =
    !firstNameError &&
    !lastNameError &&
    !emailError &&
    !passwordError &&
    !dobError &&
    !countryError &&
    !streetError &&
    !numberError;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      dateOfBirth: true,
      gender: true,
      country: true,
      street: true,
      streetNumber: true,
    });

    if (!formValid) return;

    setLoading(true);
    try {
      await apiRegister({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        birthDate: dateOfBirth,
        gender,
        country: country.trim(),
        street: street.trim(),
        number: streetNumber.trim(),
        balance: 0,
      });

      nav("/login");
    } catch (ex: any) {
      const msg =
        ex?.response?.data?.error ??
        ex?.message ??
        "Greška pri registraciji.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = (key: keyof typeof touched, error: string | null) =>
    touched[key] && !!error;

  const inputErrClass = "border-red-300 focus:ring-red-200 focus:border-red-300";
  const selectErrClass = "border-red-300 focus:ring-red-200 focus:border-red-300";

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800" />
            <img
              src="/src/assets/login.png"
              className="absolute inset-0 h-full w-full object-cover"
              alt="DRS Fly"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-700/80 via-blue-800/75 to-indigo-900/80" />

            <div className="relative z-10 p-10 h-full flex flex-col justify-between text-white">
              <div>
                <div className="text-xs tracking-widest uppercase opacity-90">
                  DRS Fly
                </div>
                <h1 className="mt-3 text-4xl font-extrabold leading-tight">
                  REGISTRACIJA
                </h1>
                <p className="mt-3 text-white/90 max-w-sm">
                  Kreiraj nalog i kreni sa upravljanjem letovima i kartama — sve na jednom mestu.
                </p>
              </div>

              <div className="text-sm text-white/80">
                ✈️ „Tvoja destinacija počinje ovde.”
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="md:hidden mb-6">
              <div className="text-xs tracking-widest uppercase text-gray-500">
                DRS Fly
              </div>
              <h1 className="mt-2 text-3xl font-extrabold">REGISTRACIJA</h1>
              <p className="mt-2 text-sm text-gray-600">
                Popuni podatke i kreiraj nalog.
              </p>
            </div>

            <h2 className="text-xl font-semibold">Kreiraj nalog</h2>
            <p className="mt-1 text-sm text-gray-600">
              Unesi osnovne podatke.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ime</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                    placeholder="npr. Marko"
                    autoComplete="given-name"
                    className={isInvalid("firstName", firstNameError) ? inputErrClass : ""}
                  />
                  {isInvalid("firstName", firstNameError) && (
                    <div className="text-xs text-red-600">{firstNameError}</div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Prezime</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                    placeholder="npr. Marković"
                    autoComplete="family-name"
                    className={isInvalid("lastName", lastNameError) ? inputErrClass : ""}
                  />
                  {isInvalid("lastName", lastNameError) && (
                    <div className="text-xs text-red-600">{lastNameError}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    placeholder="npr. korisnik@test.com"
                    autoComplete="email"
                    inputMode="email"
                    className={isInvalid("email", emailError) ? inputErrClass : ""}
                  />
                  {isInvalid("email", emailError) && (
                    <div className="text-xs text-red-600">{emailError}</div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Lozinka</Label>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    autoComplete="new-password"
                    className={isInvalid("password", passwordError) ? inputErrClass : ""}
                  />
                  {isInvalid("password", passwordError) && (
                    <div className="text-xs text-red-600">{passwordError}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Datum rođenja</Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, dateOfBirth: true }))}
                    className={isInvalid("dateOfBirth", dobError) ? inputErrClass : ""}
                  />
                  {isInvalid("dateOfBirth", dobError) && (
                    <div className="text-xs text-red-600">{dobError}</div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Pol</Label>
                  <select
                    className={[
                      selectBase,
                      isInvalid("gender", null) ? selectErrClass : "",
                    ].join(" ")}
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    onBlur={() => setTouched((p) => ({ ...p, gender: true }))}
                  >
                    <option value="M">M</option>
                    <option value="Z">Ž</option>
                    <option value="OSTALO">Ostalo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Država</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, country: true }))}
                    placeholder="npr. Srbija"
                    autoComplete="country-name"
                    className={isInvalid("country", countryError) ? inputErrClass : ""}
                  />
                  {isInvalid("country", countryError) && (
                    <div className="text-xs text-red-600">{countryError}</div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Ulica</Label>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, street: true }))}
                    placeholder="npr. Nemanjina"
                    autoComplete="address-line1"
                    className={isInvalid("street", streetError) ? inputErrClass : ""}
                  />
                  {isInvalid("street", streetError) && (
                    <div className="text-xs text-red-600">{streetError}</div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Broj</Label>
                  <Input
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, streetNumber: true }))}
                    placeholder="npr. 12"
                    autoComplete="address-line2"
                    className={isInvalid("streetNumber", numberError) ? inputErrClass : ""}
                  />
                  {isInvalid("streetNumber", numberError) && (
                    <div className="text-xs text-red-600">{numberError}</div>
                  )}
                </div>
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              <Button
                variant="primary"
                disabled={loading || !formValid}
                className="w-full rounded-xl py-2.5"
                type="submit"
              >
                {loading ? "Kreiranje…" : "Kreiraj nalog"}
              </Button>
            </form>

            <div className="mt-5 text-sm text-gray-600">
              Već imaš nalog?{" "}
              <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/login">
                Prijavi se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
