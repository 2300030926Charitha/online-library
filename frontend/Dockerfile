# Step 1: Build the app
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Build the Vite app
RUN npm run build

# Step 2: Serve the app
FROM nginx:alpine

# Copy the built files from the build stage to the Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
