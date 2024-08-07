import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import adminMiddleware from './src/middleware/adminAuth';
import companyMiddleware from './src/middleware/companyAuth';
import doctorMiddleware from './src/middleware/doctorAuth';
import errorHandler from './src/middleware/errorHandler';
import userMiddleware from './src/middleware/userAuth';
import adminRoutes from './src/routes/admin';
import caretakerRoutes from './src/routes/caretaker';
import commonRoutes from './src/routes/common';
import companyRoutes from './src/routes/company';
import doctorRoutes from './src/routes/doctor';
import publicRoutes from './src/routes/public';
import userRoutes from './src/routes/user';
const doseReminderCron = require('./src/cron/doseReminder');


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

app.use((req, res, next) => {
  console.log('[%s] URL -> %s', req.method, req.url);
  if (req.method.toLowerCase() == 'post') {
    console.log('BODY -> %s', req.body)
  }
  next();
});

doseReminderCron.initScheduledJobs();

app.use('/api', publicRoutes);
app.use('/api/common', userMiddleware, commonRoutes);
app.use('/api/user', userMiddleware, userRoutes);
app.use('/api/caretaker', userMiddleware, caretakerRoutes);
app.use('/api/admin', userMiddleware, adminMiddleware, adminRoutes);
app.use('/api/company', userMiddleware, companyMiddleware, companyRoutes);
app.use('/api/doctor', userMiddleware, doctorMiddleware, doctorRoutes);
app.use(errorHandler);

global.__basedir = __dirname;
app.use(express.urlencoded({ extended: true }));
module.exports = app;
