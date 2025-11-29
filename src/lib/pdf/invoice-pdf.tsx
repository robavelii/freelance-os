import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Decimal type from Prisma - using number | string for compatibility
type DecimalValue = number | string | { toString(): string };

// Types for invoice data
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: DecimalValue;
  price: DecimalValue;
  amount: DecimalValue;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  address: string | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: DecimalValue;
  currency: string;
  items: InvoiceItem[];
  client: Client;
}

export interface UserInfo {
  businessName: string | null;
  businessAddress: string | null;
  logoUrl: string | null;
  email: string;
}

export interface InvoicePDFProps {
  invoice: Invoice;
  user: UserInfo;
}

// Styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 50,
  },
  logo: {
    maxWidth: 100,
    maxHeight: 50,
    objectFit: "contain",
  },
  businessInfo: {
    textAlign: "right",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  businessAddress: {
    color: "#666666",
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  detailsColumn: {
    width: "45%",
  },
  label: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 11,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  descriptionCol: {
    width: "50%",
  },
  quantityCol: {
    width: "15%",
    textAlign: "right",
  },
  priceCol: {
    width: "17.5%",
    textAlign: "right",
  },
  amountCol: {
    width: "17.5%",
    textAlign: "right",
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  cellText: {
    fontSize: 10,
  },
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    width: 200,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    paddingRight: 10,
    color: "#666666",
  },
  totalValue: {
    width: 100,
    textAlign: "right",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#333333",
    width: 200,
  },
  grandTotalLabel: {
    width: 100,
    textAlign: "right",
    paddingRight: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    width: 100,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  statusBadge: {
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

// Currency formatting helper
const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CHF: "CHF",
  CNY: "¥",
  INR: "₹",
  MXN: "MX$",
  BRL: "R$",
};

export function formatCurrency(amount: DecimalValue, currency: string): string {
  const numAmount = typeof amount === "number" ? amount : Number(amount);
  const symbol = currencySymbols[currency] || currency + " ";
  
  // Format with 2 decimal places and thousands separator
  const formatted = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${symbol}${formatted}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Status colors for badge
const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#9ca3af", text: "#ffffff" },
  SENT: { bg: "#3b82f6", text: "#ffffff" },
  VIEWED: { bg: "#eab308", text: "#000000" },
  PAID: { bg: "#22c55e", text: "#ffffff" },
  OVERDUE: { bg: "#ef4444", text: "#ffffff" },
  VOID: { bg: "#6b7280", text: "#ffffff" },
};


/**
 * PDF Invoice Template Component
 * Generates a professional PDF invoice document using @react-pdf/renderer
 * 
 */
export function InvoicePDF({ invoice, user }: InvoicePDFProps) {
  const statusColor = statusColors[invoice.status] || statusColors.DRAFT;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo and Business Info */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {user.logoUrl ? (
              <Image src={user.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.businessName}>
                {user.businessName || "Your Business"}
              </Text>
            )}
          </View>
          <View style={styles.businessInfo}>
            {user.logoUrl && user.businessName && (
              <Text style={styles.businessName}>{user.businessName}</Text>
            )}
            {user.businessAddress && (
              <Text style={styles.businessAddress}>
                {user.businessAddress.split("\n").map((line, i) => (
                  <Text key={i}>
                    {line}
                    {"\n"}
                  </Text>
                ))}
              </Text>
            )}
            <Text style={styles.businessAddress}>{user.email}</Text>
          </View>
        </View>

        {/* Invoice Title and Status */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor.bg, color: statusColor.text },
            ]}
          >
            <Text style={{ color: statusColor.text }}>{invoice.status}</Text>
          </View>
        </View>

        {/* Invoice Details and Client Info */}
        <View style={styles.invoiceDetails}>
          <View style={styles.detailsColumn}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.clientName}>{invoice.client.name}</Text>
            {invoice.client.company && (
              <Text style={styles.value}>{invoice.client.company}</Text>
            )}
            {invoice.client.address && (
              <Text style={styles.value}>{invoice.client.address}</Text>
            )}
            {invoice.client.email && (
              <Text style={styles.value}>{invoice.client.email}</Text>
            )}
          </View>
          <View style={styles.detailsColumn}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{invoice.invoiceNumber}</Text>

            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>

            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.descriptionCol]}>
              Description
            </Text>
            <Text style={[styles.headerText, styles.quantityCol]}>Qty</Text>
            <Text style={[styles.headerText, styles.priceCol]}>Price</Text>
            <Text style={[styles.headerText, styles.amountCol]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.descriptionCol]}>
                {item.description}
              </Text>
              <Text style={[styles.cellText, styles.quantityCol]}>
                {Number(item.quantity)}
              </Text>
              <Text style={[styles.cellText, styles.priceCol]}>
                {formatCurrency(item.price, invoice.currency)}
              </Text>
              <Text style={[styles.cellText, styles.amountCol]}>
                {formatCurrency(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          {user.businessName && (
            <Text style={{ marginTop: 4 }}>{user.businessName}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
