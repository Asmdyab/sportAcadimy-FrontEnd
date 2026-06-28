import { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { FormInput } from "./FormInput";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useFormDirty } from "@/hooks/useFormDirty";
import { BranchEditData, updateBranch } from "@/services/branch.services";

const branchEditSchema = z.object({
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
    .max(30, "Phone too long")
    .optional()
    .or(z.literal("")),
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

interface BranchEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branch: BranchEditData | null;
}

export function BranchEditModal({
  open,
  onOpenChange,
  onSuccess,
  branch,
}: BranchEditModalProps) {
  const { toast } = useToast();
  const { isDirty, markDirty, resetDirty } = useFormDirty();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<BranchEditData | null>(null);

  useEffect(() => {
    if (!open || !branch) return;
    resetDirty();
    setErrors([]);
    setFieldErrors({});
    setForm({
      id: branch.id,
      name: branch.name ?? "",
      city: branch.city ?? "",
      country: branch.country ?? "",
      phoneNumber: branch.phoneNumber ?? "",
      email: branch.email ?? "",
      coX: branch.coX != null ? String(branch.coX) : "",
      coY: branch.coY != null ? String(branch.coY) : "",
    });
  }, [open, branch]);

  const set = (key: keyof typeof form) => (val: string) => {
    markDirty();
    setForm((f) => ({ ...f, [key]: val }));
    setFieldErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch) return;
    setErrors([]);
    setFieldErrors({});

    const parsed = branchEditSchema.safeParse(form);
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
      const result = await updateBranch(form);

      if (!result.isSuccess) {
        throw new ApiError(result.statusCode, {
          message: result.message || "Failed to update branch.",
        });
      }

      toast({ title: "Branch updated successfully" });
      resetDirty();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.getValidationErrors());
      else setErrors(["Failed to update branch."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Branch"
      description="Update branch details"
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
      submitLabel="Save Changes"
      isDirty={isDirty}
    >
      <FormInput
        id="name"
        label="Name"
        value={form.name}
        onChange={set("name")}
        required
        error={fieldErrors.name}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="city"
          label="City"
          value={form.city}
          onChange={set("city")}
          required
          error={fieldErrors.city}
        />
        <FormInput
          id="country"
          label="Country"
          value={form.country}
          onChange={set("country")}
          required
          error={fieldErrors.country}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="phoneNumber"
          label="Phone Number"
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
          error={fieldErrors.phoneNumber}
        />
        <FormInput
          id="email"
          label="Email"
          value={form.email}
          onChange={set("email")}
          type="email"
          error={fieldErrors.email}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="coX"
          label="CoX (Longitude)"
          value={form.coX}
          onChange={set("coX")}
          type="number"
          error={fieldErrors.coX}
        />
        <FormInput
          id="coY"
          label="CoY (Latitude)"
          value={form.coY}
          onChange={set("coY")}
          type="number"
          error={fieldErrors.coY}
        />
      </div>
    </BaseModal>
  );
}
