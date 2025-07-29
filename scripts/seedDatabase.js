const mongoose = require('mongoose');
const Room = require('../models/Room');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crazycoconuts', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Sample room data
const roomsData = [
    {
        type: 'ocean-view',
        name: 'Ocean View Room',
        description: 'Spacious room with stunning ocean views and modern amenities. Perfect for couples or solo travelers seeking comfort and elegance.',
        basePrice: 180,
        maxGuests: 2,
        totalRooms: 10,
        amenities: [
            { icon: 'fas fa-wifi', name: 'Free WiFi', description: 'High-speed internet access' },
            { icon: 'fas fa-tv', name: 'Smart TV', description: '55" Smart TV with streaming services' },
            { icon: 'fas fa-cocktail', name: 'Mini Bar', description: 'Complimentary mini bar with local beverages' },
            { icon: 'fas fa-wind', name: 'Air Conditioning', description: 'Individual climate control' },
            { icon: 'fas fa-bath', name: 'Private Bathroom', description: 'Luxury bathroom with rainfall shower' },
            { icon: 'fas fa-coffee', name: 'Coffee Maker', description: 'In-room coffee and tea facilities' }
        ],
        images: [
            {
                url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                alt: 'Ocean View Room with modern furnishing',
                isPrimary: true
            }
        ],
        isActive: true
    },
    {
        type: 'beachfront-suite',
        name: 'Beachfront Suite',
        description: 'Luxurious suite with direct beach access and private balcony. Features separate living area and premium amenities.',
        basePrice: 350,
        maxGuests: 4,
        totalRooms: 5,
        amenities: [
            { icon: 'fas fa-hot-tub', name: 'Jacuzzi', description: 'Private jacuzzi on the balcony' },
            { icon: 'fas fa-couch', name: 'Living Area', description: 'Separate living room with ocean views' },
            { icon: 'fas fa-concierge-bell', name: 'Butler Service', description: 'Dedicated butler service during stay' },
            { icon: 'fas fa-wifi', name: 'Free WiFi', description: 'High-speed internet access' },
            { icon: 'fas fa-cocktail', name: 'Premium Mini Bar', description: 'Premium beverages and snacks' },
            { icon: 'fas fa-umbrella-beach', name: 'Beach Access', description: 'Direct access to private beach area' }
        ],
        images: [
            {
                url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                alt: 'Beachfront Suite with ocean view',
                isPrimary: true
            }
        ],
        isActive: true
    },
    {
        type: 'presidential-villa',
        name: 'Presidential Villa',
        description: 'Ultimate luxury with private pool and panoramic ocean views. Perfect for special occasions and VIP guests.',
        basePrice: 650,
        maxGuests: 6,
        totalRooms: 2,
        amenities: [
            { icon: 'fas fa-swimming-pool', name: 'Private Pool', description: 'Exclusive infinity pool with ocean views' },
            { icon: 'fas fa-car', name: 'Airport Transfer', description: 'Complimentary luxury airport transfer' },
            { icon: 'fas fa-utensils', name: 'Private Chef', description: 'Personal chef service available' },
            { icon: 'fas fa-spa', name: 'In-Room Spa', description: 'Private spa treatments in your villa' },
            { icon: 'fas fa-glass-cheers', name: 'Welcome Champagne', description: 'Complimentary champagne upon arrival' },
            { icon: 'fas fa-concierge-bell', name: 'VIP Concierge', description: '24/7 dedicated concierge service' }
        ],
        images: [
            {
                url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                alt: 'Presidential Villa with private pool',
                isPrimary: true
            }
        ],
        isActive: true,
        seasonalPricing: [
            {
                name: 'Holiday Season',
                startDate: new Date(new Date().getFullYear(), 11, 15), // December 15
                endDate: new Date(new Date().getFullYear() + 1, 0, 15), // January 15
                priceMultiplier: 1.5
            },
            {
                name: 'Summer Peak',
                startDate: new Date(new Date().getFullYear(), 5, 15), // June 15
                endDate: new Date(new Date().getFullYear(), 7, 15), // August 15
                priceMultiplier: 1.2
            }
        ]
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