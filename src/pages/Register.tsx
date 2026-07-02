import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, UserPlus } from "lucide-react";
import { getBranches } from "@/services/branch.services";
import { getNationalities } from "@/services/nationality.services";
import { getNationalityCategories } from "@/services/nationalityCategory.services";
import type { NationalityDto } from "@/services/nationality.services";
import type { NationalityCategoryDto } from "@/types/NationalityCategoryDto";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Account fields
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Trainee fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ssn, setSsn] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");

  // Dropdown data
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [nationalities, setNationalities] = useState<NationalityDto[]>([]);
  const [nationalityCategories, setNationalityCategories] = useState<
    NationalityCategoryDto[]
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("");
  const [selectedNationalityCategoryId, setSelectedNationalityCategoryId] =
    useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [branchRes, natRes, natCatRes] = await Promise.all([
        getBranches(),
        getNationalities(),
        getNationalityCategories(),
      ]);
      if (branchRes.isSuccess) setBranches(branchRes.data);
      if (natRes.isSuccess) setNationalities(natRes.data);
      if (natCatRes.isSuccess) setNationalityCategories(natCatRes.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const trimmedName = userName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedSsn = ssn.trim();

    const validationErrors: string[] = [];
    if (!trimmedFirstName) validationErrors.push("First name is required.");
    if (!trimmedLastName) validationErrors.push("Last name is required.");
    if (!trimmedName) validationErrors.push("Username is required.");
    if (!trimmedEmail) validationErrors.push("Email is required.");
    if (!trimmedSsn) validationErrors.push("SSN is required.");
    if (password.length < 6)
      validationErrors.push("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      validationErrors.push("Passwords do not match.");
    if (!trimmedPhone && !/^\+?\d{8,11}$/.test(trimmedPhone))
      validationErrors.push("Phone number is invalid.");
    if (!birthDate) validationErrors.push("Birth date is required.");
    if (!gender) validationErrors.push("Gender is required.");
    if (!selectedBranchId) validationErrors.push("Branch is required.");
    if (!selectedNationality)
      validationErrors.push("Nationality is required.");
    if (!selectedNationalityCategoryId)
      validationErrors.push("Nationality category is required.");
    if (!city.trim()) validationErrors.push("City is required.");
    if (!street.trim()) validationErrors.push("Street is required.");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        userName: trimmedName,
        email: trimmedEmail,
        password,
        phoneNumber: trimmedPhone,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        ssn: trimmedSsn,
        birthDate,
        gender,
        nationality: selectedNationality,
        city: city.trim(),
        street: street.trim(),
        branchId: Number(selectedBranchId),
        nationalityCategoryId: Number(selectedNationalityCategoryId),
      });
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.getValidationErrors());
      } else {
        setErrors(["Registration failed. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-athletic-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl text-gradient">
              Create Account
            </CardTitle>
            <CardDescription className="mt-1">
              Join AURA Sport Academy
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />

              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />

              <Label htmlFor="userName">Username</Label>
              <Input
                id="userName"
                type="text"
                placeholder="Your username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                autoComplete="username"
              />

              <Label htmlFor="ssn">SSN (National ID)</Label>
              <Input
                id="ssn"
                type="text"
                placeholder="12-digit national ID"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                required
              />

              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />

              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="nationality">Nationality</Label>
              <Select
                value={selectedNationality}
                onValueChange={setSelectedNationality}
              >
                <SelectTrigger id="nationality">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  {nationalities.map((n) => (
                    <SelectItem key={n.id} value={n.name}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="nationalityCategory">
                Nationality Category
              </Label>
              <Select
                value={selectedNationalityCategoryId}
                onValueChange={setSelectedNationalityCategoryId}
              >
                <SelectTrigger id="nationalityCategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {nationalityCategories.map((nc) => (
                    <SelectItem key={nc.id} value={String(nc.id)}>
                      {nc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="branch">Branch</Label>
              <Select
                value={selectedBranchId}
                onValueChange={setSelectedBranchId}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                type="text"
                placeholder="Your street address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />

              <Label htmlFor="phoneNumber">Phone</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. +965 59827349"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
              />

              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="hero"
              disabled={loading}
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
