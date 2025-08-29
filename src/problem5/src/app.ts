import express, { Application } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db';
import rountes from './routes';
import { logger } from './middleware/logger.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(logger);
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     description: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Returns healthy status
 */
app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api', rountes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
});
