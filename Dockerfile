# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the necessary files for dependency installation
COPY package.json . 
COPY . .

# Install Typescript globally
RUN yarn global add typescript

# Install dependencies using Yarn
RUN yarn install

# Build the TypeScript code
RUN yarn build

# Copy the entrypoint script and make it executable
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/wait-for-it.sh /usr/local/bin/entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Expose the port the app runs on
EXPOSE 8080
