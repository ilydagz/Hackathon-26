# EcoValue Marketplace - Project Requirements

## 1. Overview
EcoValue Marketplace is an AI-powered, mobile-first web application designed to make selling second-hand items "zero-effort." By leveraging AI agents, the app automates the listing process, from image recognition and description generation to market price estimation.

## 2. Functional Requirements
### 2.1 User Flow: The "Magic" Listing
1. **Camera Trigger**: Users click a prominent "AI Hızlı Sat" button.
2. **Native Camera Access**: Opens the mobile camera (or file picker on desktop) with `capture="environment"`.
3. **AI Analysis**: 
    - Uploads the image to the FastAPI backend.
    - Simulates/performs AI analysis (title, description, price points).
    - UI shows a "processing" state with dynamic, engaging feedback.
4. **AI-Assisted Form**:
    - Displays AI-generated title and description.
    - Provides two price options: "Quick Sell" (Low) and "Ideal Price" (Market value).
5. **Publishing**: User selects a price and clicks "Publish." The item is added to the marketplace database and appears on the feed instantly.

### 2.2 Marketplace Feed
- Display a feed of listings with high-quality images and clear pricing.
- Mobile-first layout (constrained width on desktop).
- Real-time updates (via state management after publishing).

## 3. Non-Functional Requirements
- **Mobile-First Design**: Optimized for vertical screens, touch interactions, and PWA feel.
- **Premium Aesthetics**: High-end minimalist design with smooth animations.
- **Performance**: Near-instant feedback (loaders, skeleton screens).
- **Scalability**: Backend structured to handle modular AI agents (LangGraph).

## 4. Technical Architecture
### 4.1 Frontend (React + Vite)
- **Styling**: Tailwind CSS + Shadcn UI.
- **Animations**: Framer Motion for AI states and transitions.
- **State Management**: React Context/Hooks for local UI and AI data flow.
- **API Communication**: Axios instance pointing to the FastAPI backend.

### 4.2 Backend (FastAPI + SQLite)
- **REST API**: Handles listings and image processing.
- **Storage**: Local SQLite for data and `/static/images` for file storage.
- **AI Integration**: Mocked endpoint for the 7-day hackathon, ready for LangGraph module integration.

## 5. UI/UX Design System
### 5.1 Color Palette
- **Background**: `#FAF9F6` (Soft Cream/Off-white) - for a warm, premium feel.
- **Primary (AI)**: `#6366F1` (Indigo/Soft Purple) - represents intelligence and tech.
- **Secondary (Earth)**: `#A855F7` (Secondary Purple) and Terracotta/Browns for natural, sustainable vibes.
- **Text**: `#1F2937` (Rich Charcoal) for high legibility.

### 5.2 Typography
- **Headings**: *Inter* or *Outfit*, Semibold/Bold, large scale.
- **Body**: *Inter*, Regular, clean tracking and leading.

### 5.3 UI Components
- **Buttons**: Large, rounded corners (`rounded-2xl`), subtle shadows.
- **Cards**: Minimal borders, soft shadows, plenty of internal padding.
- **Loading Overlay**: Translucent backdrop with smooth motion-blurred elements.

## 6. Implementation Roadmap
1. **Foundation**: Setup design tokens in Tailwind and global styles.
2. **Core Layout**: Create the mobile shell and Navbar.
3. **Feed**: Implement the listing display.
4. **The Camera Flow**: Build the "Magic" button and AI processing overlay.
5. **Confirmation View**: Create the price selection and publish logic.
