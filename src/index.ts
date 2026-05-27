import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load Environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route / Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'BM - Business Management Service API is running ✨',
  });
});

// Start Server only if this file is run directly (not imported in tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`[server]: API bounded and running at http://localhost:${port}`);
  });
}

export default app;