import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import adminMiddleware from './src/middleware/adminAuth';
import errorHandler from './src/middleware/errorHandler';
import userMiddleware from './src/middleware/userAuth';
import adminRoutes from './src/routes/admin';
import caretakerRoutes from './src/routes/caretaker';
import publicRoutes from './src/routes/public';
import userRoutes from './src/routes/user';


dotenv.config();
require('./src/config/sequelize');

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(cors());
app.use(bodyParser.json());
app.use('/api', publicRoutes);
app.use('/api/user', userMiddleware, userRoutes);
app.use('/api/caretaker', userMiddleware, caretakerRoutes);
app.use('/api/admin', userMiddleware, adminMiddleware, adminRoutes);
app.use(errorHandler);

global.__basedir = __dirname;
app.use(express.urlencoded({ extended: true }));
module.exports = app;
