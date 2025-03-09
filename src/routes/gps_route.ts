import { Router } from 'express';
import { GPSDataModel } from '../schema/GPSDataSchema';

const router = Router();

// Middleware to handle aborted requests
router.use((req, res, next) => {
    req.on('aborted', () => {
        res.status(400).send('Request was aborted by the client');
    });
    next();
});

router.post('/', async (req, res) => {
    try {
        const { lat, lng, timestamp } = req.body;
        const gpsData = new GPSDataModel({
            lat,
            lng,
            timestamp
        });
        await gpsData.save();
        res.status(201).send('GPS Data saved');
    } catch (error) {
        res.status(500).send('Error saving GPS Data');
    }
});

export default router;