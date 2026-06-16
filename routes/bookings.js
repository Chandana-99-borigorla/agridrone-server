const express = require('express')
const router = express.Router()
const Booking = require('../models/Booking')
const { protect, adminOnly } = require('../middleware/auth')

// POST /api/bookings — farmer creates booking
router.post('/', protect, async (req, res) => {
  try {
    const { fieldName, location, acres, cropType, surveyDate, notes } = req.body
    const booking = await Booking.create({
      farmer: req.user._id,
      fieldName, location, acres, cropType, surveyDate, notes,
    })
    res.status(201).json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/bookings — farmer gets own bookings, admin gets all
router.get('/', protect, async (req, res) => {
  try {
    const bookings = req.user.role === 'admin'
      ? await Booking.find().populate('farmer', 'fullName email phone')
      : await Booking.find({ farmer: req.user._id })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/bookings/:id/status — admin updates status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router