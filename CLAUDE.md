# Crazy Coconuts B&B - Project Documentation

## Project Overview
**Crazy Coconuts** is a cozy family-run bed & breakfast booking website for a beachfront property in San Antero, Colombia. This is a full-stack web application with both frontend and backend functionality, featuring professional hotel booking capabilities, multi-currency support, bilingual content (English/Spanish), and integrated payment processing.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payment Processing**: Stripe API with webhooks
- **Internationalization**: Custom i18n system with auto-detection
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Email**: Nodemailer integration
- **Utilities**: Axios, Validator.js, BCrypt

## Key Features Implemented

### 1. Professional Frontend Design
- **Responsive Design**: Mobile-first approach with elegant CSS
- **Playful Tropical Theme**: Warm, cozy aesthetic with custom SVG illustrations
- **Typography**: Fraunces (display) + DM Sans (body) font pairing
- **Color Palette**: Coral (#E07A5F), Ocean (#1E6B7B), Palm (#3D5A45), Sand (#E8DCC4)
- **Navigation**: Fixed navigation bar with smooth scrolling
- **Hero Section**: Split layout with floating card and statistics
- **Room Gallery**: Beautiful room showcases with pricing
- **Amenities Section**: Illustrated cards with custom SVG icons
- **Attractions Section**: Featured photo card with warm postcard-style layout
- **Contact Information**: Complete B&B details and location

### 2. Bilingual Support (English/Spanish)
- **Auto-Detection**: Automatic language detection based on browser locale
- **Language Toggle**: Flag-based toggle button in navigation (🇺🇸/🇨🇴)
- **Persistent Preference**: Language choice saved in localStorage
- **Complete Translations**: All UI text translated including forms, sections, footer
- **HTML Data Attributes**: Uses `data-i18n` attributes for seamless translation

### 3. Multi-Currency System
- **Dynamic Currency Conversion**: Real-time price conversion between 6+ currencies
- **Auto-Detection**: Automatic currency detection based on user locale
- **Persistent Selection**: Currency preference saved in localStorage
- **Global Integration**: Currency selector in navigation with flag icons
- **Supported Currencies**: COP, USD, EUR, CAD, MXN, BRL
- **Smart Formatting**: Proper decimal places and symbols for each currency

### 4. Complete Booking System
- **Room Availability**: Real-time availability checking
- **Date Validation**: Comprehensive check-in/check-out validation
- **Guest Management**: Support for 1-7 guests per booking
- **Special Requests**: Text area for guest requirements
- **Confirmation System**: Unique confirmation numbers generated
- **Status Tracking**: Multiple booking statuses (pending, confirmed, cancelled, etc.)

### 5. Integrated Payment Processing
- **Stripe Integration**: Full Stripe payment processing with secure card handling
- **Payment Intents**: Secure payment intent creation and confirmation
- **Multi-Currency Payments**: Support for payments in different currencies
- **Webhook Handling**: Automatic payment status updates via Stripe webhooks
- **Payment Security**: PCI compliant payment processing
- **Payment Modal**: Professional payment interface with loading states

### 6. Database Models & Validation
- **Booking Model**: Comprehensive booking schema with validation
- **Room Model**: Detailed room information with pricing and amenities
- **Data Validation**: Server-side validation using Validator.js
- **MongoDB Indexes**: Optimized database queries with proper indexing
- **Virtual Fields**: Computed fields like guest names and pricing

### 7. Admin Dashboard
- **Admin Interface**: Complete admin panel for managing bookings
- **Sidebar Navigation**: Modern sidebar layout with section switching
- **Booking Management**: View, update, and manage all reservations
- **Statistics Dashboard**: Revenue and booking analytics
- **Export Functionality**: Data export capabilities
- **Secure Access**: Protected admin routes with password authentication

### 8. API Architecture
- **RESTful Design**: Well-structured API endpoints
- **Route Organization**: Modular route structure (bookings, rooms, payments, admin)
- **Error Handling**: Comprehensive error handling and logging
- **Input Validation**: Server-side validation middleware
- **Rate Limiting**: API protection against abuse

### 9. Security Features
- **Helmet Protection**: HTTP header security
- **CORS Configuration**: Cross-origin resource sharing setup
- **Rate Limiting**: Request throttling for API protection
- **Input Sanitization**: XSS and injection prevention
- **Environment Variables**: Secure configuration management
- **Payment Security**: PCI DSS compliant payment handling

### 10. Email Integration
- **Nodemailer Setup**: Email service configuration
- **Booking Confirmations**: Automated confirmation emails
- **Payment Receipts**: Email receipts for successful payments
- **Email Templates**: Professional email formatting

## File Structure
```
crazy-coconuts-website/
├── models/
│   ├── Booking.js          # Booking database model
│   └── Room.js             # Room database model
├── routes/
│   ├── admin.js            # Admin dashboard routes
│   ├── availability.js     # Room availability routes
│   ├── bookings.js         # Booking management routes
│   ├── payments.js         # Stripe payment routes
│   └── rooms.js            # Room information routes
├── middleware/
│   └── validation.js       # Input validation middleware
├── utils/
│   ├── currency.js         # Multi-currency conversion system
│   ├── emailService.js     # Email sending utilities
│   ├── i18n.js             # Internationalization handler
│   ├── pricing.js          # Pricing calculation utilities
│   └── translations.js     # English & Spanish translations
├── scripts/
│   └── seedDatabase.js     # Database initialization script
├── server.js               # Main Express server
├── index.html              # Main website frontend
├── script.js               # Frontend JavaScript
├── styles.css              # Main stylesheet (2200+ lines)
├── admin.html              # Admin dashboard frontend
├── admin-script.js         # Admin dashboard JavaScript
├── admin-styles.css        # Admin dashboard styles
└── package.json            # Project dependencies
```

## Room Types & Pricing
1. **Family Room (Up to 4 Guests)** - $120/night (Base rate in USD)
2. **Large Family Room (Up to 7 Guests)** - $130/night (Base rate in USD)

## Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password
- `NODE_ENV` - Environment setting (development/production)

## Development Commands
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Initialize database with room data
- `node server.js` - Direct server start (port 3003)

## Recent Development History
Based on git commits, the project has gone through several phases:
1. **Initial Setup**: Basic hotel website structure
2. **Backend Integration**: Node.js server and MongoDB setup
3. **Multi-Currency System**: Complete currency conversion implementation
4. **Stripe Integration**: Payment processing and webhook handling
5. **Admin Dashboard**: Management interface for bookings
6. **Security & Optimization**: Rate limiting, validation, and performance improvements
7. **Visual Redesign**: Complete frontend overhaul with playful tropical theme
8. **Bilingual Support**: English/Spanish translations with auto-detection

## Design System

### Colors (CSS Custom Properties)
```css
--coral: #E07A5F;        /* Primary accent */
--coral-dark: #C4664D;   /* Hover states */
--ocean: #1E6B7B;        /* Secondary/CTA */
--ocean-dark: #155662;   /* Dark variant */
--palm: #3D5A45;         /* Tertiary green */
--sand: #E8DCC4;         /* Background */
--sand-light: #F5F1E8;   /* Light background */
--coconut: #5C4033;      /* Brown accent */
--sunset: #F2CC8F;       /* Warm yellow */
```

### Typography
- **Display Font**: Fraunces (Google Fonts) - Headlines, titles
- **Body Font**: DM Sans (Google Fonts) - Body text, UI elements

### Spacing Scale
```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
--space-3xl: 4rem;
--space-4xl: 6rem;
```

## Technical Notes
- **Database**: Uses MongoDB with Mongoose for data modeling
- **Authentication**: Admin routes protected with password authentication
- **Deployment**: Configured for both development and production environments
- **Responsive Design**: Mobile-first CSS with breakpoints at 1024px, 768px, 480px
- **Error Handling**: Comprehensive error management throughout the application
- **Logging**: Morgan HTTP request logging for debugging
- **i18n**: Custom lightweight internationalization without external dependencies

## Future Considerations
- Add user authentication system for guests
- Implement email template system with HTML templates
- Add more payment methods (PayPal, local Colombian methods)
- Enhance admin analytics with charts
- Add booking modification capabilities
- Implement seasonal pricing
- Add image upload functionality for admin
- Create API documentation
- Add unit and integration tests
- Add more languages (Portuguese, French)

---

*This documentation serves as a reference for all development work done on the Crazy Coconuts B&B project. Update this file when adding new features or making significant changes.*

*Last updated: November 2024*
