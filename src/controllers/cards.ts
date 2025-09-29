import { Request as ExpressRequest, Response, NextFunction } from 'express';
import Card from '../models/card';
import { IUser } from '../models/user';

const urlRegex = /^https?:\/\/(www\.)?[\w-]+\.[\w]{2,}([-._~:/?#[\]@!$&'()*+,;=/]*#?)?$/;

class BadRequestError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 400;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export const getCards = async (_req: ExpressRequest, res: Response, next: NextFunction) => {
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
    return res.status(200).send(formattedCards);
  } catch (err) {
    return next(err);
  }
};

export const createCard = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { name, link } = req.body;
    if (typeof name !== 'string' || name.length < 2 || name.length > 30) {
      throw new BadRequestError('Переданы некорректные данные при создании карточки');
    }
    if (typeof link !== 'string' || !urlRegex.test(link)) {
      throw new BadRequestError('Переданы некорректные данные при создании карточки');
    }
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
      return next(new BadRequestError('Переданы некорректные данные при создании карточки'));
    }
    return next(err);
  }
};

export const deleteCard = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) {
      const error = new Error('Карточка не найдена');
      (error as any).status = 404;
      throw error;
    }
    if (card.owner.toString() !== req.user?._id) {
      const error = new Error('Нет прав на удаление этой карточки');
      (error as any).status = 403;
      throw error;
    }
    await card.deleteOne();
    return res.status(200).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err) {
    return next(err);
  }
};

export const likeCard = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      const error = new Error('Карточка не найдена');
      (error as any).status = 404;
      throw error;
    }
    return res.status(200).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err) {
    return next(err);
  }
};

export const dislikeCard = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user?._id } },
      { new: true },
    );
    if (!card) {
      const error = new Error('Карточка не найдена');
      (error as any).status = 404;
      throw error;
    }
    return res.status(200).send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      createdAt: card.createdAt,
      _id: card._id,
    });
  } catch (err) {
    return next(err);
  }
};
