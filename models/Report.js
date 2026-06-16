const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  overallHealth:       { type: String, required: true },
  diseaseAreaPercent:  { type: Number, required: true },
  notes:               { type: String, required: true },
  images:              [{ type: String }],
}, { timestamps: true })

module.exports = mongoose.model('Report', reportSchema)