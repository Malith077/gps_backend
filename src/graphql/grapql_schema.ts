import { buildSchema } from 'graphql';
import { GPSDataModel } from '../schema/GPSDataSchema';

export const schema = buildSchema(`
    type GPSData {
        lat: Float
        lng: Float
        timestamp: String
    }
    
    type Query {
        hello: String
        getGPSData: [GPSData]
        getGPSDataByDateRange(startDate: String!, endDate: String!): [GPSData]
    }
`);

export const rootResolver = {
    hello: () => 'Hello World',
    getGPSData: async () => {
        try{
            const gpsData = await GPSDataModel.find();
            return gpsData;
        } catch (error) {
            throw new Error('Error fetching GPS data');
        }
    },

    getGPSDataByDateRange: async ({startDate, endDate} : {startDate : string, endDate : string }) =>{
        try{
            const start = new Date(startDate);
            const end = new Date(endDate);
            const gpsData = await GPSDataModel.find({
                timestamp:{
                    $gte: start,
                    $lt: end
                }
            });
            return gpsData;
        }
        catch (error){
            throw new Error('Error fetching GPS data');
        }
    }
}; 