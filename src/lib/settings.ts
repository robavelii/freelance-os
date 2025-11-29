import { prisma } from "./prisma";

export interface UserSettings {
  businessName: string | null;
  businessAddress: string | null;
  logoUrl: string | null;
  currency: string;
  hourlyRate: number | null;
  invoicePrefix: string;
  paymentTermsDays: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  businessName: null,
  businessAddress: null,
  logoUrl: null,
  currency: "USD",
  hourlyRate: null,
  invoicePrefix: "INV",
  paymentTermsDays: 30,
};

/**
 * Serializes user settings to JSON string
 */
export function serializeSettings(settings: UserSettings): string {
  return JSON.stringify(settings);
}

/**
 * Deserializes JSON string to user settings with validation
 * Returns default values for missing or invalid fields
 */
export function deserializeSettings(json: string): UserSettings {
  try {
    const parsed = JSON.parse(json);

    return {
      businessName:
        typeof parsed.businessName === "string" ? parsed.businessName : null,
      businessAddress:
        typeof parsed.businessAddress === "string"
          ? parsed.businessAddress
          : null,
      logoUrl: typeof parsed.logoUrl === "string" ? parsed.logoUrl : null,
      currency:
        typeof parsed.currency === "string"
          ? parsed.currency
          : DEFAULT_SETTINGS.currency,
      hourlyRate:
        typeof parsed.hourlyRate === "number" ? parsed.hourlyRate : null,
      invoicePrefix:
        typeof parsed.invoicePrefix === "string"
          ? parsed.invoicePrefix
          : DEFAULT_SETTINGS.invoicePrefix,
      paymentTermsDays:
        typeof parsed.paymentTermsDays === "number" &&
        parsed.paymentTermsDays > 0
          ? parsed.paymentTermsDays
          : DEFAULT_SETTINGS.paymentTermsDays,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Gets user settings from the database
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      businessName: true,
      businessAddress: true,
      logoUrl: true,
      currency: true,
      hourlyRate: true,
      invoicePrefix: true,
      paymentTermsDays: true,
    },
  });

  if (!user) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    businessName: user.businessName,
    businessAddress: user.businessAddress,
    logoUrl: user.logoUrl,
    currency: user.currency,
    hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
    invoicePrefix: user.invoicePrefix,
    paymentTermsDays: user.paymentTermsDays,
  };
}

/**
 * Updates user settings in the database
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const updateData: Record<string, unknown> = {};

  if (settings.businessName !== undefined) {
    updateData.businessName = settings.businessName;
  }
  if (settings.businessAddress !== undefined) {
    updateData.businessAddress = settings.businessAddress;
  }
  if (settings.logoUrl !== undefined) {
    updateData.logoUrl = settings.logoUrl;
  }
  if (settings.currency !== undefined) {
    updateData.currency = settings.currency;
  }
  if (settings.hourlyRate !== undefined) {
    updateData.hourlyRate = settings.hourlyRate;
  }
  if (settings.invoicePrefix !== undefined) {
    updateData.invoicePrefix = settings.invoicePrefix;
  }
  if (settings.paymentTermsDays !== undefined) {
    updateData.paymentTermsDays = settings.paymentTermsDays;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      businessName: true,
      businessAddress: true,
      logoUrl: true,
      currency: true,
      hourlyRate: true,
      invoicePrefix: true,
      paymentTermsDays: true,
    },
  });

  return {
    businessName: user.businessName,
    businessAddress: user.businessAddress,
    logoUrl: user.logoUrl,
    currency: user.currency,
    hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
    invoicePrefix: user.invoicePrefix,
    paymentTermsDays: user.paymentTermsDays,
  };
}

/**
 * Calculates due date based on issue date and payment terms
 */
export function calculateDueDate(
  issueDate: Date,
  paymentTermsDays: number
): Date {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate;
}
