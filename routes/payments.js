const express = require('express');
const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Booking = require('../models/Booking');
const exchangeRateService = require('../utils/exchangeRateService');

// GET /api/payments/config - Public payment config for frontend
router.get('/config', (req, res) => {
    const stripeEnabled = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);

    res.json({
        success: true,
        data: {
            provider: stripeEnabled ? 'stripe' : 'none',
            enabled: stripeEnabled,
            publishableKey: stripeEnabled ? process.env.STRIPE_PUBLISHABLE_KEY : null
        }
    });
});

// POST /api/payments/create-intent - Create payment intent for deposit
router.post('/create-intent', async (req, res) => {
    if (!stripe) {
        return res.status(501).json({
            success: false,
            message: 'Payment processing not configured. Please configure Stripe in environment variables.'
        });
    }

    try {
        const { bookingId, confirmationNumber, currency = 'cop' } = req.body;

        let booking;
        if (bookingId) {
            booking = await Booking.findById(bookingId);
        } else if (confirmationNumber) {
            booking = await Booking.findOne({ confirmationNumber: confirmationNumber.toUpperCase() });
        }

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Deposit has already been paid for this booking'
            });
        }

        // Use deposit amount (50% of total) - calculated by the Booking model
        const depositAmountCOP = booking.depositAmount || Math.round(booking.totalAmount * 0.5);

        // Convert deposit to target currency
        let paymentAmount = depositAmountCOP;
        if (currency.toLowerCase() !== 'cop') {
            const { rates } = exchangeRateService.getRates();
            if (rates[currency.toUpperCase()]) {
                paymentAmount = Math.round(depositAmountCOP * rates[currency.toUpperCase()] * 100) / 100;
            }
        }

        // Convert amount to smallest currency unit for Stripe
        let amount;
        switch (currency.toLowerCase()) {
            case 'cop':
                amount = Math.round(paymentAmount); // COP doesn't use decimals
                break;
            case 'jpy':
                amount = Math.round(paymentAmount); // JPY doesn't use decimals
                break;
            default:
                amount = Math.round(paymentAmount * 100); // Most currencies use 2 decimal places
        }

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency.toLowerCase(),
            metadata: {
                bookingId: booking._id.toString(),
                confirmationNumber: booking.confirmationNumber,
                guestEmail: booking.email,
                guestName: `${booking.firstName} ${booking.lastName}`,
                roomType: booking.roomType,
                checkInDate: booking.checkInDate.toISOString(),
                checkOutDate: booking.checkOutDate.toISOString(),
                totalAmountCOP: booking.totalAmount.toString(),
                depositAmountCOP: depositAmountCOP.toString(),
                balanceDueCOP: (booking.balanceDue || booking.totalAmount - depositAmountCOP).toString(),
                paymentType: 'deposit',
                paymentCurrency: currency,
                paymentAmount: paymentAmount.toString()
            },
            receipt_email: booking.email,
            description: `Crazy Coconuts Cabañas - Deposit (50%) - ${booking.confirmationNumber}`
        });

        // Save payment intent ID and currency to booking
        booking.paymentIntentId = paymentIntent.id;
        booking.paymentCurrency = currency;
        booking.convertedAmount = paymentAmount;
        await booking.save();

        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: paymentAmount,
                currency: currency,
                totalAmount: booking.totalAmount,
                depositAmount: booking.depositAmount,
                balanceDue: booking.balanceDue,
                paymentType: 'deposit'
            }
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent'
        });
    }
});

// POST /api/payments/confirm - Confirm deposit payment and update booking
router.post('/confirm', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }

        // Find and update booking
        const booking = await Booking.findOne({ paymentIntentId });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking status - deposit paid, not fully paid
        booking.paymentStatus = 'deposit_paid';
        booking.status = 'confirmed';
        booking.paidAt = new Date();
        await booking.save();

        res.json({
            success: true,
            message: 'Deposit payment confirmed successfully',
            data: {
                confirmationNumber: booking.confirmationNumber,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.status,
                depositAmount: booking.depositAmount,
                balanceDue: booking.balanceDue,
                cancellationDeadline: booking.cancellationDeadline
            }
        });

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm payment'
        });
    }
});

