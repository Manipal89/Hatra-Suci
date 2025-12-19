import express from 'express';
import {
  createDeposit,
  getDeposits,
  createWithdrawal,
  getWithdrawals,
  getTransactions,
  getReferrals,
  spinWheel,
  checkLevelRewards,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/deposits')
  .get(protect, getDeposits)
  .post(protect, createDeposit);

router.route('/withdrawals')
  .get(protect, getWithdrawals)
  .post(protect, createWithdrawal);

router.get('/transactions', protect, getTransactions);
router.get('/referrals', protect, getReferrals);
router.post('/spin-wheel', protect, spinWheel);
router.post('/level-rewards/check', protect, checkLevelRewards);

export default router;
