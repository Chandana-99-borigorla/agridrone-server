const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('Register hit:', req.body)
  try {
    const { fullName, email, phone, password, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ fullName, email, phone, password, role })

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Login hit:', req.body)
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' })

    const isMatch = await user.matchPassword(password)
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' })

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: err.message })
  }
})
const crypto     = require('crypto')
const sendEmail  = require('../utils/sendEmail')

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user)
      return res.status(404).json({ message: 'No account found with this email' })

    // Generate reset token
    const token   = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 1000 * 60 * 60 // 1 hour

    user.resetPasswordToken   = token
    user.resetPasswordExpires = expires
    await user.save()

    const resetUrl = `http://localhost:5173/reset-password/${token}`

    await sendEmail({
      to: user.email,
      subject: 'AgriDrone — Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #22c55e;">AgriDrone 🌾</h2>
          <p>Hi ${user.fullName},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}"
            style="display:inline-block; background:#22c55e; color:white; padding:12px 24px;
                   border-radius:8px; text-decoration:none; font-weight:bold; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color:#888; font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    res.json({ message: 'Reset link sent to your email' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body
    const user = await User.findOne({
      resetPasswordToken:   req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user)
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })

    user.password             = password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
module.exports = router