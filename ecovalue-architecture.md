# EcoValue Architecture & Design System

## 1. Project Overview
EcoValue is a sustainable, AI-powered marketplace for second-hand items. It combines minimalist aesthetics with high-tech AI agents to provide a "zero-effort" selling experience.

## 2. Functional Requirements
### 2.1 Landing Page (`/`)
- Hero section with high-impact value proposition.
- Scrollable informational sections (How it works).
- Top-right CTA: Login/Sign-up.
### 2.2 Auth Pages (`/login`, `/register`)
- Minimalist, clean forms.
- Redirect to `/feed` upon success.
### 2.3 Main Feed (`/feed`)
- Responsive grid/masonry of items.
- Top navigation with search, profile, messages, and the "AI ile Hızlı Sat" button.
### 2.4 AI Sell Flow
- **Trigger**: Modal or dedicated page.
- **Input**: "Kamera ile Çek" (HTML5 Capture) or "Galeriden Seç" (Upload).
- **Processing**: Framer Motion loading states with AI feedback.
- **Result**: Display item info + "Quick Sell" vs "Market Price".
### 2.5 Messaging/Chat (`/messages`)
- Desktop: Two-column layout (Contact list | Chat window).
- Mobile: Stacked view (Chat list -> Chat window).
### 2.6 Profile (`/profile`)
- Update personal info.
- Red "Delete Account" button for data privacy.

## 3. Design System
### 3.1 Color Palette (Tailwind Config)
- **Background**: `#FAF9F6` (Cream)
- **Primary (Accent)**: `#E07A5F` (Terracotta Orange)
- **Secondary (Deep)**: `#3E2723` (Warm Brown)
- **Text**: `#3D405B` (Slate Navy/Grey)
- **Success**: `#81B29A` (Sage Green)

### 3.2 Typography
- **Heading**: Clean Sans-serif (Outfit/Inter), Bold, tracking-tight.
- **Body**: Inter, Regular, tracking-normal, leading-relaxed.

### 3.3 Components
- **Borders**: Minimalist, `border-border/50`.
- **Corners**: Large radius (`rounded-3xl` or `rounded-full`).
- **Whitespace**: Generous padding and margins (`p-8`, `gap-12`).

## 4. Frontend Route Structure
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Landing.jsx` | Hero & Features |
| `/login` | `Login.jsx` | User Authentication |
| `/register` | `Register.jsx` | User Registration |
| `/feed` | `Feed.jsx` | Main Marketplace |
| `/messages` | `Chat.jsx` | Negotiation & Messaging |
| `/profile` | `Profile.jsx` | User Settings |

## 5. Technology Stack
- **Framework**: Vite + React.
- **Styling**: Tailwind CSS + Shadcn UI.
- **State/Routing**: React Router DOM, Axios.
- **Animation**: Framer Motion.
- **Icons**: Lucide React.
