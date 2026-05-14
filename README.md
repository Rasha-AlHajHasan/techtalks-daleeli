<div align="center">

# دليلي · Daleeli

**Your guided path through syndicate registration and labor rights in Lebanon.**

[![Next.js](https://img.shields.io/badge/Next.js-React-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Status](https://img.shields.io/badge/Status-MVP%20In%20Progress-blue?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

</div>

---

## Overview

Daleeli (دليلي — Arabic for _"my guide"_) is a structured web platform that simplifies syndicate registration, delivers relevant labor news, and helps professionals understand their rights when working abroad.

Navigating syndicate requirements in Lebanon often means dealing with unclear processes, scattered paperwork, and little to no guidance. Daleeli centralizes all of that into a single, step-by-step experience — from choosing a syndicate to reviewing a foreign work contract.

---

## Key Features

### 🏢 Syndicate Registration Guidance

Users select a syndicate and immediately see everything they need: required documents, eligibility conditions, applicable fees, and important notes. The guided flow ensures no step is missed before submitting a registration request.

### 👤 User Account System

A simple onboarding process collects the user's full name, syndicate ID, phone number, and email. Upon registration, the user is linked to their chosen syndicate — creating a traceable, persistent record in the system. Users are automatically redirected to their profile page after sign-up.

### 📰 News & Updates

Users can subscribe to syndicate-specific news. Content is sourced from public government and labor authority websites through scheduled syncing or scraping, then organized and linked to the relevant syndicate within Daleeli.

### 📄 Services _(Premium)_

Registered users can upload job contracts for positions outside Lebanon. The platform analyzes the contract and surfaces key information: legal implications, rights and obligations, and country-specific labor considerations. Access to this feature requires a one-time **$2 subscription**.

### 🛠️ Admin Dashboard

A full-featured admin interface gives administrators complete control over the platform — syndicates, documents, users, registration requests, news, subscriptions, contracts, and system configuration.

---

## User Roles

| Role                | Access                                                             |
| ------------------- | ------------------------------------------------------------------ |
| **Guest**           | Browse syndicates and public information                           |
| **Registered User** | Submit registration requests, subscribe to news                    |
| **Subscribed User** | Access services — contract upload & analysis (requires $2 payment) |
| **Admin**           | Full platform management                                           |

---

## Platform Modules

```
Daleeli
├── Syndicate Registration     → Guided selection → document checklist → registration request
├── User Accounts              → Onboarding → redirect to /profile → syndicate linkage
├── Profile                    → User info → registration status → subscription status
├── News & Updates             → Syndicate-filtered feed → external source sync
├── Services                   → PDF upload → contract analysis → stored results (premium)
└── Admin Dashboard            → Full CRUD across all entities
```

---

## Business Rules

- Any visitor may browse syndicates and their requirements without an account.
- Account creation is required to submit a registration request.
- News subscription is opt-in and available to all registered users.
- Services (contract upload & analysis) is a **paid feature** — a $2 subscription must be active before upload.
- Each syndicate maintains its own document checklist and registration conditions.
- News is sourced exclusively from public-facing government or labor authority pages; no backend API access is assumed.
- All uploaded contracts and their analysis results are stored and accessible to both the user and admin.

---

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Frontend  | Next.js / React                                     |
| Styling   | TBD                                                 |
| Backend   | TBD                                                 |
| Database  | TBD                                                 |
| News Sync | Web scraping / scheduled import from public sources |
| Payments  | TBD (Stripe or equivalent)                          |

---

## Project Status

Daleeli is currently in **active MVP development** as part of an internship program at [TechTalks](https://techtalkslb.com/), built by a team of five developers.

**MVP scope includes:**

- Core syndicate registration flow
- User account system with syndicate linkage
- News subscription and display
- Services page — contract upload with subscription gate
- Basic admin dashboard

**Post-MVP roadmap:**

- AI-assisted contract analysis
- Expansion to additional countries and syndicates
- Integration with official government systems (where APIs become available)
- Mobile application (iOS / Android)
- Multi-language support (Arabic / English)

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/daleeli.git
cd daleeli

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Environment variables for database connection, payment gateway, and external sync configuration are required. See `.env.example` for the full list.

---

## Contributing

This project is currently developed by the Daleeli internship team at TechTalks. Contribution guidelines will be published once the MVP is complete.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">

_Daleeli — from confusion to clarity, one step at a time._

</div>
