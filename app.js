import http from 'http';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import { config as dotenv } from 'dotenv';
import router from './src/routes.js';
import OpenAI from 'openai';
import { loadExistingClients } from './modules/whatsapp.js';
import winston from 'winston';
import logger from 'morgan';
dotenv();

const app = express();

app.use(express.json());

// Configuración de middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuración de OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Configura el logger para semdMessage
export const loggerWinston = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Establecer la ubicación de las vistas
// Obtén el directorio actual
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
// export const __dirname = path.dirname(new URL(import.meta.url).pathname).substring(1);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', ejs);

// Crear el directorio y archivo de log si no existen
const logsDir = path.join(__dirname, 'logs');
const logFile = path.join(logsDir, 'traccess.log');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
}

// // Configuración de Morgan para registro de solicitudes
// app.use(morgan('combined', { stream: fs.createWriteStream(path.join(__dirname, 'logs/traccess.log'), { flags: 'a' }) }));
// app.use(logger('dev'));

// Configuración de Morgan para registro de solicitudes
app.use(morgan('combined', { stream: fs.createWriteStream(logFile, { flags: 'a' }) }));
app.use(logger('dev'));

const SESSIONS_PATH = path.resolve(__dirname, '../');


// Cargar routers
app.use('/api', router);

// Función para cargar los clientes existentes al iniciar la aplicación
loadExistingClients();

// Middleware para manejar errores 404
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', { message: err.message });
});

export default app;