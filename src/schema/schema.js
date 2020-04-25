const graphql = require('graphql');
import { Trip } from '../resources/trip/trip.model'
import { GraphQLBoolean } from 'graphql';
import pubsub from './pubsub';

const {
  GraphQLObjectType, GraphQLString,
  GraphQLID, GraphQLInt, GraphQLSchema,
  GraphQLList, GraphQLNonNull, GraphQLInputObjectType
} = graphql;

const TripType = new GraphQLObjectType({
  name: 'Trip',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    dateStart: { type: GraphQLString },
    dateEnd: { type: GraphQLString },
    isConfirmed: { type: GraphQLBoolean },
    isEditing: { type: GraphQLBoolean }
  })
});

const queryTrips = new GraphQLObjectType({
  name: 'Queries',
  fields: {
    trips: {
      type: new GraphQLList(TripType),
      resolve(parent, args) {
        return Trip.find({});
      }
    }
  }
});

// resolve: (Trip) => Trip,
const subscriptionTrips = new GraphQLObjectType({
  name: 'Subscriptions',
  description: 'Root Subscription',
  fields: {
    newTrip: {
      type: TripType,
      subscribe: () => pubsub.asyncIterator('newTrip'),
      resolve: Trip,
    },
    deleteTrip: {
      type: TripType,
      subscribe: () => pubsub.asyncIterator('deleteTrip'),
      resolve: Trip,
    }
  }
})

const mutationTrips = new GraphQLObjectType({
  name: 'Mutations',
  description: 'insert and delete trips',
  fields: {
    addTrip: {
      type: TripType,
      args: {
        name: { type: GraphQLString },
        dateStart: { type: GraphQLString },
        dateEnd: { type: GraphQLString },
        isConfirmed: { type: GraphQLBoolean },
        isEditing: { type: GraphQLBoolean }
      },
      resolve(parent, args) {
        let trip = new Trip({
          name: args.name,
          dateStart: args.dateStart,
          dateEnd: args.dateEnd,
          isConfirmed: args.isConfirmed,
          isEditing: args.isEditing,
          createdBy: "5db474847f4fcf269336d3de"
        });
        console.log('newTrip!!!!')
        pubsub.publish('newTrip', trip);
        return trip.save();
      }
    },
    deleteTrip: {
      type: TripType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve(parent, args) {
        console.log(JSON.stringify(args.id))
        const id = args.id
        Trip.findOne( { _id:id }, function(err,obj) { 
          pubsub.publish('deleteTrip', obj);
        } ).exec();
        // console.log(JSON.stringify(Tripa))
        let TripId = Trip.findByIdAndRemove(id).exec();
        return TripId;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: queryTrips,
  mutation: mutationTrips,
  subscription: subscriptionTrips
});