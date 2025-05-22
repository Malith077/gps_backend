import { buildSchema } from 'graphql';
import { GPSDataModel } from '../schema/GPSDataSchema';
import { Query } from 'mongoose';

export const typeDefs = `
    type Query {
        getGPSData: [GPSData]
        getGPSDataByDateRange(startDate: String!, endDate: String!): [GPSData]
    }

    type GPSData {
        lat: Float
        lng: Float
        timestamp: String
    }
`

interface DateRangeArgs {
  startDate: string;
  endDate: string;
}


export const resolvers = {
    Query:{
        getGPSData: async () => {
            try {
                const gpsData = await GPSDataModel.find();
                return gpsData;
            }
            catch (error) {
                throw new Error('Error fetching GPS data'); 
            }
        },
        getGPSDataByDateRange: async ( parent:unknown, args: DateRangeArgs ) =>{
        try{
            const { startDate, endDate } = args;
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
    }
}
