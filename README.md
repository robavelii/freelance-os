# FreelanceOS

An all-in-one dashboard for freelancers to manage clients, track time, create invoices, and handle expenses.

## Features

- **Client Management**: Keep all your client information organized
- **Project Tracking**: Manage projects and associate them with clients
- **Time Tracking**: Track time with a simple timer, create manual entries, and group by date
- **Professional Invoices**: Create and send beautiful PDF invoices with auto-generated invoice numbers
- **Email Delivery**: Send invoices directly via email with PDF attachments
- **Online Payments**: Accept payments via Stripe integration
- **Public Invoice View**: Share invoices via secure links
- **Dashboard Analytics**: Visualize income, track outstanding payments, and spot trends
- **Expense Tracking**: Log expenses and export data for accounting
- **CSV Export**: Export invoices, expenses, and clients for tax purposes
- **Settings Management**: Configure business details, branding, and preferences
- **Dark Mode**: Full dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **Email**: Resend
- **PDF Generation**: @react-pdf/renderer
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Testing**: Vitest with fast-check for property-based testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication
- Stripe account for payments (optional)
- Resend account for email (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd freelance-os
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `RESEND_API_KEY`: Resend API key (optional)
- `RESEND_FROM_EMAIL`: Email address for sending invoices (optional)
- `STRIPE_SECRET_KEY`: Stripe secret key (optional)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (optional)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret (optional)
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., http://localhost:3000)

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npm run generate
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Install dependencies
- Run database migrations
- Build the application
- Deploy to production

### Environment Variables for Production

Make sure to set all required environment variables in your Vercel project settings:
- Database URL (use connection pooling for serverless)
- Clerk keys
- Resend API key (if using email features)
- Stripe keys (if using payment features)
- App URL (your production domain)

## Project Structure

```
freelance-os/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── actions/         # Server actions
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and services
│       ├── __tests__/   # Property-based tests
│       ├── email/       # Email templates and services
│       ├── export/      # CSV export utilities
│       ├── pdf/         # PDF generation
│       └── prisma/      # Prisma client
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
