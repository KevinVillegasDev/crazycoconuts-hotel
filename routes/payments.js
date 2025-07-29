const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// POST /api/payments/create-intent - Create payment intent for booking
router.post('/create-intent', async (req, res) => {
    try {
        const { bookingId, confirmationNumber } = req.body;
        
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
        
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Booking has already been paid'
            });
        }
        
        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(booking.totalAmount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                bookingId: booking._id.toString(),
                confirmationNumber: booking.confirmationNumber,
                guestEmail: booking.email,
                guestName: `${booking.firstName} ${booking.lastName}`
            },
            receipt_email: booking.email,
            description: `Crazy Coconuts Hotel - ${booking.confirmationNumber}`
        });
        
        // Save payment intent ID to booking
        booking.paymentIntentId = paymentIntent.id;
        await booking.save();
        
        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: booking.totalAmount
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

// POST /api/payments/confirm - Confirm payment and update booking
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
        
        // Update booking status
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();
        
        res.json({
            success: true,
            message: 'Payment confirmed successfully',
            data: {
                confirmationNumber: booking.confirmationNumber,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.status
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
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
});

// Helper function to handle successful payment
async function handlePaymentSuccess(paymentIntent) {
    try {
        const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
        
        if (booking && booking.paymentStatus !== 'paid') {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
            
            console.log(`Payment succeeded for booking ${booking.confirmationNumber}`);
        }
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

// GET /api/payments/status/:confirmationNumber - Get payment status
router.get('/status/:confirmationNumber', async (req, res) => {
    try {
        const booking = await Booking.findOne({
            confirmationNumber: req.params.confirmationNumber.toUpperCase()
        }).select('paymentStatus status totalAmount confirmationNumber');
        
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
                totalAmount: booking.totalAmount
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