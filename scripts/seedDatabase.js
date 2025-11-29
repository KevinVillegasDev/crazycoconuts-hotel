const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crazycoconuts')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Sample room data
const roomsData = [
    {
        type: 'family-room-4',
        name: 'Family Room (Up to 4 Guests)',
        description: 'Comfortable room perfect for families and small groups. Features cozy beds, modern amenities, and a welcoming atmosphere.',
        basePrice: 140,
        maxGuests: 4,
        totalRooms: 3,
        amenities: [
            { icon: 'fas fa-wifi', name: 'Free WiFi', description: 'High-speed internet access' },
            { icon: 'fas fa-wind', name: 'Air Conditioning', description: 'Climate control for your comfort' },
            { icon: 'fas fa-bath', name: 'Private Bathroom', description: 'Clean private bathroom' },
            { icon: 'fas fa-tv', name: 'TV', description: 'Flat screen TV' }
        ],
        images: [
            {
                url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                alt: 'Family Room for 4 guests',
                isPrimary: true
            }
        ],
        isActive: true
    },
    {
        type: 'large-family-room-7',
        name: 'Large Family Room (Up to 7 Guests)',
        description: 'Spacious room ideal for large families and group gatherings. Plenty of space for everyone to relax and enjoy.',
        basePrice: 150,
        maxGuests: 7,
        totalRooms: 2,
        amenities: [
            { icon: 'fas fa-wifi', name: 'Free WiFi', description: 'High-speed internet access' },
            { icon: 'fas fa-wind', name: 'Air Conditioning', description: 'Climate control for your comfort' },
            { icon: 'fas fa-bath', name: 'Private Bathroom', description: 'Clean private bathroom' },
            { icon: 'fas fa-tv', name: 'TV', description: 'Flat screen TV' },
            { icon: 'fas fa-couch', name: 'Seating Area', description: 'Comfortable seating for the whole group' }
        ],
        images: [
            {
                url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                alt: 'Large Family Room for 7 guests',
                isPrimary: true
            }
        ],
        isActive: true
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database with room data...');
        
        // Clear existing rooms
        await Room.deleteMany({});
        console.log('✅ Cleared existing room data');
        
        // Insert new rooms
        const rooms = await Room.insertMany(roomsData);
        console.log(`✅ Inserted ${rooms.length} rooms:`);
        
        rooms.forEach(room => {
            console.log(`   - ${room.name} (${room.type}): $${room.basePrice}/night`);
        });
        
        console.log('\n🎉 Database seeded successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
}

// Run the seeding function
seedDatabase();