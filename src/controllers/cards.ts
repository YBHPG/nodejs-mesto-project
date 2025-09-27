import { Request as ExpressRequest, Response, NextFunction } from 'express';
import Card from '../models/card';
import { IUser } from '../models/user';

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
  } catch (err) {
    return next(err);
  }
};

export const deleteCard = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }
    if (card.owner.toString() !== req.user?._id) {
      return res.status(403).send({ message: 'Нет прав на удаление этой карточки' });
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
  } catch (err) {
    return next(err);
  }
};
