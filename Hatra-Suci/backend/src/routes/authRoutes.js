import express from 'express';
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  submitRegistrationDeposit,
  getPublicSettings,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/registration-deposit', submitRegistrationDeposit);
router.get('/settings', getPublicSettings);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
