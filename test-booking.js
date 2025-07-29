// Test script to create a sample booking
const axios = require('axios');

const testBooking = async () => {
    const bookingData = {
        firstName: "John",
        lastName: "Doe", 
        email: "john.doe@example.com",
        phone: "+12345678901",
        checkInDate: "2025-08-15",
        checkOutDate: "2025-08-17", 
        roomType: "ocean-view",
        guestCount: 2,
        specialRequests: "Test booking from API"
    };

    try {
        console.log('🧪 Testing booking API...');
        
        // Test 1: Create a booking
        const response = await axios.post('http://localhost:3003/api/bookings', bookingData);
        console.log('✅ Booking created successfully!');
        console.log('📧 Confirmation Number:', response.data.data.confirmationNumber);
        console.log('💰 Total Amount:', response.data.data.booking.totalAmount);
        
        // Test 2: Get all bookings
        const bookingsResponse = await axios.get('http://localhost:3003/api/bookings');
        console.log(`\n📋 Total bookings in database: ${bookingsResponse.data.data.bookings.length}`);
        
        // Test 3: Check room availability
        const availabilityResponse = await axios.get('http://localhost:3003/api/availability?checkIn=2025-08-15&checkOut=2025-08-17');
        console.log('\n🏨 Room availability:');
        console.log(availabilityResponse.data.data.availability);
        
        console.log('\n🎉 All tests passed! Your backend is working perfectly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

testBooking();