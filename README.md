# GPS Backend Project

A TypeScript Express application that provides GPS data storage and retrieval through REST API and GraphQL endpoints.

## Project Overview

This backend service allows storing GPS location data points and querying them through both REST API and GraphQL interfaces. The data is persisted in MongoDB.

## Project Structure

├── src/ │ ├── app.ts # Main application entry point │ ├── controllers/ # HTTP request controllers │ ├── graphql/ # GraphQL schema and resolvers │ ├── routes/ # Express API route definitions │ ├── schema/ # MongoDB schema definitions │ ├── types/ # TypeScript type definitions │ └── utils/ # Utility functions


## Features

- REST API for storing GPS data points
- GraphQL API for querying GPS data
- MongoDB integration for data persistence

## API Documentation

### REST API

#### POST /gps-data
Stores a new GPS data point.

Request body:
```json
{
  "lat": 12.345,
  "lng": 67.890,
  "timestamp": "2023-01-01T12:00:00.000Z"
}

GraphQL API
Available at /graphql with the following operations:

Queries
hello: Returns a greeting message
getGPSData: Returns all GPS data points
getGPSDataByDateRange(startDate, endDate): Returns GPS data within the specified time range
Example query:

{
  getGPSDataByDateRange(startDate: "2023-01-01", endDate: "2023-01-31") {
    lat
    lng
    timestamp
  }
}

