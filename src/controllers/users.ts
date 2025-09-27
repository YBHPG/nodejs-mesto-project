import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user';

const { NODE_ENV, JWT_SECRET = 'dev-secret' } = process.env;

const formatUser = (user: any) => ({
  name: user.name,
  about: user.about,
  avatar: user.avatar,
  _id: user._id,
});

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    const formattedUsers = users.map(formatUser);
    res.status(200).send(formattedUsers);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next({ status: 404, message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'CastError') {
      return next({ status: 400, message: 'Передан некорректный _id пользователя' });
    }
    return next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about, avatar } = req.body;
    const user = await User.create({ name, about, avatar });
    return res.status(201).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next({ status: 400, message: 'Переданы некорректные данные при создании пользователя' });
    }
    // Проверка на ошибку дублирующего email (code 11000)
    if (err.code === 11000) {
      return next({ status: 409, message: 'Пользователь с таким email уже существует' });
    }
    return next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      return next({ status: 404, message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next({ status: 400, message: 'Переданы некорректные данные при обновлении профиля' });
    }
    return next(err);
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!user) {
      return next({ status: 404, message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next({ status: 400, message: 'Переданы некорректные данные при обновлении аватара' });
    }
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя по email с возвратом пароля
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next({ status: 401, message: 'Неправильные почта или пароль' });
    }

    // Проверяем пароль
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return next({ status: 401, message: 'Неправильные почта или пароль' });
    }

    // Генерируем JWT
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' },
    );

    // Отправляем токен в httpOnly cookie
    return res
      .cookie('jwt', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // неделя
        sameSite: true,
      })
      .send({ token }); // Можно отправить токен также в теле ответа
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return next({ status: 404, message: 'Пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    return next(err);
  }
};
