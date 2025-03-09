// Mongodb Connection
import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/gps_data');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};