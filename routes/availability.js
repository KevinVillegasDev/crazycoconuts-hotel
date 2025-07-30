const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET /api/availability - Check room availability for date range
router.get('/', async (req, res) => {
    // If no dates provided, return current availability (for admin dashboard)
    if (!req.query.checkIn && !req.query.checkOut) {
        try {
            const today = new Date();
            const availability = await Booking.findAvailableRooms(today, today);
            
            res.json({
                success: true,
                data: {
                    availability
                }
            });
            return;
        } catch (error) {
            console.error('Error checking current availability:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check availability'
            });
        }
    }
    try {
        const { checkIn, checkOut, roomType } = req.query;
        
        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Check-in and check-out dates are required'
            });
        }
        
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        // Validate dates
        if (checkInDate >= checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date cannot be in the past'
            });
        }
        
        const availability = await Booking.findAvailableRooms(
            checkInDate, 
            checkOutDate, 
            roomType
        );
        
        res.json({
            success: true,
            data: {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
                availability
            }
        });
        
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability'
        });
    }
});

module.exports = router;