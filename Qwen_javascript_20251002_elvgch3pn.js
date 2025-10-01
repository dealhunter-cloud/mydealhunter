// package.json
{
  "name": "dealhunter-telegram-bot",
  "version": "1.0.0",
  "description": "AI Shopping Bot for Telegram - @my_dealhunter_bot",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-telegram-bot-api": "^0.64.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}