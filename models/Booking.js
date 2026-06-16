const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fieldName: { type: String, required: true },
  location:  { type: String, required: true },
  acres:     { type: Number, required: true },
  cropType:  { type: String, required: true },
  surveyDate:{ type: String, required: true },
  notes:     { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)