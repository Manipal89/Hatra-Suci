import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../middleware/auth.js';
import mongoose from 'mongoose';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Handle referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create user with inactive status (pending deposit verification)
    const user = await User.create({
      username,
      email,
      password,
      referredBy,
      isActive: false,
      registrationDepositPaid: false,
      registrationDepositVerified: false,
    });

    // Create referral relationship
    if (referredBy) {
      const Referral = (await import('../models/Referral.js')).default;
      
      // Atomic side assignment using MongoDB transaction to prevent race conditions
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Count within transaction to ensure consistent view
        const totalCount = await Referral.countDocuments(
          { referrer: referredBy }, 
          { session }
        );
        const side = totalCount % 2 === 0 ? 'left' : 'right';
        
        // Create referral within transaction
        await Referral.create([{
          referrer: referredBy,
          referred: user._id,
          side,
          isActive: false, // Will be activated on registration deposit approval
        }], { session });
        
        await session.commitTransaction();
      } catch (txError) {
        await session.abortTransaction();
        throw txError;
      } finally {
        session.endSession();
      }
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Check if registration deposit is verified
      if (!user.registrationDepositVerified) {
        return res.status(403).json({ 
          message: 'Your registration deposit is still being verified. Please try again after sometime.',
          depositPending: true,
          registrationDepositPaid: user.registrationDepositPaid
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        balance: user.balance,
        isActive: user.isActive,
        registrationDepositVerified: user.registrationDepositVerified,
        achievedLevels: user.achievedLevels || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (admin && (await admin.matchPassword(password))) {
      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      res.json({
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isAdmin: true,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings,
        spinWheelCount: user.spinWheelCount,
        spinWheelLastUsed: user.spinWheelLastUsed,
        achievedLevels: user.achievedLevels || [],
        createdAt: user.createdAt,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.walletAddress = req.body.walletAddress || user.walletAddress;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        walletAddress: updatedUser.walletAddress,
        balance: updatedUser.balance,
        referralCode: updatedUser.referralCode,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit registration deposit
// @route   POST /api/auth/registration-deposit
// @access  Public
export const submitRegistrationDeposit = async (req, res) => {
  try {
    const { userId, transactionHash, amount } = req.body;

    if (amount < 60) {
      return res.status(400).json({ message: 'Minimum deposit amount is $60' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.registrationDepositPaid) {
      return res.status(400).json({ message: 'Registration deposit already submitted' });
    }

    // Update user with deposit info
    user.registrationDepositPaid = true;
    user.registrationDepositAmount = amount;
    await user.save();

    // Get wallet address from settings
    const Settings = (await import('../models/Settings.js')).default;
    let depositWalletSetting = await Settings.findOne({ key: 'depositWallet' });
    const walletAddress = depositWalletSetting?.value || process.env.DEPOSIT_WALLET || '0x1ab174ddf2fb97bd3cf3362a98b103a6f3852a67';

    // Create deposit record with registration flag
    const Deposit = (await import('../models/Deposit.js')).default;
    const deposit = await Deposit.create({
      user: userId,
      amount,
      transactionHash,
      walletAddress,
      status: 'pending',
      proof: '',
      isRegistrationDeposit: true,
    });

    // Create transaction record
    const Transaction = (await import('../models/Transaction.js')).default;
    await Transaction.create({
      user: userId,
      type: 'deposit',
      amount,
      transactionHash,
      status: 'pending',
      description: 'Registration deposit - pending verification',
    });

    res.status(201).json({
      message: 'Registration deposit submitted successfully. Please wait for admin verification.',
      deposit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public settings (wallet address, QR, etc.)
// @route   GET /api/auth/settings
// @access  Public
export const getPublicSettings = async (req, res) => {
  try {
    const Settings = (await import('../models/Settings.js')).default;
    
    // Get or create deposit wallet setting
    let depositWallet = await Settings.findOne({ key: 'depositWallet' });
    if (!depositWallet) {
      depositWallet = await Settings.create({
        key: 'depositWallet',
        value: process.env.DEPOSIT_WALLET || '0x1ab174ddf2fb97bd3cf3362a98b103a6f3852a67',
        description: 'Wallet address for receiving deposits'
      });
    }

    // Get QR code URL
    let depositQrUrl = await Settings.findOne({ key: 'depositQrUrl' });
    
    // Get daily reward limits
    let minDailyReward = await Settings.findOne({ key: 'minDailyReward' });
    let maxDailyReward = await Settings.findOne({ key: 'maxDailyReward' });
    
    // Get withdrawal lock settings
    let withdrawLockAmount = await Settings.findOne({ key: 'withdrawLockAmount' });
    let withdrawLockDays = await Settings.findOne({ key: 'withdrawLockDays' });

    res.json({
      depositWallet: depositWallet.value,
      depositQrUrl: depositQrUrl?.value || '',
      minDailyReward: minDailyReward?.value || 0.5,
      maxDailyReward: maxDailyReward?.value || 0.8,
      withdrawLockAmount: withdrawLockAmount?.value || 65,
      withdrawLockDays: withdrawLockDays?.value || 90,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
