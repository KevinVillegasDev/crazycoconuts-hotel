# Stripe Payment Integration Setup

## Overview
The Crazy Coconuts Hotel website now includes complete Stripe payment integration with multi-currency support. This guide will help you configure Stripe for your hotel.

## Required Stripe Configuration

### 1. Create a Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the business verification process
3. Activate your account for live payments

### 2. Get Your API Keys
From your Stripe Dashboard:
1. Go to **Developers** → **API Keys**
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`)

### 3. Environment Variables
Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Update Frontend Configuration
In `script.js`, replace the placeholder with your publishable key:

```javascript
// Line 889: Replace this line
stripe = Stripe('pk_test_your_publishable_key_here');

// With your actual key
stripe = Stripe('pk_test_51ABC123...');
```

### 5. Configure Webhooks (Recommended)
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Set URL to: `https://yourdomain.com/api/payments/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing Secret** to your `.env` file

## Supported Currencies

The system supports these currencies with automatic conversion:
- **COP** (Colombian Peso) - Primary currency
- **USD** (US Dollar)
- **EUR** (Euro)
- **CAD** (Canadian Dollar)
- **MXN** (Mexican Peso)
- **BRL** (Brazilian Real)

## Payment Flow

1. **Booking Creation**: Customer fills out booking form
2. **Payment Modal**: System shows payment modal with Stripe card input
3. **Payment Processing**: Stripe securely processes the payment
4. **Confirmation**: Booking status updates to "confirmed" upon successful payment
5. **Email**: Confirmation email sent to customer

## Testing Payments

### Test Card Numbers
Use these test cards in development:

- **Successful Payment**: `4242 4242 4242 4242`
- **Declined Payment**: `4000 0000 0000 0002`
- **3D Secure Required**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Test Different Currencies
The system will automatically handle currency conversion based on the user's selection. Colombian Peso (COP) is the base currency.

## Security Features

✅ **PCI Compliance**: Card data never touches your servers
✅ **3D Secure**: Automatic authentication for supported cards  
✅ **Fraud Detection**: Stripe's built-in fraud protection
✅ **SSL Required**: All payments require HTTPS
✅ **Rate Limiting**: Protection against payment spam

## Production Checklist

Before going live:

1. [ ] Replace test keys with live keys
2. [ ] Set up webhooks for production domain
3. [ ] Enable live payments in Stripe Dashboard
4. [ ] Test payment flow with real cards (small amounts)
5. [ ] Configure proper error handling and logging
6. [ ] Set up monitoring for failed payments

## Troubleshooting

### Common Issues

**Payment Modal Not Showing**
- Check browser console for JavaScript errors
- Verify Stripe publishable key is set correctly
- Ensure booking form validation passes

**Payment Failed**
- Check Stripe Dashboard for error details
- Verify webhook endpoint is accessible
- Check server logs for API errors

**Currency Conversion Issues**  
- Exchange rates update automatically
- Colombian Peso (COP) is the base currency
- Conversion rates are fetched from a reliable API

### Support
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Test your integration: [stripe.com/docs/testing](https://stripe.com/docs/testing)

## Implementation Notes

- Payments are processed in the customer's selected currency
- All prices are converted from the base Colombian Peso rates
- Failed payments leave bookings in "pending" status
- Successful payments automatically confirm bookings
- Email confirmations include payment receipts