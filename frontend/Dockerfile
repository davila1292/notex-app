# Use an official Node.js runtime as a parent image.
# Using a slim version for a smaller final image size.
FROM node:18-slim

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
# This is done first to leverage Docker's layer caching.
COPY package*.json ./

# Install application dependencies.
RUN npm install

# Copy the rest of the application's source code.
COPY . .

# Make port 8080 available to the world outside this container.
EXPOSE 8080

# Define the command to run your app.
CMD [ "npm", "start" ]