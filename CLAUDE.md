# Crazy Coconuts Hotel - Project Documentation

## Project Overview
**Crazy Coconuts Hotel** is a comprehensive luxury hotel booking website for a beachfront resort in Colombia. This is a full-stack web application with both frontend and backend functionality, featuring professional hotel booking capabilities, multi-currency support, and integrated payment processing.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payment Processing**: Stripe API with webhooks
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Email**: Nodemailer integration
- **Utilities**: Axios, Validator.js, BCrypt

## Key Features Implemented

### 1. Professional Frontend Design
- **Responsive Design**: Mobile-first approach with elegant CSS
- **Modern UI/UX**: Professional tropical theme with smooth animations
- **Navigation**: Fixed navigation bar with smooth scrolling
- **Hero Section**: Eye-catching landing area with call-to-action buttons
- **Room Gallery**: Beautiful room showcases with pricing
- **Contact Information**: Complete hotel details and location

### 2. Multi-Currency System
- **Dynamic Currency Conversion**: Real-time price conversion between 6+ currencies
- **Auto-Detection**: Automatic currency detection based on user locale
- **Persistent Selection**: Currency preference saved in localStorage
- **Global Integration**: Currency selector in navigation with flag icons
- **Supported Currencies**: COP, USD, EUR, CAD, MXN, BRL
- **Smart Formatting**: Proper decimal places and symbols for each currency

### 3. Complete Booking System
- **Room Availability**: Real-time availability checking
- **Date Validation**: Comprehensive check-in/check-out validation  
- **Guest Management**: Support for 1-8 guests per booking
- **Special Requests**: Text area for guest requirements
- **Confirmation System**: Unique confirmation numbers generated
- **Status Tracking**: Multiple booking statuses (pending, confirmed, cancelled, etc.)

### 4. Integrated Payment Processing
- **Stripe Integration**: Full Stripe payment processing with secure card handling
- **Payment Intents**: Secure payment intent creation and confirmation
- **Multi-Currency Payments**: Support for payments in different currencies
- **Webhook Handling**: Automatic payment status updates via Stripe webhooks
- **Payment Security**: PCI compliant payment processing
- **Payment Modal**: Professional payment interface with loading states

### 5. Database Models & Validation
- **Booking Model**: Comprehensive booking schema with validation
- **Room Model**: Detailed room information with pricing and amenities
- **Data Validation**: Server-side validation using Validator.js
- **MongoDB Indexes**: Optimized database queries with proper indexing
- **Virtual Fields**: Computed fields like guest names and pricing

### 6. Admin Dashboard
- **Admin Interface**: Complete admin panel for managing bookings
- **Booking Management**: View, update, and manage all reservations
- **Statistics Dashboard**: Revenue and booking analytics
- **Export Functionality**: Data export capabilities
- **Secure Access**: Protected admin routes

### 7. API Architecture
- **RESTful Design**: Well-structured API endpoints
- **Route Organization**: Modular route structure (bookings, rooms, payments, admin)
- **Error Handling**: Comprehensive error handling and logging
- **Input Validation**: Server-side validation middleware
- **Rate Limiting**: API protection against abuse

### 8. Security Features
- **Helmet Protection**: HTTP header security
- **CORS Configuration**: Cross-origin resource sharing setup
- **Rate Limiting**: Request throttling for API protection
- **Input Sanitization**: XSS and injection prevention
- **Environment Variables**: Secure configuration management
- **Payment Security**: PCI DSS compliant payment handling

### 9. Email Integration
- **Nodemailer Setup**: Email service configuration
- **Booking Confirmations**: Automated confirmation emails
- **Payment Receipts**: Email receipts for successful payments
- **Email Templates**: Professional email formatting

### 10. Development Tools
- **Database Seeding**: Scripts to populate initial room data
- **Test Files**: Test scripts for booking and server functionality
- **Start Scripts**: Batch files for easy server startup
- **Environment Setup**: Development and production configurations

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
│   └── pricing.js          # Pricing calculation utilities
├── scripts/
│   └── seedDatabase.js     # Database initialization script
├── server.js               # Main Express server
├── index.html              # Main website frontend
├── script.js               # Frontend JavaScript
├── styles.css              # Main stylesheet
├── admin.html              # Admin dashboard frontend
├── admin-script.js         # Admin dashboard JavaScript
├── admin-styles.css        # Admin dashboard styles
└── package.json            # Project dependencies
```

## Room Types & Pricing
1. **Ocean View Room** - $180/night (Base rate in USD)
2. **Beachfront Suite** - $350/night (Base rate in USD)  
3. **Presidential Villa** - $650/night (Base rate in USD)

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
- `start.bat` - Windows batch file to start server

## Recent Development History
Based on git commits, the project has gone through several phases:
1. **Initial Setup**: Basic hotel website structure
2. **Backend Integration**: Node.js server and MongoDB setup
3. **Multi-Currency System**: Complete currency conversion implementation
4. **Stripe Integration**: Payment processing and webhook handling
5. **Admin Dashboard**: Management interface for bookings
6. **Security & Optimization**: Rate limiting, validation, and performance improvements

## Technical Notes
- **Database**: Uses MongoDB with Mongoose for data modeling
- **Authentication**: Admin routes protected (authentication method to be determined)
- **Deployment**: Configured for both development and production environments
- **Responsive Design**: Mobile-first CSS with breakpoints for all devices
- **Error Handling**: Comprehensive error management throughout the application
- **Logging**: Morgan HTTP request logging for debugging

## Future Considerations
- Add user authentication system
- Implement email template system
- Add more payment methods
- Enhance admin analytics
- Add booking modification capabilities
- Implement seasonal pricing
- Add image upload functionality
- Create API documentation
- Add unit and integration tests

---

*This documentation serves as a reference for all development work done on the Crazy Coconuts Hotel project. Update this file when adding new features or making significant changes.*