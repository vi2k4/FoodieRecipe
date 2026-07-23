import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthField({ label, id, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string }) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input id={id} className="h-10" aria-invalid={Boolean(error)} {...props} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
