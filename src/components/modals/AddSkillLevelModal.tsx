import { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { FormInput } from "./FormInput";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { add } from "date-fns";
import { addSkillLevelToSport } from "@/services/sport.services";

interface AddSkillLevelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  sportId: string | number;
}

export function AddSkillLevelModal({
  open,
  onOpenChange,
  onSuccess,
  sportId,
}: AddSkillLevelModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!open) return;
    setErrors([]);
    setForm({ name: "", description: "" });
  }, [open]);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const result = await addSkillLevelToSport({
        sportId,
        name: form.name,
        description: form.description || undefined,
      });

      if (!result.isSuccess) {
        throw new ApiError(result.statusCode, {
          message: result.message || "Failed to add skill level.",
        });
      }

      toast({ title: "Skill level added successfully" });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.getValidationErrors());
      else setErrors(["Failed to add skill level."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Skill Level"
      description="Add a new skill level for this sport"
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
      submitLabel="Add Skill Level"
    >
      <FormInput
        id="name"
        label="Name"
        value={form.name}
        onChange={set("name")}
        required
        placeholder="e.g. Beginner, Advanced"
      />
      <FormInput
        id="description"
        label="Description (optional)"
        value={form.description}
        onChange={set("description")}
        placeholder="Short description of this level"
      />
    </BaseModal>
  );
}
