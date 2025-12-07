# Use an official Node.js runtime as a parent image.
# Using Node.js 18 as specified in package.json engines.
FROM node:18-slim as base

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install production dependencies.
RUN npm ci --only=production

# Copy the rest of the application's source code.
COPY . .

# Cloud Run injects the PORT environment variable.
EXPOSE 8080

# Define the command to run your app.
# Use "npm start" which is defined in package.json
CMD [ "npm", "start" ]