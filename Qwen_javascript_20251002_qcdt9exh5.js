// server.js
require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  webhook: true
});

// Mock deals database (in production, replace with real API calls)
const mockDeals = {
  'laptop': [
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
    },
    {
      id: 'laptop_2',
      name: 'Dell XPS 13',
      price: '$799.99',
      originalPrice: '$999.99',
      discount: '20% OFF',
      rating: 4.7,
      reviews: 1823,
      store: 'Dell',
      region: 'Global',
      afterSales: '1-year warranty + support',
      delivery: 'Free shipping',
      purchaseUrl: 'https://dell.com/xps13'
    }
  ],
  'phone': [
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
    },
    {
      id: 'phone_2',
      name: 'Samsung Galaxy S24',
      price: '$799.99',
      originalPrice: '$899.99',
      discount: '11% OFF',
      rating: 4.7,
      reviews: 2845,
      store: 'Samsung',
      region: 'Global',
      afterSales: '2-year warranty',
      delivery: 'Next day delivery',
      purchaseUrl: 'https://samsung.com/galaxy-s24'
    }
  ],
  'headphones': [
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
  ],
  'tv': [
    {
      id: 'tv_1',
      name: 'Samsung 65" QLED 4K',
      price: '$799.99',
      originalPrice: '$1,299.99',
      discount: '38% OFF',
      rating: 4.7,
      reviews: 1823,
      store: 'Samsung',
      region: 'USA/EU',
      afterSales: '3-year warranty + installation',
      delivery: 'Next day delivery available',
      purchaseUrl: 'https://samsung.com/qled-tv'
    }
  ],
  'default': [
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
  ]
};

// Helper function to format deal message
function formatDealMessage(deal) {
  return `
🛒 *${deal.name}*
💰 *Price:* ${deal.price} ${deal.originalPrice ? `(~~${deal.originalPrice}~~ ${deal.discount})` : ''}
⭐ *Rating:* ${deal.rating}/5 (${deal.reviews} reviews)
🏪 *Store:* ${deal.store}
🌍 *Region:* ${deal.region}
🛠️ *After-sales:* ${deal.afterSales}
🚚 *Delivery:* ${deal.delivery}

_Select this deal to get your secure purchase link!_
  `;
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  const welcomeMessage = `
👋 *Welcome to DEALHUNTER!* 🛍️

I'm your AI shopping assistant that finds the best deals worldwide based on:
• 💰 Lowest prices
• ⭐ Best customer reviews  
• 🛠️ Excellent after-sales service

*Just tell me what you're looking for!*

Examples:
• "laptops"
• "smartphones" 
• "headphones"
• "tv"
• "gaming console"

I'll find the best deals across global e-commerce stores and provide you with secure purchase links!

*Happy hunting!* 🎯
  `;
  
  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
🆘 *DEALHUNTER Help*

*How to use:*
1. Simply type what you want to find deals on
2. I'll show you the best options with prices, reviews, and after-sales info
3. Click "Get Purchase Link" to buy securely

*Supported searches:*
• Electronics (laptops, phones, headphones, tv)
• Home appliances
• Fashion items
• Services (streaming, software)

*Features:*
✅ Global price comparison
✅ Customer review analysis
✅ After-sales service evaluation
✅ Secure direct purchase links
✅ Regional shopping support

*Bot:* @${process.env.BOT_USERNAME}
  `;
  
  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Handle all text messages (search queries)
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const query = msg.text.toLowerCase().trim();
    
    // Show searching message
    await bot.sendMessage(chatId, `🔍 *Searching for the best deals on "${query}"...*`, { parse_mode: 'Markdown' });
    
    // Find relevant deals (simple keyword matching)
    let deals = [];
    let foundCategory = false;
    
    for (const [category, categoryDeals] of Object.entries(mockDeals)) {
      if (query.includes(category) || category.includes(query)) {
        deals = categoryDeals;
        foundCategory = true;
        break;
      }
    }
    
    if (!foundCategory) {
      // Try to find partial matches
      const allDeals = Object.values(mockDeals).flat();
      deals = allDeals.filter(deal => 
        deal.name.toLowerCase().includes(query) ||
        deal.store.toLowerCase().includes(query)
      );
      
      if (deals.length === 0) {
        deals = mockDeals.default;
      }
    }
    
    // Send deals
    if (deals.length > 0) {
      for (const deal of deals.slice(0, 3)) { // Limit to 3 deals
        const options = {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔗 Get Purchase Link', callback_data: `purchase_${deal.id}` }]
            ]
          }
        };
        
        await bot.sendMessage(chatId, formatDealMessage(deal), options);
      }
      
      // Ask if they need help
      await bot.sendMessage(chatId, 
        '🤔 *Need help choosing?* Just ask me questions about any deal, or tell me your specific requirements (budget, features, region, etc.)!',
        { parse_mode: 'Markdown' }
      );
    } else {
      await bot.sendMessage(chatId, 
        `Sorry, I couldn't find any deals for "${query}". Try searching for something else like "laptops", "phones", or "headphones"!`
      );
    }
  }
});

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  try {
    if (data.startsWith('purchase_')) {
      const dealId = data.split('_')[1];
      
      // Find the deal
      let selectedDeal = null;
      for (const deals of Object.values(mockDeals)) {
        selectedDeal = deals.find(deal => deal.id === dealId);
        if (selectedDeal) break;
      }
      
      if (selectedDeal) {
        const purchaseMessage = `
✅ *Perfect Choice!*

Here's your secure purchase link for:
*${selectedDeal.name}*

💰 *Final Price:* ${selectedDeal.price}
⭐ *Rating:* ${selectedDeal.rating}/5 (${selectedDeal.reviews} reviews)
🏪 *Store:* ${selectedDeal.store}

🔗 *Secure Purchase Link:*
${selectedDeal.purchaseUrl}

*Your transaction happens directly with the store - completely secure!* 🛡️
        `;
        
        await bot.sendMessage(chatId, purchaseMessage, { parse_mode: 'Markdown' });
      } else {
        await bot.sendMessage(chatId, 'Sorry, this deal is no longer available.');
      }
    }
    
    // Acknowledge the callback
    await bot.answerCallbackQuery(callbackQuery.id);
    
  } catch (error) {
    console.error('Callback error:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Error processing request' });
  }
});

// Set up webhook
const webhookUrl = process.env.WEBHOOK_URL || `https://${process.env.RAILWAY_STATIC_URL || 'your-domain.com'}/webhook`;
bot.setWebhook(webhookUrl);

// Routes
app.post('/webhook', (req, res) => {
  // Telegram will send webhook updates here
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    bot: 'DEALHUNTER active',
    username: `@${process.env.BOT_USERNAME}`,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'DEALHUNTER Telegram Bot is running!',
    bot_username: `@${process.env.BOT_USERNAME}`,
    add_to_telegram: `https://t.me/${process.env.BOT_USERNAME}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DEALHUNTER bot server running on port ${PORT}`);
  console.log(`🤖 Bot: @${process.env.BOT_USERNAME}`);
  console.log(`🔗 Webhook URL: ${webhookUrl}`);
});

module.exports = app;