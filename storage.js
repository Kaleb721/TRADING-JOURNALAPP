const StorageManager = {
    init: function() {
        if (!localStorage.getItem('tradingJournalData')) {
            const sampleData = {
                trades: [
                    {
                        id: 1,
                        date: '2024-01-15',
                        asset: 'AAPL',
                        type: 'long',
                        entryPrice: 185.50,
                        exitPrice: 192.75,
                        quantity: 10,
                        fees: 5.00,
                        stopLoss: 182.00,
                        takeProfit: 195.00,
                        strategy: 'swing',
                        emotion: 'confident',
                        setup: 'Breakout above resistance with high volume',
                        notes: 'Perfect entry timing, exited at target',
                        screenshots: [],
                        screenshotNotes: ''
                    },
                    {
                        id: 2,
                        date: '2024-01-18',
                        asset: 'GOOGL',
                        type: 'long',
                        entryPrice: 142.30,
                        exitPrice: 140.50,
                        quantity: 5,
                        fees: 5.00,
                        stopLoss: 141.00,
                        takeProfit: 146.00,
                        strategy: 'day',
                        emotion: 'anxious',
                        setup: 'Oversold bounce attempt',
                        notes: 'Should have waited for confirmation, premature entry',
                        screenshots: [],
                        screenshotNotes: ''
                    },
                    {
                        id: 3,
                        date: '2024-01-22',
                        asset: 'BTC',
                        type: 'short',
                        entryPrice: 42000,
                        exitPrice: 41500,
                        quantity: 0.1,
                        fees: 10.00,
                        stopLoss: 42500,
                        takeProfit: 41000,
                        strategy: 'swing',
                        emotion: 'neutral',
                        setup: 'Resistance rejection with bearish divergence',
                        notes: 'Good risk management, perfect execution',
                        screenshots: [],
                        screenshotNotes: ''
                    }
                ],
                settings: {
                    currency: 'USD',
                    riskPercent: 2,
                    theme: 'light'
                }
            };
            this.saveAllData(sampleData);
        }
        
    },
     getAllData: function() {
        const data = localStorage.getItem('tradingJournalData');
        return data ? JSON.parse(data) : { trades: [], settings: {} };
    },
    saveAllData: function(data) {
        localStorage.setItem('tradingJournalData', JSON.stringify(data));
    },
    getTrades: function() {
        const data = this.getAllData();
        return data.trades || [];
    },
    getTradeById: function(id) {
        const trades = this.getTrades();
        return trades.find(trade => trade.id === id);
    },
    saveTrades: function(trades) {
        const data = this.getAllData();
        data.trades = trades;
        this.saveAllData(data);
    },
    addTrade: function(trade) {
        const trades = this.getTrades();
        const newId = trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1;
        const newTrade = {
            id: newId,
            date: trade.date,
            asset: trade.asset,
            type: trade.type,
            entryPrice: parseFloat(trade.entryPrice),
            exitPrice: parseFloat(trade.exitPrice),
            quantity: parseFloat(trade.quantity),
            fees: parseFloat(trade.fees) || 0,
            stopLoss: trade.stopLoss ? parseFloat(trade.stopLoss) : null,
            takeProfit: trade.takeProfit ? parseFloat(trade.takeProfit) : null,
            strategy: trade.strategy || null,
            emotion: trade.emotion || null,
            setup: trade.setup || '',
            notes: trade.notes || '',
            screenshots: trade.screenshots || [],
            screenshotNotes: trade.screenshotNotes || '',
            createdAt: new Date().toISOString()
        };
        trades.push(newTrade);
        this.saveTrades(trades);
        return newTrade;
    },
    updateTrade: function(id, updatedTrade) {
        const trades = this.getTrades();
        const index = trades.findIndex(t => t.id === id);
        
        if (index !== -1) {
            trades[index] = {
                ...trades[index],
                ...updatedTrade,
                entryPrice: parseFloat(updatedTrade.entryPrice),
                exitPrice: parseFloat(updatedTrade.exitPrice),
                quantity: parseFloat(updatedTrade.quantity),
                fees: parseFloat(updatedTrade.fees) || 0,
                stopLoss: updatedTrade.stopLoss ? parseFloat(updatedTrade.stopLoss) : null,
                takeProfit: updatedTrade.takeProfit ? parseFloat(updatedTrade.takeProfit) : null,
                screenshots: updatedTrade.screenshots || trades[index].screenshots,
                screenshotNotes: updatedTrade.screenshotNotes || trades[index].screenshotNotes,
                updatedAt: new Date().toISOString()
            };
            
            this.saveTrades(trades);
            return true;
        }
        
        return false;
    },   deleteTrade: function(id) {
        const trades = this.getTrades();
        const filteredTrades = trades.filter(t => t.id !== id);
        if (filteredTrades.length !== trades.length) {
            this.saveTrades(filteredTrades);
            return true;
        }
        return false;
    },
    calculateProfit: function(trade) {
        const priceDifference = trade.exitPrice - trade.entryPrice;
        const direction = trade.type === 'long' ? 1 : -1;
        const profit = (priceDifference * direction * trade.quantity) - (trade.fees || 0);
        return Math.round(profit * 100) / 100;
    },
    calculateTotalProfitLoss: function() {
        const trades = this.getTrades();
        return trades.reduce((total, trade) => total + this.calculateProfit(trade), 0);
    },
    calculateWinRate: function() {
        const trades = this.getTrades();
        if (trades.length === 0) return 0;
        const winningTrades = trades.filter(trade => this.calculateProfit(trade) > 0);
        return Math.round((winningTrades.length / trades.length) * 100);
    },
    calculateAvgRiskReward: function() {
        const trades = this.getTrades();
        const validTrades = trades.filter(t => t.stopLoss && t.takeProfit);
        if (validTrades.length === 0) return 0;
        const totalRatio = validTrades.reduce((sum, trade) => {
            const risk = Math.abs(trade.entryPrice - trade.stopLoss);
            const reward = Math.abs(trade.takeProfit - trade.entryPrice);
            return sum + (reward / risk);
        }, 0);  
        return Math.round((totalRatio / validTrades.length) * 100) / 100;
    },
    getRecentTrades: function(limit = 5) {
        const trades = this.getTrades();
        return trades
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },
    getUniqueAssets: function() {
        const trades = this.getTrades();
        const assets = [...new Set(trades.map(t => t.asset))];
        return assets.sort();
    },
}