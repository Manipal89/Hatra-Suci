import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import Transaction from '../models/Transaction.js';
import Settings from '../models/Settings.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.balance = req.body.balance !== undefined ? req.body.balance : user.balance;
      user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all deposits
// @route   GET /api/admin/deposits
// @access  Private/Admin
export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject deposit
// @route   PUT /api/admin/deposits/:id
// @access  Private/Admin
export const updateDeposit = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    // Registration deposits should be handled by verifyRegistrationDeposit endpoint
    if (deposit.isRegistrationDeposit) {
      return res.status(400).json({ 
        message: 'Registration deposits must be verified through the registration verification endpoint' 
      });
    }

    deposit.status = status;
    deposit.adminNotes = adminNotes || deposit.adminNotes;
    deposit.approvedBy = req.user._id;
    deposit.approvedAt = new Date();

    await deposit.save();

    // Update user balance if approved (regular deposits only)
    if (status === 'approved') {
      const user = await User.findById(deposit.user);
      user.balance += deposit.amount;
      user.totalDeposits += deposit.amount;
      await user.save();

      // Update transaction
      await Transaction.findOneAndUpdate(
        { user: deposit.user, type: 'deposit', amount: deposit.amount, status: 'pending' },
        { status: 'completed', processedBy: req.user._id, processedAt: new Date() }
      );
    } else if (status === 'rejected') {
      // Update transaction
      await Transaction.findOneAndUpdate(
        { user: deposit.user, type: 'deposit', amount: deposit.amount, status: 'pending' },
        { status: 'rejected', processedBy: req.user._id, processedAt: new Date() }
      );
    }

    res.json(deposit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all withdrawals
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject withdrawal
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
export const updateWithdrawal = async (req, res) => {
  try {
    const { status, transactionHash, adminNotes } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = status;
    withdrawal.transactionHash = transactionHash || withdrawal.transactionHash;
    withdrawal.adminNotes = adminNotes || withdrawal.adminNotes;
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();

    await withdrawal.save();

    // If rejected, return balance to user
    if (status === 'rejected') {
      const user = await User.findById(withdrawal.user);
      user.balance += withdrawal.amount;
      await user.save();

      await Transaction.findOneAndUpdate(
        { user: withdrawal.user, type: 'withdrawal', amount: withdrawal.amount, status: 'pending' },
        { status: 'rejected', processedBy: req.user._id, processedAt: new Date() }
      );
    } else if (status === 'approved') {
      const user = await User.findById(withdrawal.user);
      user.totalWithdrawals += withdrawal.amount;
      await user.save();

      await Transaction.findOneAndUpdate(
        { user: withdrawal.user, type: 'withdrawal', amount: withdrawal.amount, status: 'pending' },
        { status: 'completed', transactionHash, processedBy: req.user._id, processedAt: new Date() }
      );
    }

    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalDeposits = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = await Withdrawal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending', isRegistrationDeposit: { $ne: true } });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingRegistrations = await Deposit.countDocuments({ status: 'pending', isRegistrationDeposit: true });

    res.json({
      totalUsers,
      activeUsers,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      pendingDeposits,
      pendingWithdrawals,
      pendingRegistrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    let setting = await Settings.findOne({ key });

    if (setting) {
      setting.value = value;
      setting.description = description || setting.description;
      await setting.save();
    } else {
      setting = await Settings.create({ key, value, description });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending registration deposits
// @route   GET /api/admin/registration-deposits
// @access  Private/Admin
export const getPendingRegistrations = async (req, res) => {
  try {
    const deposits = await Deposit.find({ 
      isRegistrationDeposit: true,
      status: 'pending'
    })
      .populate('user', 'username email isActive')
      .sort({ createdAt: -1 });

    res.json(deposits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify registration deposit
// @route   PUT /api/admin/registration-deposits/:id
// @access  Private/Admin
export const verifyRegistrationDeposit = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: 'Registration deposit not found' });
    }

    if (!deposit.isRegistrationDeposit) {
      return res.status(400).json({ message: 'This is not a registration deposit' });
    }

    deposit.status = status;
    deposit.adminNotes = adminNotes || deposit.adminNotes;
    deposit.approvedBy = req.user._id;
    deposit.approvedAt = new Date();

    await deposit.save();

    const user = await User.findById(deposit.user);

    if (status === 'approved') {
      // Activate user account and credit balance
      user.isActive = true;
      user.registrationDepositVerified = true;
      user.balance += deposit.amount;
      user.totalDeposits += deposit.amount;
      await user.save();

      // Activate the referral relationship
      const Referral = (await import('../models/Referral.js')).default;
      await Referral.updateOne(
        { referred: deposit.user },
        { isActive: true }
      );
      
      // Get the referrer and automatically process their level rewards
      const referral = await Referral.findOne({ referred: deposit.user });
      if (referral && referral.referrer) {
        // Import and call the level rewards processing function
        const { processLevelRewards } = await import('./userController.js');
        await processLevelRewards(referral.referrer);
      }

      // Create transaction record
      await Transaction.findOneAndUpdate(
        { user: deposit.user, type: 'deposit', amount: deposit.amount, status: 'pending' },
        { status: 'completed', processedBy: req.user._id, processedAt: new Date() }
      );
    } else if (status === 'rejected') {
      // Keep user inactive and referral inactive
      user.isActive = false;
      user.registrationDepositVerified = false;
      await user.save();
      
      // Ensure referral stays inactive
      const Referral = (await import('../models/Referral.js')).default;
      await Referral.updateOne(
        { referred: deposit.user },
        { isActive: false }
      );

      // Update transaction
      await Transaction.findOneAndUpdate(
        { user: deposit.user, type: 'deposit', amount: deposit.amount, status: 'pending' },
        { status: 'rejected', processedBy: req.user._id, processedAt: new Date() }
      );
    }

    res.json(deposit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Credit bonus to user
// @route   POST /api/admin/bonus
// @access  Private/Admin
export const creditBonus = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid userId and positive amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user balance
    user.balance += amount;
    await user.save();

    // Create bonus transaction
    await Transaction.create({
      user: userId,
      type: 'bonus',
      amount,
      status: 'completed',
      description: description || `Admin bonus: $${amount.toFixed(2)}`,
      processedBy: req.user._id,
      processedAt: new Date(),
    });

    res.json({
      message: 'Bonus credited successfully',
      newBalance: user.balance,
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
