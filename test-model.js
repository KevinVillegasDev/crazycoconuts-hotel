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
            checkInDate: new Date("2026-08-15"),
            checkOutDate: new Date("2026-08-17"),
            roomType: "family-room-4",
            guestCount: 2,
            specialRequests: "Test booking",
            roomRate: 420000,
            subtotal: 840000,
            taxes: 134400,
            totalAmount: 974400
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