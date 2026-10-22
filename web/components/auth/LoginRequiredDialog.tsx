"use client";

import { usePathname, useRouter } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type LoginRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
};

export function LoginRequiredDialog({ open, onOpenChange, action = "sử dụng tính năng này" }: LoginRequiredDialogProps) {
  const router = useRouter();
  const pathname = usePathname();

  const goToLogin = () => {
    onOpenChange(false);
    router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border-stone-200 bg-white p-0 shadow-[0_24px_80px_-24px_rgba(28,25,23,0.35)] sm:max-w-md">
        <DialogHeader className="items-center bg-white px-7 pb-7 pt-9 text-center sm:px-10">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm shadow-orange-100">
            <LockKeyhole className="size-8" strokeWidth={2.2} />
          </div>
          <DialogTitle className="mt-5 text-2xl font-extrabold tracking-tight text-stone-900">
            Đăng nhập để tiếp tục
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
            Đăng nhập để <strong className="font-semibold text-orange-600">{action}</strong> và tiếp tục trải nghiệm.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-stone-200 bg-stone-50 p-5 sm:flex-row sm:justify-end sm:px-7">
          <Button type="button" variant="outline" className="h-11 border-stone-200 bg-white px-5 text-stone-600 hover:bg-stone-100 sm:w-auto" onClick={() => onOpenChange(false)}>
            Để sau
          </Button>
          <Button type="button" className="h-11 bg-orange-500 px-5 font-semibold text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600 sm:w-auto" onClick={goToLogin}>
            <LogIn className="mr-2 size-4" />
            Đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