// POST /api/payments/webhook - Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handlePaymentFailure(failedPayment);
            break;

        case 'charge.refunded':
            const charge = event.data.object;
            await handleRefundConfirmation(charge);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Helper function to handle successful payment (deposit or balance)
async function handlePaymentSuccess(paymentIntent) {
    try {
        const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
        if (!booking) return;

        const paymentType = paymentIntent.metadata?.paymentType || 'deposit';

        if (paymentType === 'balance') {
            booking.paymentStatus = 'paid';
        } else if (booking.paymentStatus !== 'deposit_paid' && booking.paymentStatus !== 'paid') {
            booking.paymentStatus = 'deposit_paid';
        }

        booking.status = 'confirmed';
        booking.paidAt = new Date();
        await booking.save();

        console.log(`${paymentType} payment succeeded for booking ${booking.confirmationNumber}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
    }
}

// Helper function to handle failed payment
async function handlePaymentFailure(paymentIntent) {
    try {
        const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });

        if (booking) {
            booking.paymentStatus = 'failed';
            await booking.save();

            console.log(`Payment failed for booking ${booking.confirmationNumber}`);
        }
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

// Helper function to handle refund confirmation from webhook
async function handleRefundConfirmation(charge) {
    try {
        const booking = await Booking.findOne({ paymentIntentId: charge.payment_intent });
        if (booking && booking.paymentStatus !== 'refunded') {
            booking.paymentStatus = 'refunded';
            booking.refundedAt = new Date();
            await booking.save();
            console.log(`Refund confirmed for booking ${booking.confirmationNumber}`);
        }
    } catch (error) {
        console.error('Error handling refund confirmation:', error);
    }
}

// POST /api/payments/refund - Refund deposit for cancelled booking
router.post('/refund', async (req, res) => {
    if (!stripe) {
        return res.status(501).json({
            success: false,
            message: 'Payment processing not configured.'
        });
    }

    try {
        const { bookingId, confirmationNumber } = req.body;

        let booking;
        if (bookingId) {
            booking = await Booking.findById(bookingId);
        } else if (confirmationNumber) {
            booking = await Booking.findOne({ confirmationNumber: confirmationNumber.toUpperCase() });
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.paymentStatus !== 'deposit_paid') {
            return res.status(400).json({
                success: false,
                message: 'No deposit payment to refund'
            });
        }

        if (!booking.isRefundEligible) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation deadline has passed. Deposit is non-refundable after 48 hours.'
            });
        }

        if (!booking.paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'No payment intent found for this booking'
            });
        }

        // Issue refund via Stripe
        const refund = await stripe.refunds.create({
            payment_intent: booking.paymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
                bookingId: booking._id.toString(),
                confirmationNumber: booking.confirmationNumber
            }
        });

        // Update booking
        booking.paymentStatus = 'refunded';
        booking.status = 'cancelled';
        booking.refundId = refund.id;
        booking.refundedAt = new Date();
        booking.refundAmount = booking.depositAmount;
        await booking.save();

        res.json({
            success: true,
            message: 'Deposit refunded successfully',
            data: {
                refundId: refund.id,
                refundAmount: booking.depositAmount,
                confirmationNumber: booking.confirmationNumber,
                bookingStatus: booking.status,
                paymentStatus: booking.paymentStatus
            }
        });

    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process refund'
        });
    }
});

// GET /api/payments/status/:confirmationNumber - Get payment status
router.get('/status/:confirmationNumber', async (req, res) => {
    try {
        const booking = await Booking.findOne({
            confirmationNumber: req.params.confirmationNumber.toUpperCase()
        }).select('paymentStatus status totalAmount depositAmount balanceDue cancellationDeadline confirmationNumber');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: {
                confirmationNumber: booking.confirmationNumber,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.status,
                totalAmount: booking.totalAmount,
                depositAmount: booking.depositAmount,
                balanceDue: booking.balanceDue,
                isRefundEligible: booking.isRefundEligible,
                cancellationDeadline: booking.cancellationDeadline
            }
        });

    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment status'
        });
    }
});

module.exports = router;
