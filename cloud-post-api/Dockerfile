# Use the official Node.js image as the base image
FROM node:24.15

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN yarn prisma generate
RUN npm run build

# Expose the application port
EXPOSE 3000

# Run Prisma migrations in production before starting the API.
# Local development keeps using the existing compose/local setup.
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npx prisma migrate deploy; fi && node dist/main"]