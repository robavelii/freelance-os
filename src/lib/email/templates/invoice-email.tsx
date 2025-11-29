import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface InvoiceEmailProps {
  invoiceNumber: string;
  clientName: string;
  businessName: string;
  totalAmount: string;
  currency: string;
  dueDate: string;
  viewUrl: string;
  paymentUrl?: string;
  customMessage?: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }>;
}

/**
 * Invoice email template using React Email
 */
export function InvoiceEmail({
  invoiceNumber,
  clientName,
  businessName,
  totalAmount,
  currency,
  dueDate,
  viewUrl,
  paymentUrl,
  customMessage,
  items,
}: InvoiceEmailProps) {
  const previewText = `Invoice ${invoiceNumber} from ${businessName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Invoice {invoiceNumber}</Heading>
          
          <Text style={paragraph}>Hi {clientName},</Text>
          
          {customMessage ? (
            <Text style={paragraph}>{customMessage}</Text>
          ) : (
            <Text style={paragraph}>
              Please find attached your invoice from {businessName}.
            </Text>
          )}

          <Section style={summarySection}>
            <Text style={summaryTitle}>Invoice Summary</Text>
            <Hr style={hr} />
            
            {items.map((item, index) => (
              <div key={index} style={itemRow}>
                <Text style={itemDescription}>{item.description}</Text>
                <Text style={itemDetails}>
                  {item.quantity} × {currency} {item.price.toFixed(2)} = {currency} {item.amount.toFixed(2)}
                </Text>
              </div>
            ))}
            
            <Hr style={hr} />
            <div style={totalRow}>
              <Text style={totalLabel}>Total Amount:</Text>
              <Text style={totalValue}>{currency} {totalAmount}</Text>
            </div>
            <Text style={dueDateText}>Due Date: {dueDate}</Text>
          </Section>

          <Section style={buttonSection}>
            <Link href={viewUrl} style={button}>
              View Invoice
            </Link>
            {paymentUrl && (
              <Link href={paymentUrl} style={payButton}>
                Pay Now
              </Link>
            )}
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            This invoice was sent by {businessName}. If you have any questions,
            please reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  padding: "0 40px",
};

const summarySection = {
  padding: "20px 40px",
  backgroundColor: "#f9fafb",
  margin: "20px 40px",
  borderRadius: "8px",
};

const summaryTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#484848",
  margin: "0 0 10px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "15px 0",
};

const itemRow = {
  marginBottom: "10px",
};

const itemDescription = {
  fontSize: "14px",
  color: "#3c4149",
  margin: "0",
  fontWeight: "500",
};

const itemDetails = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "2px 0 0",
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#484848",
  margin: "0",
};

const totalValue = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#10b981",
  margin: "0",
};

const dueDateText = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "10px 0 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 8px",
};

const payButton = {
  backgroundColor: "#10b981",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 8px",
};

const footer = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#9ca3af",
  padding: "0 40px",
  textAlign: "center" as const,
};

export default InvoiceEmail;
