import { Request, Response } from 'express';

const errorHandler = (err: any, _req: Request, res: Response) => {
  if (err.code === 11000) {
    return res.status(409).send({ message: 'Пользователь с таким email уже существует' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: 'Переданы некорректные данные' });
  }

  if (err.name === 'CastError') {
    return res.status(400).send({ message: 'Некорректный идентификатор' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).send({ message: 'Некорректный токен' });
  }

  // Если не удалось определить тип ошибки — отдаем 500
  return res.status(500).send({ message: 'На сервере произошла ошибка' });
};

export default errorHandler;
