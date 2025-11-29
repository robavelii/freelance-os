"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSettings, updateSettings } from "@/actions/settings";

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "INR", label: "INR - Indian Rupee" },
];

const settingsSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  hourlyRate: z.string().optional(),
  invoicePrefix: z.string().min(1, "Invoice prefix is required").max(10, "Prefix too long"),
  paymentTermsDays: z.string().min(1, "Payment terms required"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: "",
      businessAddress: "",
      currency: "USD",
      hourlyRate: "",
      invoicePrefix: "INV",
      paymentTermsDays: "30",
    },
  });

  const currency = watch("currency");


  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSettings();
        reset({
          businessName: settings.businessName || "",
          businessAddress: settings.businessAddress || "",
          currency: settings.currency,
          hourlyRate: settings.hourlyRate?.toString() || "",
          invoicePrefix: settings.invoicePrefix,
          paymentTermsDays: settings.paymentTermsDays.toString(),
        });
        setLogoUrl(settings.logoUrl);
        if (settings.logoUrl) {
          setLogoPreview(settings.logoUrl);
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be less than 2MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      // For logo, we store the data URL directly for simplicity
      // In production, you'd upload to a storage service
      let finalLogoUrl = logoUrl;
      if (logoFile && logoPreview) {
        finalLogoUrl = logoPreview;
      } else if (!logoPreview) {
        finalLogoUrl = null;
      }

      const result = await updateSettings({
        businessName: data.businessName || null,
        businessAddress: data.businessAddress || null,
        logoUrl: finalLogoUrl,
        currency: data.currency,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        invoicePrefix: data.invoicePrefix,
        paymentTermsDays: parseInt(data.paymentTermsDays, 10),
      });

      if (result.success) {
        toast.success("Settings saved successfully");
        setLogoUrl(finalLogoUrl);
        setLogoFile(null);
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business details and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              This information will appear on your invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                {...register("businessName")}
                placeholder="Your Business Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input
                id="businessAddress"
                {...register("businessAddress")}
                placeholder="123 Main St, City, Country"
              />
            </div>
            <div className="grid gap-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                    <Upload className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 2MB. PNG, JPG, or SVG.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>
              Configure defaults for new invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
              <Input
                id="invoicePrefix"
                {...register("invoicePrefix")}
                placeholder="INV"
                maxLength={10}
              />
              {errors.invoicePrefix && (
                <span className="text-red-500 text-sm">
                  {errors.invoicePrefix.message}
                </span>
              )}
              <p className="text-xs text-muted-foreground">
                Invoice numbers will follow the pattern: PREFIX-YEAR-0001
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={currency}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <span className="text-red-500 text-sm">
                  {errors.currency.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
              <Input
                id="paymentTermsDays"
                type="number"
                min="1"
                max="365"
                {...register("paymentTermsDays")}
                placeholder="30"
              />
              {errors.paymentTermsDays && (
                <span className="text-red-500 text-sm">
                  {errors.paymentTermsDays.message}
                </span>
              )}
              <p className="text-xs text-muted-foreground">
                Number of days until invoice is due
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Defaults</CardTitle>
            <CardDescription>
              Default rates for new projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="hourlyRate">Default Hourly Rate</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                {...register("hourlyRate")}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                This rate will be used as default for new projects
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
