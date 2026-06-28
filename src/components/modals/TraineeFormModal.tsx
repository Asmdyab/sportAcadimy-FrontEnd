import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFormDirty } from "@/hooks/useFormDirty";
import { z } from "zod";
import { BaseModal } from "./BaseModal";
import { FormInput } from "./FormInput";
import { FormSelect, SelectOption } from "./FormSelect";
import { FormMultiSelect, MultiSelectOption } from "./FormMultiSelect";
import {
  SearchableSelect,
  SearchableOption,
} from "@/components/ui/SearchableSelect";
import { FormDatePicker } from "./FormDatePicker";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getBranches } from "@/services/branch.services";
import { getSports } from "@/services/sport.services";
import { getFamilies } from "@/services/family.services";
import { getNationalityCategories } from "@/services/nationalityCategory.services";
import { getNationalities } from "@/services/nationality.services";
import { createTrainee } from "@/services/trainee.service";
import { CreateTraineeCommand } from "@/types/commands/createTraineeCommand";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToastAction } from "@/components/ui/toast";

// ─── Validation schema ────────────────────────────────────────────────────────
const traineeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  ssn: z
    .string()
    .trim()
    .length(12, "SSN must be exactly 12 digits")
    .regex(/^\d{12}$/, "SSN must be 12 numeric digits"),
  parentNumber: z
    .string()
    .trim()
    .min(8, "Parent phone must be at least 8 characters")
    .max(13, "Parent phone cannot exceed 13 characters")
    .optional()
    .or(z.literal("")),
  guardianName: z
    .string()
    .trim()
    .max(50, "Guardian name cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  gender: z.string().min(1, "Gender is required"),
  branchId: z.string().min(1, "Branch is required"),
  nationalityCategoryId: z.string().min(1, "Nationality category is required"),
  sportIds: z.array(z.string()).min(1, "At least one sport must be selected"),
  birthDate: z.date({ required_error: "Birth date is required" }),
  phoneNumber: z
    .string()
    .trim()
    .min(8, "Phone number must be at least 8 characters")
    .max(12, "Phone number cannot exceed 12 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(200, "Email cannot exceed 200 characters"),
  nationality: z.string().min(1, "Nationality is required"),
  street: z
    .string()
    .trim()
    .max(70, "Street cannot exceed 70 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(50, "City cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

type TraineeFormValues = z.infer<typeof traineeSchema>;
type FieldErrors = Partial<Record<keyof TraineeFormValues, string>>;

interface TraineeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TraineeFormModal({
  open,
  onOpenChange,
  onSuccess,
}: TraineeFormModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDirty, markDirty, resetDirty } = useFormDirty();
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [branches, setBranches] = useState<SelectOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [sportsOptions, setSportsOptions] = useState<MultiSelectOption[]>([]);
  const [sportsLoading, setSportsLoading] = useState(false);
  const [nationalityCategories, setNationalityCategories] = useState<
    SelectOption[]
  >([]);
  const [natLoading, setNatLoading] = useState(false);
  const [nationalities, setNationalities] = useState<SelectOption[]>([]);
  const [nationalitiesLoading, setNationalitiesLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<SearchableOption | null>(
    null,
  );
  const [ageWarning, setAgeWarning] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    ssn: "",
    parentNumber: "",
    guardianName: "",
    birthDate: undefined as Date | undefined,
    gender: "",
    branchId: "",
    sportIds: [] as string[],
    nationalityCategoryId: "",
    phoneNumber: "",
    email: "",
    nationality: "",
    street: "",
    city: "",
  });

  // Clear state and load options on open
  useEffect(() => {
    if (!open) return;
    resetDirty();
    setApiErrors([]);
    setFieldErrors({});
    setAgeWarning("");
    setForm({
      firstName: "",
      lastName: "",
      ssn: "",
      parentNumber: "",
      guardianName: "",
      birthDate: undefined,
      gender: "",
      branchId: "",
      sportIds: [],
      nationalityCategoryId: "",
      phoneNumber: "",
      email: "",
      nationality: "",
      street: "",
      city: "",
    });
    setSelectedFamily(null);

    setBranchesLoading(true);
    setSportsLoading(true);
    setNatLoading(true);
    setNationalitiesLoading(true);

    Promise.allSettled([
      getBranches(),
      getSports(),
      getNationalityCategories(),
      getNationalities(),
    ])
      .then(([brRes, spRes, natRes, nationalitiesRes]) => {
        if (brRes.status === "fulfilled" && brRes.value.isSuccess)
          setBranches(
            brRes.value.data.map((b) => ({
              value: String(b.id),
              label: b.name,
            })),
          );
        if (spRes.status === "fulfilled" && spRes.value.isSuccess)
          setSportsOptions(
            spRes.value.data.map((s) => ({
              value: String(s.id),
              label: s.name,
            })),
          );
        if (natRes.status === "fulfilled" && natRes.value.isSuccess)
          setNationalityCategories(
            natRes.value.data.map((n) => ({
              value: String(n.id),
              label: n.name,
            })),
          );
        if (
          nationalitiesRes.status === "fulfilled" &&
          nationalitiesRes.value.isSuccess
        )
          setNationalities(
            nationalitiesRes.value.data.map((n) => ({
              value: String(n.id),
              label: n.name,
            })),
          );
      })
      .finally(() => {
        setBranchesLoading(false);
        setSportsLoading(false);
        setNatLoading(false);
        setNationalitiesLoading(false);
      });
  }, [open]);

  // Helper: set a single form field and clear its error
  const set = (key: keyof typeof form) => (val: string) => {
    markDirty();
    setForm((f) => ({ ...f, [key]: val }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  // Helper: calculate age from birth date
  const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const fetchFamiliesById = useCallback(
    async (query: string): Promise<SearchableOption[]> => {
      const baseOption: SearchableOption = {
        value: "0",
        label: "Without family (new)",
      };
      const trimmed = query.trim();
      if (!trimmed) return [baseOption];
      if (!/^\d+$/.test(trimmed)) return [baseOption];
      if (trimmed === "0") return [baseOption];
      try {
        const res = await getFamilies(trimmed);
        if (!res.isSuccess || !Array.isArray(res.data)) return [baseOption];
        return [
          baseOption,
          ...res.data.map((f) => ({
            value: String(f.id),
            label: `Family Code: ${f.code}`,
          })),
        ];
      } catch {
        return [baseOption];
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors([]);
    setFieldErrors({});

    // Client-side Zod validation
    const parsed = traineeSchema.safeParse({
      ...form,
      birthDate: form.birthDate,
    });
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof TraineeFormValues;
        if (!fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const familyId = selectedFamily ? Number(selectedFamily.value) : 0;
      const genderValue =
        form.gender === "1" ? "male" : form.gender === "2" ? "female" : "";
      const nationalityMap: Record<string, string> = {
        "1": "american",
        "2": "canadian",
        "3": "british",
        "4": "australian",
        "5": "chinese",
        "6": "korean",
        "7": "japanese",
        "8": "indian",
        "9": "russian",
        "10": "southAfrican",
        "11": "egyptian",
        "12": "turkish",
        "13": "kuwaiti",
        "14": "saudi",
        "15": "emirati",
        "16": "moroccan",
        "17": "algerian",
        "18": "omanian",
        "19": "qatari",
        "20": "jordanian",
        "21": "syrian",
        "22": "lebanese",
        "23": "pakistani",
        "24": "filipino",
        "25": "palestinian",
        "26": "other",
      };

      const command: CreateTraineeCommand = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        ssn: form.ssn.trim(),
        parentNumber: form.parentNumber.trim() || null,
        guardianName: form.guardianName.trim() || null,
        birthDate: format(form.birthDate!, "yyyy-MM-dd"),
        gender: genderValue,
        branchId: parseInt(form.branchId),
        sportIds: form.sportIds.map((id) => parseInt(id)),
        familyId,
        nationalityCategoryId: parseInt(form.nationalityCategoryId),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        nationality: nationalityMap[form.nationality] || "",
        street: form.street.trim() || null,
        city: form.city.trim() || null,
      };

      const result = await createTrainee(command);
      if (!result.isSuccess) {
        throw new ApiError(result.statusCode, {
          message: result.message || "Failed to create trainee.",
        });
      }

      toast({
        title: "Trainee created successfully",
        action: (
          <ToastAction
            altText="View Details"
            onClick={() => navigate(`/trainees/${result.data.traineeId}`)}
          >
            View Details
          </ToastAction>
        ),
      });
      resetDirty();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) setApiErrors(err.getValidationErrors());
      else setApiErrors(["Failed to create trainee."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Trainee"
      description="Register a new trainee. Fields marked with * are required."
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Save"
      errors={apiErrors}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="firstName"
          label="First Name"
          value={form.firstName}
          onChange={set("firstName")}
          required
          maxLength={50}
          minLength={2}
          error={fieldErrors.firstName}
          placeholder="e.g. Ahmed"
        />
        <FormInput
          id="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={set("lastName")}
          required
          maxLength={50}
          minLength={2}
          error={fieldErrors.lastName}
          placeholder="e.g. Al-Mansouri"
        />
      </div>

      <FormInput
        id="ssn"
        label="SSN"
        value={form.ssn}
        onChange={set("ssn")}
        required
        maxLength={12}
        minLength={12}
        error={fieldErrors.ssn}
        placeholder="12-digit national ID (e.g. 304031512345)"
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="parentNumber"
          label="Parent Number"
          value={form.parentNumber}
          onChange={set("parentNumber")}
          maxLength={13}
          minLength={8}
          error={fieldErrors.parentNumber}
          placeholder="e.g. 0501234567"
        />
        <FormInput
          id="guardianName"
          label="Guardian Name"
          value={form.guardianName}
          onChange={set("guardianName")}
          maxLength={50}
          error={fieldErrors.guardianName}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormDatePicker
          id="birthDate"
          label="Birth Date"
          value={form.birthDate}
          onChange={(d) => {
            setForm((f) => ({ ...f, birthDate: d }));
            setFieldErrors((fe) => ({ ...fe, birthDate: undefined }));
            if (d) {
              const age = calculateAge(d);
              if (age < 18)
                setAgeWarning(
                  `Minor (${age} years old) — guardian information is required.`,
                );
              else setAgeWarning("");
            } else {
              setAgeWarning("");
            }
          }}
          required
          error={fieldErrors.birthDate}
        />
        <FormSelect
          id="gender"
          label="Gender"
          value={form.gender}
          onChange={(v) => {
            set("gender")(v);
          }}
          required
          options={[
            { value: "1", label: "Male" },
            { value: "2", label: "Female" },
          ]}
          error={fieldErrors.gender}
        />
      </div>

      {ageWarning && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{ageWarning}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="phoneNumber"
          label="Phone Number"
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
          required
          maxLength={12}
          minLength={8}
          error={fieldErrors.phoneNumber}
          placeholder="e.g. 0501234567"
        />
        <FormInput
          id="email"
          label="Email"
          value={form.email}
          onChange={set("email")}
          required
          maxLength={200}
          type="email"
          error={fieldErrors.email}
          placeholder="e.g. ahmed@example.com"
        />
      </div>

      <FormSelect
        id="nationality"
        label="Nationality"
        value={form.nationality}
        onChange={set("nationality")}
        required
        options={nationalities}
        loading={nationalitiesLoading}
        error={fieldErrors.nationality}
        placeholder="Select nationality"
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="street"
          label="Street"
          value={form.street}
          onChange={set("street")}
          maxLength={70}
          error={fieldErrors.street}
          placeholder="Optional"
        />
        <FormInput
          id="city"
          label="City"
          value={form.city}
          onChange={set("city")}
          maxLength={50}
          error={fieldErrors.city}
          placeholder="Optional"
        />
      </div>

      <FormSelect
        id="branchId"
        label="Branch"
        value={form.branchId}
        onChange={(v) => {
          set("branchId")(v);
        }}
        options={branches}
        required
        placeholder="Select branch"
        loading={branchesLoading}
        error={fieldErrors.branchId}
        emptyMessage="No branches available"
      />

      <div className="grid grid-cols-2 gap-3">
        <SearchableSelect
          id="familyId"
          label="Family"
          placeholder="Type family ID…"
          value={selectedFamily}
          onChange={setSelectedFamily}
          onSearch={fetchFamiliesById}
          debounceMs={300}
          hint="Leave blank to create without a family"
        />
        <FormSelect
          id="nationalityCategoryId"
          label="Nationality Category"
          value={form.nationalityCategoryId}
          onChange={(v) => {
            set("nationalityCategoryId")(v);
          }}
          options={nationalityCategories}
          required
          placeholder="Select category"
          loading={natLoading}
          error={fieldErrors.nationalityCategoryId}
        />
      </div>

      <FormMultiSelect
        id="sportIds"
        label="Sports"
        values={form.sportIds}
        onChange={(v) => {
          setForm((f) => ({ ...f, sportIds: v }));
          setFieldErrors((fe) => ({ ...fe, sportIds: undefined }));
        }}
        options={sportsOptions}
        placeholder={sportsLoading ? "Loading sports…" : "Select sports"}
        error={fieldErrors.sportIds}
      />
    </BaseModal>
  );
}
