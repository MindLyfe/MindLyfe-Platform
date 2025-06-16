# MindLyf Frontend Documentation

## Overview
This directory contains comprehensive documentation for the MindLyf Progressive Web Application (PWA) frontend. The application is designed with a mobile-first approach to provide users with a native app-like experience on all devices.

## 🏗️ Architecture
- **Framework**: React 18+ with TypeScript
- **Design System**: Mobile-first responsive design
- **PWA Features**: Service workers, offline functionality, push notifications
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6 with protected routes
- **UI Library**: Material-UI (MUI) with custom theming
- **Authentication**: JWT-based with refresh tokens

## 📱 Mobile-First Design Principles
- Touch-optimized interfaces with minimum 44px touch targets
- Responsive breakpoints: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- Progressive enhancement for larger screens
- Gesture-based navigation and interactions
- Optimized for one-handed use
- Fast loading with skeleton screens and lazy loading

## 📂 Documentation Structure

### [Screens Documentation](./screens/)
Comprehensive documentation of all application screens, organized by feature categories:

- **[Authentication Screens](./screens/authentication/)** - Login, registration, password recovery
- **[Dashboard Screens](./screens/dashboard/)** - Main dashboard, quick actions, overview
- **[Profile Screens](./screens/profile/)** - User profile, settings, preferences
- **[Mental Health Screens](./screens/mental-health/)** - Assessments, mood tracking, wellness tools
- **[Teletherapy Screens](./screens/teletherapy/)** - Therapist matching, video sessions, scheduling
- **[LyfBot Screens](./screens/lyfbot/)** - AI chat interface, conversation history
- **[Community Screens](./screens/community/)** - Forums, support groups, social features
- **[Journal Screens](./screens/journal/)** - Digital journaling, mood tracking, insights
- **[Resources Screens](./screens/resources/)** - Educational content, tools, downloads
- **[Payment Screens](./screens/payment/)** - Subscription management, billing, transactions
- **[Gamification Screens](./screens/gamification/)** - Achievements, badges, progress tracking
- **[Crisis Support Screens](./screens/crisis/)** - Emergency resources, safety planning
- **[Admin Screens](./screens/admin/)** - Administrative interfaces for staff

### [API Integration](./api/)
Documentation for all API endpoints and their usage:
- Authentication endpoints
- Service-specific API documentation
- Error handling patterns
- Request/response schemas

### [Components](./components/)
Reusable component library documentation:
- Design system components
- Mobile-optimized UI patterns
- Accessibility features
- Performance optimizations

### [PWA Features](./pwa/)
Progressive Web App implementation details:
- Service worker configuration
- Offline functionality
- Push notification system
- App installation prompts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern browser with PWA support

### Development Setup
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🔗 Quick Links
- [Screen Flow Diagrams](./screens/flow-diagrams/)
- [API Endpoint Reference](./api/endpoints.md)
- [Component Library](./components/library.md)
- [PWA Configuration](./pwa/configuration.md)
- [Accessibility Guidelines](./accessibility.md)
- [Performance Optimization](./performance.md)

## 📊 Key Features
- **214+ Notification Types** across all services
- **9 Core Services** with dedicated interfaces
- **Crisis Detection** with immediate intervention
- **Multi-language Support** with localization
- **WCAG 2.1 AA Compliance** for accessibility
- **End-to-end Encryption** for sensitive data
- **Real-time Updates** via WebSocket connections

## 🛠️ Development Guidelines
- Follow mobile-first design principles
- Implement progressive enhancement
- Ensure accessibility compliance
- Optimize for performance
- Test across multiple devices and browsers
- Maintain consistent design patterns

## 📱 Supported Platforms
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Firefox Mobile
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **PWA Installation**: All modern browsers with PWA support
- **Offline Support**: Core features available without internet

## 🔒 Security Features
- JWT token management with automatic refresh
- Secure storage for sensitive data
- HTTPS enforcement
- Content Security Policy (CSP)
- XSS and CSRF protection
- Biometric authentication support (mobile)

---

For detailed information about specific screens and features, navigate to the respective documentation sections. 