import { Request, Response, Router } from 'express';

const router = Router();

// Basic health check endpoint
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// More detailed health check with DB connection status
router.get('/detail', async (req: Request, res: Response) => {
  try {
    // You can add more detailed checks here (DB connection, etc.)
    const healthStatus = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage()
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;