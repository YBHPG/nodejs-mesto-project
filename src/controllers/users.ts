import { Request, Response } from 'express';
import User from '../models/user';

const formatUser = (user: any) => ({
  name: user.name,
  about: user.about,
  avatar: user.avatar,
  _id: user._id,
});

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({});
    const formattedUsers = users.map(formatUser);
    res.status(200).send(formattedUsers);
  } catch (err) {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({ message: 'Передан некорректный _id пользователя' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, about, avatar } = req.body;
    const user = await User.create({ name, about, avatar });
    return res.status(201).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
    }
    return res.status(200).send(formatUser(user));
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};
