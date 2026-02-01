Trading Journal 📈
A professional web-based trading journal application built with vanilla HTML, CSS, and JavaScript. Track, analyze, and improve your trading performance with detailed record-keeping, visualization, and insights.

🌟 Features
📊 Dashboard
Performance Overview: Real-time P&L tracking and win rate visualization

Interactive Charts: Cumulative profit/loss chart with multiple time periods (7D, 1M, 3M, 1Y, All)

Recent Trades: Quick glance at your latest trading activity

Statistics: Current streak, risk management score, and psychology score

📝 Trade Management
Add/Edit Trades: Comprehensive form with all trading details

Screenshot Upload: Attach multiple trade screenshots with compression

Strategy & Psychology: Record trading strategy and emotional state

Real-time P&L Calculation: Automatic profit/loss calculation as you type

📋 Trade History
Advanced Filtering: Filter by date range, asset, trade type, and status

Pagination: Navigate through your trades easily

CSV Export: Export filtered trades to CSV for external analysis

Image Gallery: View trade screenshots in a modal gallery

🎨 User Experience
Dark/Light Themes: Toggle between themes with persistent preferences

Responsive Design: Works perfectly on desktop, tablet, and mobile

Loading Screen: Smooth loading animation on startup

Accessibility: Keyboard navigation and screen reader support

💾 Data Management
Local Storage: All data stored locally in your browser

Data Backup: Export all data as JSON file

Data Restore: Import from previously backed up JSON files

Sample Data: Pre-loaded sample trades to get started quickly
📁 File Structure
text
trading-journal/
├── index.html          # Dashboard page
├── trades.html         # Trade history page
├── add-trade.html      # Add/edit trade page
├── style.css           # Main stylesheet
├── icon.css            # Icon styles and emoji mappings
├── storage.js          # Data management and local storage
├── app.js              # Dashboard functionality
├── trades.js           # Trade history functionality
└── add-trade.js        # Add/edit trade functionality
🔧 Technologies Used
HTML5: Semantic markup and structure

CSS3: Custom properties, Grid, Flexbox, animations

Vanilla JavaScript: ES6+ classes, modules, local storage API

Chart.js: Interactive data visualization

Local Storage: Client-side data persistence

File API: Screenshot upload and compression

📱 Browser Support
Chrome 60+ ✅

Firefox 55+ ✅

Safari 11+ ✅

Edge 79+ ✅

Mobile browsers ✅

🛠️ Customization
Themes
The app includes both light and dark themes. You can:

Toggle themes using the moon/sun button in the navigation

Modify colors in the :root and .dark-theme CSS variables

Add new themes by extending the theme system

Adding New Features
New Trade Fields: Add form fields in add-trade.html and update corresponding JavaScript

New Charts: Extend setupCharts() method in app.js

New Filters: Add filter controls in trades.html and update filtering logic

New Statistics: Add calculation methods in storage.js

📊 Data Schema
Trades are stored with the following structure:

javascript
{
  id: number,
  date: string,           // YYYY-MM-DD
  asset: string,          // AAPL, BTC, etc.
  type: 'long' | 'short',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fees: number,
  stopLoss: number | null,
  takeProfit: number | null,
  strategy: string | null,
  emotion: string | null,
  setup: string,
  notes: string,
  screenshots: Array,     // Base64 encoded images
  screenshotNotes: string,
  createdAt: string,      // ISO timestamp
  updatedAt: string       // ISO timestamp
}
🔒 Data Privacy
100% Local: All data stays in your browser

No Tracking: No analytics or external calls

Export/Backup: Full control over your data

Clear Storage: Delete browser data to remove all records

🚀 Future Enhancements
Cloud sync between devices

Advanced analytics and reporting

Trading strategy backtesting

Risk management calculators

Multi-currency support

API integration with trading platforms

Performance benchmarking

Trade journal templates
