const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// GET /api/admin/dashboard - Dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Get various statistics
        const [
            totalBookings,
            monthlyBookings,
            pendingBookings,
            confirmedBookings,
            monthlyRevenue,
            totalRevenue,
            todayCheckIns,
            todayCheckOuts
        ] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' }),
            Booking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                        paymentStatus: 'paid'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }
                    }
                }
            ]),
            Booking.aggregate([
                {
                    $match: { paymentStatus: 'paid' }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }
                    }
                }
            ]),
            Booking.countDocuments({
                checkInDate: {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lt: new Date(today.setHours(23, 59, 59, 999))
                },
                status: 'confirmed'
            }),
            Booking.countDocuments({
                checkOutDate: {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lt: new Date(today.setHours(23, 59, 59, 999))
                },
                status: 'confirmed'
            })
        ]);
        
        // Get room occupancy
        const roomOccupancy = await Booking.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    checkInDate: { $lte: today },
                    checkOutDate: { $gt: today }
                }
            },
            {
                $group: {
                    _id: '$roomType',
                    occupied: { $sum: 1 }
                }
            }
        ]);
        
        const roomStats = {
            'ocean-view': { total: 10, occupied: 0 },
            'beachfront-suite': { total: 5, occupied: 0 },
            'presidential-villa': { total: 2, occupied: 0 }
        };
        
        roomOccupancy.forEach(room => {
            if (roomStats[room._id]) {
                roomStats[room._id].occupied = room.occupied;
            }
        });
        
        // Calculate occupancy rates
        Object.keys(roomStats).forEach(roomType => {
            const stats = roomStats[roomType];
            stats.occupancyRate = ((stats.occupied / stats.total) * 100).toFixed(1);
        });
        
        res.json({
            success: true,
            data: {
                bookings: {
                    total: totalBookings,
                    monthly: monthlyBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings
                },
                revenue: {
                    monthly: monthlyRevenue[0]?.total || 0,
                    total: totalRevenue[0]?.total || 0
                },
                todayActivity: {
                    checkIns: todayCheckIns,
                    checkOuts: todayCheckOuts
                },
                roomOccupancy: roomStats
            }
        });
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});

// GET /api/admin/bookings/recent - Get recent bookings
router.get('/bookings/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('firstName lastName email checkInDate checkOutDate roomType totalAmount status createdAt confirmationNumber');
        
        res.json({
            success: true,
            data: recentBookings
        });
        
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent bookings'
        });
    }
});

module.exports = router;