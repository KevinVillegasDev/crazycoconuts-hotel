const mongoose = require('mongoose');
const Booking = require('./models/Booking');
require('dotenv').config();

const testModel = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const testBooking = new Booking({
            firstName: "Test",
            lastName: "Guest", 
            email: "test@example.com",
            phone: "+12345678901",
            checkInDate: new Date("2025-08-15"),
            checkOutDate: new Date("2025-08-17"), 
            roomType: "ocean-view",
            guestCount: 2,
            specialRequests: "Test booking",
            roomRate: 180,
            subtotal: 360,
            taxes: 57.6,
            totalAmount: 417.6
        });
        
        console.log('Before save - confirmationNumber:', testBooking.confirmationNumber);
        console.log('Before save - numberOfNights:', testBooking.numberOfNights);
        
        await testBooking.save();
        
        console.log('After save - confirmationNumber:', testBooking.confirmationNumber);
        console.log('After save - numberOfNights:', testBooking.numberOfNights);
        console.log('✅ Test booking created successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

testModel();