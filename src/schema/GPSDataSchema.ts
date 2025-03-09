import { Schema, model } from "mongoose"

const GPSDataSchema = new Schema({
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});

export const GPSDataModel = model('GPSData', GPSDataSchema);