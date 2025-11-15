FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy code
COPY . .

# Your server listens on 8082
EXPOSE 8082

CMD ["npm", "start"]
