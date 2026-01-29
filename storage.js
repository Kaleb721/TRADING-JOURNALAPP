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
        
    }
}