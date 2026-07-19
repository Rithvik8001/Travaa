This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database workflow

The committed files in `drizzle/` are the database history. After changing either schema file,
generate and review a named migration, then apply it:

```bash
bun run db:generate -- --name describe_the_change
bun run db:check
bun run db:migrate
```

For the one-time adoption of the baseline by a populated development database, configure a clean
dedicated `TEST_DATABASE_URL`, run `bun run db:baseline:verify`, then run:

```bash
CONFIRM_BASELINE_ADOPTION=I_HAVE_VERIFIED_SCHEMA_PARITY bun run db:baseline:adopt
```

The adoption command compares the populated schema with a fresh baseline and records migration
history only; it does not replay baseline DDL.

## Tests

Unit tests do not need a database. Integration tests destructively reset the dedicated Neon database
in `TEST_DATABASE_URL`; its database name must end in `_test` and it must never be shared with
development or production.

```bash
bun run test
bun run test:integration
bun run test:all
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
