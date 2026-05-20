# Crazy Coconuts B&B - Quick Reference Guide

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
- **Password**: Set via `ADMIN_PASSWORD` env var. Falls back to `admin123` with a startup warning if unset.
- **Authentication**: JWT (24h expiry, stored in sessionStorage). Requires `JWT_SECRET` env var; login is refused if unset.

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
- `GET /api/rooms` - List rooms
- `GET /api/availability?checkIn=&checkOut=&roomType=` - Check room availability
- `GET /api/bookings/:confirmationNumber` - Look up a booking
- `POST /api/bookings` - Create new booking
- `GET /api/payments/config` - Active payment provider info + publishable key (or `enabled: false`)
- `POST /api/payments/create-intent` - Create Stripe deposit payment intent
- `POST /api/payments/confirm` - Confirm deposit
- `GET /api/payments/status/:confirmationNumber` - Payment status lookup
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/exchange-rates` - Current cached COP-based exchange rates
- `GET /api/health` - Liveness probe

### Admin Endpoints (JWT-protected — `Authorization: Bearer <token>`)
- `POST /api/admin/login` - Admin authentication (returns token)
- `GET /api/admin/dashboard` - Dashboard stats (bookings, revenue, occupancy)
- `GET /api/admin/bookings/recent?limit=N` - Recent bookings
- `GET /api/bookings` - List bookings (paginated, admin-only)
- `PUT /api/bookings/:id` - Update booking status/notes (admin-only)
- `DELETE /api/bookings/:id` - Cancel booking + auto-refund deposit if within 48h (admin-only)
- `POST /api/payments/refund` - Refund a deposit by booking ID or confirmation number

## 💰 Currency System
- **Supported**: COP, USD, EUR, CAD, GBP, MXN, BRL, ARS
- **Base Currency**: COP (all prices stored in COP)
- **Live rates**: Fetched from `open.er-api.com` every 6h with fallback table (`utils/exchangeRateService.js`)
- **Storage**: User preference in localStorage

## 🏨 Room Types & Base Pricing (COP)
1. **Family Room (Up to 4 Guests)** — 420,000 COP/night — 2 rooms in inventory
2. **Large Family Room (Up to 7 Guests)** — 735,000 COP/night — 6 rooms in inventory

Tax: 16%. Deposit: 50% online, balance on arrival. Free cancellation within 48h of booking.

## 💳 Payment Processing
- **Provider**: Stripe (Payment Intents API for the 50% deposit). Configurable via `STRIPE_*` env vars.
- If Stripe env vars are not set, `/api/payments/config` reports `enabled: false` and the frontend payment modal shows a WhatsApp fallback instead of crashing.
- **Webhook**: `POST /api/payments/webhook` — uses `paymentType` metadata to disambiguate deposit vs. balance.
- **Refunds**: Automatic via `DELETE /api/bookings/:id` when within 48h cancellation window.

## 🗄️ Database Models

### Booking Schema (selected fields — see `models/Booking.js` for full schema)
```javascript
{
  confirmationNumber: String (unique, auto-generated as 'CC' + 8-digit timestamp),
  firstName, lastName, email, phone,         // guest info (top-level, not nested)
  checkInDate, checkOutDate, numberOfNights,
  roomType: 'family-room-4' | 'large-family-room-7',
  guestCount: Number (1–8),
  specialRequests: String,
  roomRate, subtotal, taxes, totalAmount,    // all in COP
  depositAmount, balanceDue,                 // 50/50 split, auto-computed
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show',
  paymentStatus: 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'refunded',
  paymentIntentId: String,                   // Stripe PI id
  paymentCurrency, convertedAmount,          // currency at checkout
  paidAt, refundId, refundedAt, refundAmount,
  cancellationDeadline: Date                 // 48h after createdAt
}
```

### Room Schema
```javascript
{
  type: 'family-room-4' | 'large-family-room-7',  // unique
  name, description,
  basePrice: Number,        // in COP
  maxGuests: Number,
  totalRooms: Number,       // inventory count
  amenities: [{ icon, name, description }],
  images: [{ url, alt, isPrimary }],
  isActive: Boolean,
  seasonalPricing: [{ name, startDate, endDate, priceMultiplier }]
}
```

## 🔧 Environment Variables
```env
# Required for full functionality
MONGODB_URI=mongodb://localhost:27017/crazycoconuts
JWT_SECRET=your-jwt-secret              # admin login refused without this
ADMIN_PASSWORD=your-admin-password      # falls back to 'admin123' with warning

# Stripe (optional — if unset, payment modal shows WhatsApp fallback)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional — confirmation emails are silently skipped if unset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000      # used for CORS in production
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
Set the `ADMIN_PASSWORD` env var. The fallback `admin123` is only for local dev and emits a startup warning.

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
- Service falls back to hardcoded rates in `utils/exchangeRateService.js` if the upstream API fails

## 📊 Key Metrics Tracked
- Total bookings
- Revenue (by currency)
- Occupancy rates
- Popular room types
- Booking status distribution

---

*Last updated: Generated automatically via codebase analysis*