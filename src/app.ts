import express from 'express';
import mongoose from 'mongoose';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('Успешное подключение к MongoDB');
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err);
  });

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);


app.get('/', (_req, res) => {
  res.send('Сервер работает!');
});
app.use((req, res, next) => {
  req.user = {
    _id: '68d6d260e69103e0c7288ae7'
  };

  next();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});