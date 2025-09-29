import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import errorHandler from './middlewares/errorHandler';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
  const log = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
  };
  fs.appendFileSync('request.log', JSON.stringify(log) + '\n');
  next();
});

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('Успешное подключение к MongoDB');
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err);
  });

// Открытые маршруты
app.post('/signin', login);
app.post('/signup', createUser);

// Защищённые маршруты
app.use(auth); // авторизация для всех маршрутов ниже

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.use((err: any, _req: express.Request, _res: express.Response, next: express.NextFunction) => {
  const errorLog = {
    time: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
  };
  fs.appendFileSync('error.log', JSON.stringify(errorLog) + '\n');
  next(err);
});
app.use(errorHandler);

app.get('/', (_req, res) => {
  res.send('Сервер работает!');
});


app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});