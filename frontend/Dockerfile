# Use a lightweight Nginx image as the base
FROM nginx:alpine

# Copy your static website files (HTML, CSS, JS) into the default Nginx public directory
COPY . /usr/share/nginx/html

# Tell Google Cloud that the container will listen on port 80
EXPOSE 80

# The default command for the nginx image is to start the server.
# This makes sure it runs in the foreground, which is required by Cloud Run.
CMD ["nginx", "-g", "daemon off;"]