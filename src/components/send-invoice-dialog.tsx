"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendInvoice } from "@/actions/invoices";

interface SendInvoiceDialogProps {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string | null;
  disabled?: boolean;
}

/**
 * Dialog for sending an invoice via email with customizable subject/message
 */
export function SendInvoiceDialog({
  invoiceId,
  invoiceNumber,
  clientName,
  clientEmail,
  disabled,
}: SendInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!clientEmail) {
      toast.error("Client does not have an email address");
      return;
    }

    setLoading(true);
    try {
      const result = await sendInvoice(invoiceId, {
        subject: subject || undefined,
        message: message || undefined,
      });

      if (result.success) {
        toast.success("Invoice sent successfully");
        setOpen(false);
        setSubject("");
        setMessage("");
      } else {
        toast.error(result.message || "Failed to send invoice");
      }
    } catch (error) {
      toast.error("An error occurred while sending the invoice");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || !clientEmail;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          title={!clientEmail ? "Client has no email address" : "Send invoice via email"}
        >
          <Send className="h-4 w-4 mr-1" />
          Send
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Invoice</DialogTitle>
          <DialogDescription>
            Send invoice {invoiceNumber} to {clientName}
            {clientEmail && <span className="block text-xs mt-1">({clientEmail})</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              placeholder={`Invoice ${invoiceNumber}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use default subject
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message (optional)</Label>
            <textarea
              id="message"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add a personal message to include in the email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Sending..." : "Send Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
