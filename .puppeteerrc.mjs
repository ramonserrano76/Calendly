import path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { __dirname } from './app.js'; 
/**
 * @type {import("puppeteer").Configuration}
 */

// Define la ruta de la caché
const cacheDirectory = path.join(__dirname, '.cache', 'puppeteer');

// Crea la carpeta de caché si no existe
if (!existsSync(cacheDirectory)) {
    mkdirSync(cacheDirectory, { recursive: true });
}

const puppeteerConfig = {
    // Cambia la ubicación de la caché para Puppeteer
    cacheDirectory: cacheDirectory,
};

export default puppeteerConfig;