# 1. Base image use karein (Node.js)
FROM node:18-alpine

# 2. Folder banayein container ke andar
WORKDIR /app

# 3. Dependencies copy karein
COPY package*.json ./

# 4. Libraries install karein
RUN npm install

# 5. Sara code copy karein
COPY . .

# 6. Project build karein
RUN npm run build

# 7. Port batayein (Next.js default 3000 use karta hai)
EXPOSE 3000

# 8. App start karne ki command
CMD ["npm", "start"]