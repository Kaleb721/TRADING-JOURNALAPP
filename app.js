class TradingApp {
    constructor() {
        this.init();
    }
    init() {
         this.showLoadingScreen();
        this.setupTheme();
        this.setupMobileMenu();
        this.loadDashboard();
        this.setupEventListeners();
        this.setupCharts();
    }
    showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.id = 'loadingScreen';
    
    loadingScreen.innerHTML = `
        <div class="loading-logo">
            <span class="icon icon-chart-line"></span>
            <span>TradingJournal<span style="color: #4cc9f0"></span></span>
        </div>
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading your trading data...</div>
    `;
    document.body.appendChild(loadingScreen);
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 2000);
}
    loadDashboard() {
        this.updateSummaryCards();
        this.updateRecentTrades();
        this.updateStats();
    }
    updateSummaryCards() {
        const stats = StorageManager.getStatistics();
        const trades = StorageManager.getTrades();
        this.updateElement('totalPL', `$${stats.totalProfit.toFixed(2)}`, 
            `summary-value ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`);
        this.updateElement('dashboardWinRate', `${stats.winRate}%`);
        const winRateProgress = document.getElementById('winRateProgress');
        if (winRateProgress) {
            winRateProgress.style.width = `${stats.winRate}%`;
        }
        const avgRiskReward = StorageManager.calculateAvgRiskReward();
        this.updateElement('avgRiskReward', `1:${avgRiskReward.toFixed(1)}`);
        const riskBar = document.querySelector('.risk-bar');
        const rewardBar = document.querySelector('.reward-bar');
        if (riskBar && rewardBar) {
            riskBar.style.flex = '1';
            rewardBar.style.flex = avgRiskReward.toFixed(1);
        }
        const bestTrade = StorageManager.getBestTrade();
        if (bestTrade) {
            const profit = StorageManager.calculateProfit(bestTrade);
            this.updateElement('bestTrade', `$${profit.toFixed(2)}`, 'summary-value positive');
            this.updateElement('bestTradeMeta', 
                `${bestTrade.asset} (${new Date(bestTrade.date).toLocaleDateString()})`);
        }
        this.updateElement('totalTrades', trades.length);
        this.updateElement('totalProfit', `$${stats.totalProfit.toFixed(2)}`, 'stat-value positive');
        this.updateElement('winRate', `${stats.winRate}%`);
    }

}