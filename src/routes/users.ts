import { Router } from 'express';
import { validateUserIdParam, validateUpdateProfile, validateUpdateAvatar } from '../middlewares/validateUser';
import {
  getUsers, getUserById, updateProfile, updateAvatar, getCurrentUser,
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/me', getCurrentUser); // новый роут
router.get('/:userId', validateUserIdParam, getUserById);
router.patch('/me', validateUpdateProfile, updateProfile);
router.patch('/me/avatar', validateUpdateAvatar, updateAvatar);

export default router;
