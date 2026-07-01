import { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { FormInput } from "./FormInput";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useFormDirty } from "@/hooks/useFormDirty";
import { create } from "domain";
import { BranchCreateData, createBranch } from "@/services/branch.services";

const branchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required")
    .max(100, "Name too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City too long"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country too long"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(30, "Phone too long"),
  email: z
    .union([z.string().trim().email("Invalid email"), z.literal("")])
    .optional(),
  coX: z.string().refine((v) => v === "" || !isNaN(Number(v)), {
    message: "Must be a valid number",
  }),
  coY: z.string().refine((v) => v === "" || !isNaN(Number(v)), {
    message: "Must be a valid number",
  }),
});

interface BranchFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const emptyForm: BranchCreateData = {
  name: "",
  city: "",
  country: "",
  phoneNumber: "",
  email: "",
  coX: "",
  coY: "",
};
export function BranchFormModal({
  open,
  onOpenChange,
  onSuccess,
}: BranchFormModalProps) {
  const { toast } = useToast();
  const { isDirty, markDirty, resetDirty } = useFormDirty();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<BranchCreateData>(emptyForm);

  useEffect(() => {
    if (!open) return;
    resetDirty();
    setErrors([]);
    setFieldErrors({});
    setForm(emptyForm);
  }, [open]);

  const set = (key: keyof typeof form) => (val: string) => {
    markDirty();
    setForm((f) => ({ ...f, [key]: val }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setFieldErrors({});

    const parsed = branchSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      return;
    }

    setLoading(true);
    try {
      await createBranch(form);
      toast({ title: "Branch created successfully" });
      resetDirty();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.getValidationErrors());
      else setErrors(["Failed to create branch."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Branch"
      description="Add a new academy branch"
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
      isDirty={isDirty}
    >
      <FormInput
        id="name"
        label="Name"
        value={form?.name}
        onChange={set("name")}
        required
        error={fieldErrors.name}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="city"
          label="City"
          value={form?.city}
          onChange={set("city")}
          required
          error={fieldErrors.city}
        />
        <FormInput
          id="country"
          label="Country"
          value={form?.country}
          onChange={set("country")}
          required
          error={fieldErrors.country}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="phoneNumber"
          label="Phone Number"
          value={form?.phoneNumber}
          onChange={set("phoneNumber")}
          required
          error={fieldErrors.phoneNumber}
        />
        <FormInput
          id="email"
          label="Email"
          value={form?.email}
          onChange={set("email")}
          type="email"
          error={fieldErrors.email}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="coX"
          label="CoX (Longitude)"
          value={form?.coX}
          onChange={set("coX")}
          type="number"
          error={fieldErrors.coX}
        />
        <FormInput
          id="coY"
          label="CoY (Latitude)"
          value={form?.coY}
          onChange={set("coY")}
          type="number"
          error={fieldErrors.coY}
        />
      </div>
    </BaseModal>
  );
}
