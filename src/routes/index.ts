import { Router } from 'express';
import IndexController from '../controllers';
import gpsRouter from './gps_route';
import healthRouter from './health';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: any) {
    app.use('/', router);
    router.get('/', indexController.getIndex.bind(indexController));

    app.use('/gps-data', gpsRouter);
    app.use('/health', healthRouter);
}