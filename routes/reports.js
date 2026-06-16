const express = require('express')
const router  = express.Router()
const Report  = require('../models/Report')
const Booking = require('../models/Booking')
const {protect} = require('../middleware/auth')
const multer  = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Setup cloudinary + multer directly here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'agridrone/reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
})

const upload =  multer({ storage: storage })

// POST /api/reports
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { bookingId, overallHealth, diseaseAreaPercent, notes } = req.body

    const booking = await Booking.findById(bookingId).populate('farmer')
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' })

    const images = req.files ? req.files.map(f => f.path) : []

    const report = await Report.create({
      booking:            bookingId,
      farmer:             booking.farmer._id,
      overallHealth,
      diseaseAreaPercent: Number(diseaseAreaPercent),
      notes,
      images,
    })

    res.status(201).json(report)
  } catch (err) {
    console.error('Create report error:', err)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/reports
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { farmer: req.user._id }

    const reports = await Report.find(filter)
      .populate('booking')
      .populate('farmer', 'fullName email')
      .sort({ createdAt: -1 })

    res.json(reports)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router