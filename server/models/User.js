import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 30 },
  email: { type: String, required: true, unique: true, maxlength: 254 },
  // Will be hashed. maxlength caps the pre-hash plaintext, since bcrypt
  // silently truncates anything past 72 bytes anyway.
  password: { type: String, required: true, maxlength: 72 },
  googleId: String, // For OAuth

  // 🔥 For activity/status tracking
  lastActivity: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },   // 👈 NEW FIELD

  // Daily focus-time goal in minutes, used by the dashboard goal ring. 360 = 6h.
  dailyGoalMinutes: { type: Number, default: 360 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔥 Method to update activity
userSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  this.isOnline = true;
  await this.save();
};

export default mongoose.model('User', userSchema);
