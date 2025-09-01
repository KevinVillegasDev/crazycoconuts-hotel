# Crazy Coconuts Hotel - Quick Reference Guide

## 🚀 Quick Start Commands
```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server  
npm run dev

# Seed database with room data
npm run seed
```

## 🔐 Admin Dashboard Access
- **URL**: `http://localhost:3000/admin.html`
- **Password**: Check `routes/admin.js:12` - default is `admin123` or set via `ADMIN_PASSWORD` env var
- **Authentication**: Session-based (stored in sessionStorage)

## 🏗️ Project Architecture

### Core Files Structure
```
├── server.js                 # Main Express server & routing setup
├── index.html                # Main hotel website 
├── admin.html                # Admin dashboard interface
├── models/
│   ├── Booking.js            # MongoDB booking schema
│   └── Room.js               # MongoDB room schema  
├── routes/
│   ├── admin.js              # Admin authentication & dashboard APIs
│   ├── availability.js       # Room availability checking
│   ├── bookings.js           # Booking CRUD operations
│   ├── payments.js           # Stripe payment processing
│   └── rooms.js              # Room information APIs
├── utils/
│   ├── currency.js           # Multi-currency conversion system
│   ├── emailService.js       # Email notifications (Nodemailer)
│   └── pricing.js            # Dynamic pricing calculations
└── middleware/
    └── validation.js         # Input validation & sanitization
```

### Frontend Files
- `script.js` - Main website JavaScript (booking, currency, UI)
- `admin-script.js` - Admin dashboard functionality
- `styles.css` - Main website styles
- `admin-styles.css` - Admin dashboard styles

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/rooms` - Get all room types
- `POST /api/availability` - Check room availability  
- `POST /api/bookings` - Create new booking
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/bookings` - Get all bookings with filters
- `PUT /api/admin/bookings/:id` - Update booking status
- `DELETE /api/admin/bookings/:id` - Cancel booking
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/export` - Export bookings data

## 💰 Currency System
- **Supported**: COP, USD, EUR, CAD, MXN, BRL
- **Base Currency**: USD (all prices stored in USD)
- **Conversion**: Real-time via external API (`utils/currency.js`)
- **Storage**: User preference in localStorage

## 🏨 Room Types & Base Pricing (USD)
1. **Ocean View Room** - $180/night
2. **Beachfront Suite** - $350/night  
3. **Presidential Villa** - $650/night

## 💳 Payment Processing
- **Provider**: Stripe
- **Flow**: Payment Intents API
- **Webhook**: Automatic booking confirmation
- **Security**: PCI DSS compliant

## 🗄️ Database Models

### Booking Schema
```javascript
{
  confirmationNumber: String (unique),
  roomType: String (required),
  checkIn: Date,
  checkOut: Date, 
  guests: Number,
  totalAmount: Number,
  currency: String,
  status: String, // pending, confirmed, cancelled, completed
  paymentStatus: String, // pending, completed, failed
  stripePaymentIntentId: String,
  guestInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  specialRequests: String,
  createdAt: Date
}
```

### Room Schema
```javascript
{
  name: String,
  description: String,
  basePrice: Number, // in USD
  maxOccupancy: Number,
  amenities: [String],
  images: [String],
  available: Boolean
}
```

## 🔧 Environment Variables Required
```env
MONGODB_URI=mongodb://localhost:27017/crazycoconuts
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-jwt-secret
ADMIN_PASSWORD=your-admin-password
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
NODE_ENV=development
PORT=3000
```

## 🛡️ Security Features
- **Helmet**: HTTP header security
- **CORS**: Configured for development/production
- **Rate Limiting**: Global (100/15min) + Booking (5/15min)
- **Input Validation**: Sanitization middleware
- **JWT Authentication**: Admin routes protection

## 📧 Email Integration
- **Service**: Nodemailer 
- **Triggers**: Booking confirmations, payment receipts
- **Templates**: HTML formatted emails

## 🧪 Test Files
- `test-server.js` - Server connectivity test
- `test-booking.js` - Booking flow test  
- `test-model.js` - Database model test

## 🔄 Common Development Tasks

### Add New Room Type
1. Update `scripts/seedDatabase.js`
2. Run `npm run seed`
3. Update frontend room display in `index.html`

### Modify Admin Password
1. Set `ADMIN_PASSWORD` environment variable, or
2. Change default in `routes/admin.js:12`

### Add New Currency
1. Update `utils/currency.js` - add to `SUPPORTED_CURRENCIES`
2. Update frontend currency selector in `script.js`

### Debug Payment Issues
1. Check Stripe dashboard
2. Review webhook logs in server console
3. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe endpoint

## 🚨 Common Issues & Solutions

**Server won't start on Windows**: 
- Install cross-env: `npm install cross-env --save-dev`
- Update package.json start script to use `cross-env`

**Admin dashboard won't load**:
- Check admin password in `routes/admin.js`
- Verify JWT_SECRET is set
- Clear browser sessionStorage

**Payment failures**:
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Ensure HTTPS in production

**Currency conversion errors**:
- Check internet connection for API calls
- Fallback to USD if API fails

## 📊 Key Metrics Tracked
- Total bookings
- Revenue (by currency)
- Occupancy rates
- Popular room types
- Booking status distribution

---

*Last updated: Generated automatically via codebase analysis*