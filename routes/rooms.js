const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET /api/rooms - Get all rooms with optional pricing calculation
router.get('/', async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        
        let rooms;
        if (checkIn && checkOut) {
            rooms = await Room.getAllWithPricing(new Date(checkIn), new Date(checkOut));
        } else {
            rooms = await Room.getAllWithPricing();
        }
        
        res.json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms'
        });
    }
});

// GET /api/rooms/:type - Get specific room type
router.get('/:type', async (req, res) => {
    try {
        const room = await Room.findOne({ 
            type: req.params.type, 
            isActive: true 
        });
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room type not found'
            });
        }
        
        const { checkIn, checkOut } = req.query;
        let roomData = room.toObject();
        
        if (checkIn && checkOut) {
            roomData.totalPrice = room.getPriceForDates(new Date(checkIn), new Date(checkOut));
        }
        
        res.json({
            success: true,
            data: roomData
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch room'
        });
    }
});

module.exports = router;