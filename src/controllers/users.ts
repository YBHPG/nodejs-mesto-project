import { Request as ExpressRequest, Response, NextFunction } from 'express';
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

export const getUsers = async (_req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    res.status(200).send(users.map(formatUser));
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      const error = new Error('Запрашиваемый пользователь не найден');
      (error as any).status = 404;
      throw error;
    }
    res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'CastError') {
      const error = new Error('Передан некорректный _id пользователя');
      (error as any).status = 400;
      next(error);
    } else {
      next(err);
    }
  }
};

export const createUser = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name = 'Жак-Ив Кусто',
      about = 'Исследователь',
      avatar = 'https://pictures.s3.yandex.net/resources/avatar_1604080799.jpg',
      email,
      password,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, about, avatar, email, password: hashedPassword,
    });
    res.status(201).send(formatUser(
      user,
    ));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      const error = new Error('Переданы некорректные данные при создании пользователя');
      (error as any).status = 400;
      next(error);
    } else if (err.code === 11000) {
      const error = new Error('Пользователь с таким email уже существует');
      (error as any).status = 409;
      next(error);
    } else {
      next(err);
    }
  }
};

export const updateProfile = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      (req as any).user?._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      const error = new Error('Пользователь не найден');
      (error as any).status = 404;
      throw error;
    }
    res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      const error = new Error('Переданы некорректные данные при обновлении профиля');
      (error as any).status = 400;
      next(error);
    } else {
      next(err);
    }
  }
};

export const updateAvatar = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      (req as any).user?._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!user) {
      const error = new Error('Пользователь не найден');
      (error as any).status = 404;
      throw error;
    }
    res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      const error = new Error('Переданы некорректные данные при обновлении аватара');
      (error as any).status = 400;
      next(error);
    } else {
      next(err);
    }
  }
};

export const login = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email и пароль обязательны');
      (error as any).status = 400;
      throw error;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      const error = new Error('Неправильные почта или пароль');
      (error as any).status = 401;
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error('Неправильные почта или пароль');
      (error as any).status = 401;
      throw error;
    }

    const secret = NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret';

    const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: true,
    });

    res.status(200).send({ token });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user?._id);
    if (!user) {
      const error = new Error('Пользователь не найден');
      (error as any).status = 404;
      throw error;
    }
    res.status(200).send(formatUser(user));
  } catch (err) {
    next(err);
  }
};
