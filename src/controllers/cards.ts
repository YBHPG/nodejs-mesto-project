import { Request as ExpressRequest, Response } from 'express';
import Card from '../models/card';
import { IUser } from '../models/user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export const getCards = async (_req: ExpressRequest, res: Response) => {
  try {
    const cards = await Card.find({});
    const formattedCards = cards.map((card) => ({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    }));
    res.status(200).send(formattedCards);
  } catch (err) {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createCard = async (req: ExpressRequest, res: Response) => {
  try {
    const { name, link } = req.body;
    const owner = req.user?._id;
    const card = await Card.create({ name, link, owner });
    return res.status(201).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const deleteCard = async (req: ExpressRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findByIdAndDelete(cardId);
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    return res.status(200).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({ message: 'Передан некорректный _id карточки' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const likeCard = async (req: ExpressRequest, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    return res.status(200).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({ message: 'Передан некорректный _id карточки' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const dislikeCard = async (req: ExpressRequest, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    return res.status(200).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({ message: 'Передан некорректный _id карточки' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};
