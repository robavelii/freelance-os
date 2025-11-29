"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { updateInvoiceStatus } from "@/actions/invoices";
import { toast } from "sonner";

interface MarkPaidButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  disabled?: boolean;
}

/**
 * Mark as Paid Button Component
 * 
 * Allows users to manually mark an invoice as paid.
 */
export function MarkPaidButton({ invoiceId, invoiceNumber, disabled }: MarkPaidButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkPaid = async () => {
    setIsLoading(true);

    try {
      // Update status to PAID with "manual" payment method
      const result = await updateInvoiceStatus(invoiceId, "PAID", "manual");

      if (result.success) {
        toast.success(`Invoice ${invoiceNumber} marked as paid`);
      } else {
        toast.error(result.message || "Failed to mark invoice as paid");
      }
    } catch (error) {
      toast.error("An error occurred while marking the invoice as paid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkPaid}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark Paid
        </>
      )}
    </Button>
  );
}
