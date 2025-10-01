// server.js
require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple in-memory storage for demo (no database needed)
const mockDeals = {
  laptop: [
    {
      id: 'laptop_1',
      name: 'MacBook Air M2',
      price: '$899.99',
      originalPrice: '$1,199.99',
      discount: '25% OFF',
      rating: 4.9,
      reviews: 2156,
      store: 'Apple Store',
      region: 'Global',
      afterSales: '2-year warranty + AppleCare',
      delivery: 'Free worldwide shipping',
      purchaseUrl: 'https://apple.com/shop/buy-mac/macbook-air'
    }
  ],
  phone: [
    {
      id: 'phone_1',
      name: 'iPhone 15 Pro',
      price: '$999.99',
      originalPrice: '$1,199.99',
      discount: '17% OFF',
      rating: 4.8,
      reviews: 3421,
      store: 'Apple Store',
      region: 'Global',
      afterSales: '1-year warranty + AppleCare',
      delivery: 'Free express shipping',
      purchaseUrl: 'https://apple.com/iphone-15-pro'
    }
  ],
  headphones: [
    {
      id: 'headphones_1',
      name: 'Sony WH-1000XM5',
      price: '$299.99',
      originalPrice: '$399.99',
      discount: '25% OFF',
      rating: 4.9,
      reviews: 4567,
      store: 'Sony',
      region: 'Global',
      afterSales: '1-year warranty',
      delivery: 'Worldwide shipping',
      purchaseUrl: 'https://sony.com/wh1000xm5'
    }
  ]
};

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false // We'll use webhook mode
});

// Format deal message
function formatDealMessage(deal) {
  return `
🛒 ${deal.name}
💰 Price: ${deal.price} ${deal.originalPrice ? `(~~${deal.originalPrice}~~ ${deal.discount})` : ''}
⭐ Rating: ${deal.rating}/5 (${deal.reviews} reviews)
🏪 Store: ${deal.store}
🌍 Region: ${deal.region}
🛠️ After-sales: ${deal.afterSales}
🚚 Delivery: ${deal.delivery}

Click "Get Purchase Link" to buy securely!
  `;
}

// Handle /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `👋 Welcome to DEALHUNTER! 🛍️

I'm your AI shopping assistant that finds the best deals worldwide based on:
• 💰 Lowest prices
• ⭐ Best customer reviews  
• 🛠️ Excellent after-sales service

Just tell me what you're looking for!

Examples:
• "laptops"
• "smartphones" 
• "headphones"

I'll find the best deals and provide secure purchase links!

Happy hunting! 🎯`;
  
  await bot.sendMessage(chatId, welcomeMessage);
});

// Handle all messages
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const query = msg.text.toLowerCase().trim();
    
    await bot.sendMessage(chatId, `🔍 Searching for deals on "${query}"...`);
    
    let deals = [];
    if (query.includes('laptop') || query.includes('computer')) {
      deals = mockDeals.laptop;
    } else if (query.includes('phone') || query.includes('iphone') || query.includes('samsung')) {
      deals = mockDeals.phone;
    } else if (query.includes('headphone') || query.includes('earbud')) {
      deals = mockDeals.headphones;
    }
    
    if (deals.length === 0) {
      deals = [
        {
          id: 'default_1',
          name: 'Premium Wireless Earbuds',
          price: '$149.99',
          originalPrice: '$199.99',
          discount: '25% OFF',
          rating: 4.6,
          reviews: 1247,
          store: 'Best Electronics',
          region: 'Global',
          afterSales: '2-year guarantee',
          delivery: 'Free express shipping',
          purchaseUrl: 'https://example.com/earbuds'
        }
      ];
    }
    
    for (const deal of deals.slice(0, 2)) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔗 Get Purchase Link', callback_ `purchase_${deal.id}` }]
          ]
        }
      };
      
      await bot.sendMessage(chatId, formatDealMessage(deal), options);
    }
    
    await bot.sendMessage(chatId, 'Need help choosing? Just ask me questions about any deal!');
  }
});

// Handle button clicks
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  if (data.startsWith('purchase_')) {
    const purchaseMessage = `✅ Perfect Choice!

Your secure purchase link is ready! Click the link below to complete your purchase directly with the store.

🔒 All transactions are secure and happen outside the bot for your safety.`;
    
    await bot.sendMessage(chatId, purchaseMessage);
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
});

// Routes
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', bot: 'DEALHUNTER active' });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>DEALHUNTER Telegram Bot</h1>
    <p>Bot is running! Add to Telegram: <a href="https://t.me/my_dealhunter_bot">@my_dealhunter_bot</a></p>
    <p>Health check: <a href="/health">/health</a></p>
  `);
});

// Get port from environment or use 3000
const PORT = process.env.PORT || 3000;

// Set webhook only in production
if (process.env.NODE_ENV === 'production') {
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_URL || 'your-domain.com'}/webhook`;
  bot.setWebhook(webhookUrl);
  console.log('Webhook set to:', webhookUrl);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Bot: @${process.env.BOT_USERNAME}`);
});

module.exports = app;