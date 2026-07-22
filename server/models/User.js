import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// No schema-level maxlength here on purpose: user.save() gets called for
// unrelated updates (isOnline, lastActivity) on every login/logout/activity
// ping, which would re-validate username/email/password against limits
// that didn't exist when the account was created. Length limits (username
// 30, email 254, password 72 - bcrypt's silent-truncation limit) are
// enforced once, at registration, in routes/authRoutes.js.
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed
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
