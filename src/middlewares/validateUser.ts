import { Request, Response, NextFunction } from 'express';

const urlRegex = /^https?:\/\/(www\.)?[\w-]+\.[\w]{2,}([-._~:/?#[\]@!$&'()*+,;=/]*#?)?$/;

export const validateCreateUser = (req: Request, _res: Response, next: NextFunction) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (
    typeof name !== 'string' || name.length < 2 || name.length > 30
    || typeof about !== 'string' || about.length < 2 || about.length > 30
    || typeof avatar !== 'string' || !urlRegex.test(avatar)
    || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)
    || typeof password !== 'string' || password.length < 6
  ) {
    return next({ status: 400, message: 'Некорректные данные при создании пользователя' });
  }

  return next();
};

export const validateLogin = (req: Request, _res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (
    typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)
    || typeof password !== 'string' || password.length < 6
  ) {
    return next({ status: 400, message: 'Некорректные данные при входе' });
  }

  return next();
};

export const validateUserIdParam = (req: Request, _res: Response, next: NextFunction) => {
  const { userId } = req.params;

  if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
    return next({ status: 400, message: 'Некорректный _id пользователя' });
  }

  return next();
};

export const validateUpdateProfile = (req: Request, _res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  if (
    typeof name !== 'string' || name.length < 2 || name.length > 30
    || typeof about !== 'string' || about.length < 2 || about.length > 30
  ) {
    return next({ status: 400, message: 'Некорректные данные при обновлении профиля' });
  }
  return next();
};

export const validateUpdateAvatar = (req: Request, _res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  if (typeof avatar !== 'string' || !urlRegex.test(avatar)) {
    return next({ status: 400, message: 'Некорректный URL аватара' });
  }
  return next();
};
