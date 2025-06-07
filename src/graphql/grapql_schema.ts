import { GPSDataModel } from '../schema/GPSDataSchema';

import { PubSub } from 'graphql-subscriptions'


export const pubsub = new PubSub();
export const GPS_DATA_ADDED = 'GPS_DATA_ADDED';


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

    type Subscription {
        gpsDataAdded: GPSData
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
    },
    Subscription: {
        gpsDataAdded: {
            subscribe: () => pubsub.asyncIterableIterator(GPS_DATA_ADDED)
        }
  }
}
