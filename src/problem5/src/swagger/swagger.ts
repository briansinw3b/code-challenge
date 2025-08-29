import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const API_PORT = process.env.PORT || 3000;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resource API',
      version: '1.0.0',
      description: 'A simple Express.js API for managing resource',
    },
  },
  apis: [
    './src/*.ts',
    './src/routes/*.ts',
    './src/dtos/*.ts',
    './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
