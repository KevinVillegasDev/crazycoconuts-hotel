// Test script to create a sample booking
const axios = require('axios');

const testBooking = async () => {
    const bookingData = {
        firstName: "John",
        lastName: "Doe", 
        email: "john.doe@example.com",
        phone: "+12345678901",
        checkInDate: "2026-08-15",
        checkOutDate: "2026-08-17",
        roomType: "family-room-4",
        guestCount: 2,
        specialRequests: "Test booking from API"
    };

    const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

    try {
        console.log('🧪 Testing booking API...');

        // Test 1: Create a booking
        const response = await axios.post(`${BASE}/api/bookings`, bookingData);
        console.log('✅ Booking created successfully!');
        console.log('📧 Confirmation Number:', response.data.data.confirmationNumber);
        console.log('💰 Total Amount:', response.data.data.booking.totalAmount);

        // Test 2: Check room availability (admin-only listing skipped)
        const availabilityResponse = await axios.get(`${BASE}/api/availability?checkIn=2026-08-15&checkOut=2026-08-17`);
        console.log('\n🏨 Room availability:');
        console.log(availabilityResponse.data.data.availability);
        
        console.log('\n🎉 All tests passed! Your backend is working perfectly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

testBooking();