# ScanConnect

A QR code sticker contact management platform that lets you receive notifications when someone scans your sticker and sends a message — delivered via SMS, WhatsApp, Email, or browser push.

Built with **Next.js 16**, **Prisma**, **SQLite**, and **Tailwind CSS v4**.

![Stack](https://img.shields.io/badge/Next.js-16-black)
![Stack](https://img.shields.io/badge/Prisma-7-2D3748)
![Stack](https://img.shields.io/badge/SQLite-003B57)
![Stack](https://img.shields.io/badge/Tailwind-4-06B6D4)

---

## Features

### 📋 Dashboard
- Overview stats — total stickers, active/unassigned counts, total contact requests
- **Weekly Activity Chart** — 7-day bar chart tracking daily request volume with CSV export
- **Today's Activity Card** — per-channel delivery breakdown (SMS, WhatsApp, Email) with progress bars
- **Recent Activity** — latest 5 requests with delivery badges and quick links
- **Stickers List** — all stickers with status, contact counts, and navigation

### 🔔 Notifications
- **Real-time Timeline** — visual timeline with colored dots, delivery badges, and relative timestamps
- **Search & Filter** — search by caller name/message, filter by delivery channel, sort by newest/oldest
- **Unread Tracking** — auto-detected unread requests with highlight and count badge
- **Mark All as Read** — one-click dismiss of all unread notifications
- **Quick Reply** — inline reply form on each request, saves reply with timestamp
- **Notification Settings** — dedicated page at `/dashboard/notifications/settings` with:
  - Per-channel enable/disable toggles (SMS, WhatsApp, Email, Push)
  - Configurable polling interval (10s – 5min)
  - Sound on/off with sound selection (Chime, Bell, Silent) with preview playback
  - Browser notifications toggle (requires permission)
  - Daily digest email toggle

### 📡 Notification Channels
| Channel | Provider | Status |
|---------|----------|--------|
| **SMS** | Fast2SMS | Real-time SMS alerts |
| **WhatsApp** | Meta Cloud API | Template-based WhatsApp messages |
| **Email** | Resend | Email notifications + daily digest |
| **Browser Push** | Web Push API | Desktop push notifications via Service Worker |

### 🌙 Dark Mode
- Full dark mode across all dashboard pages
- Persistent — saved to `localStorage`
- Respects system preference on first visit
- Toggle with sound feedback in the dashboard header

### 🔊 Live Notifications
- Web Audio API chime/bell sounds
- Browser Notification API for desktop alerts
- Configurable polling interval
- Works across all dashboard pages

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **pnpm** (npm ships with Node.js)

### 1. Clone & Install

```bash
git clone https://github.com/AVessentials/scanconnect.git
cd scanconnect
npm install
```

### 2. Set Up the Database

The project uses SQLite with Prisma. No external database server needed.

```bash
npx prisma db push
```

This creates a `dev.db` SQLite file and generates the Prisma client.

### 3. Configure Environment

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

**Required variables:**

| Variable | Description |
|----------|-------------|
| `ADMIN_OWNER_ID` | UUID for the admin owner (auto-generated) |

**Optional — without these, channels run in dev mode (logs to console):**

| Variable | Description | Provider |
|----------|-------------|----------|
| `FAST2SMS_API_KEY` | SMS API key | [Fast2SMS](https://www.fast2sms.com/) |
| `WHATSAPP_TOKEN` | WhatsApp access token | [Meta Developers](https://developers.facebook.com/docs/whatsapp/cloud-api/) |
| `WHATSAPP_PHONE_ID` | WhatsApp phone number ID | Meta Business Suite |
| `WHATSAPP_TEMPLATE_NAME` | Message template name | Default: `scanconnect_notification` |
| `RESEND_API_KEY` | Email API key | [Resend](https://resend.com/) |
| `EMAIL_FROM` | Sender email address | e.g. `ScanConnect <noreply@yourdomain.com>` |
| `VAPID_PUBLIC_KEY` | Web Push public key | Generate with `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Web Push private key | Same command as above |
| `VAPID_SUBJECT` | Web Push subject | e.g. `mailto:admin@yourdomain.com` |

### 4. Create an Owner Profile

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:3000/api/setup** to create your admin owner profile (name, phone, email). This sets the `ADMIN_OWNER_ID` in your database.

### 5. Start Using

Visit **http://localhost:3000/dashboard** to manage your stickers and notifications.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint project |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in Vercel dashboard
4. Deploy — SQLite will work with Vercel's serverless functions

### Docker

Build a container:

```bash
docker build -t scanconnect .
docker run -p 3000:3000 scanconnect
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite via Prisma
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + Testing Library
- **Notifications:** Web Push API, Resend, Fast2SMS, Meta Cloud API
- **Audio:** Web Audio API
- **QR Codes:** qrcode

---

## Project Structure

```
scanconnect/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes (setup, digest, notifications)
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── layout.tsx     # Dashboard layout with nav
│   │   │   ├── notifications/ # Notification history + settings
│   │   │   ├── settings/      # Channel configuration
│   │   │   └── stickers/      # Sticker management
│   │   ├── scan/              # Public scan page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles with dark mode
│   ├── components/            # Shared components
│   │   ├── DarkModeProvider   # Dark mode context (client)
│   │   ├── DarkModeToggle     # Dark mode toggle button
│   │   ├── SoundPreviewButton # Sound preview play button
│   │   └── LiveNotificationIndicator # Live polling indicator
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # Shared utilities (timeAgo, etc.)
│   │   └── sounds.ts          # Web Audio API sound functions
│   └── test/
│       └── setup.ts           # Test environment setup
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## License

MIT
