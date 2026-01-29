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
 updateElement(id, value, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            if (className) {
                element.className = className;
            }
        }
    }
    updateRecentTrades() {
        const recentTrades = StorageManager.getRecentTrades(5);
        const container = document.getElementById('recentTradesList');
        if (!container) return;
        container.innerHTML = '';
        if (recentTrades.length === 0) {
            container.innerHTML = `
                <div class="trade-item">
                    <div class="trade-info">
                        <span class="trade-symbol">No trades yet</span>
                        <span class="trade-date">Add your first trade!</span>
                    </div>
                </div>
            `;
            return;
        }
        recentTrades.forEach((trade, index) => {
            const profit = StorageManager.calculateProfit(trade);
            const tradeElement = document.createElement('div');
            tradeElement.className = 'trade-item';
            tradeElement.style.animationDelay = `${index * 0.1}s`;  
            tradeElement.innerHTML = `
                <div class="trade-info">
                    <span class="trade-symbol">${trade.asset}</span>
                    <span class="trade-date">${new Date(trade.date).toLocaleDateString()}</span>
                </div>
                <div class="trade-profit ${profit >= 0 ? 'positive' : 'negative'}">
                    ${profit >= 0 ? '+' : ''}$${Math.abs(profit).toFixed(2)}
                </div>
            `;
            container.appendChild(tradeElement);
        });
    }
    updateStats() {
        const stats = StorageManager.getStatistics();
        const consecutiveStats = StorageManager.getConsecutiveStats();
        const trades = StorageManager.getTrades();
        let riskScore = '-';
        const tradesWithStops = trades.filter(t => t.stopLoss).length;
        if (trades.length > 0) {
            const score = Math.round((tradesWithStops / trades.length) * 100);
            riskScore = `${score}/100`;
        }
        let psychologyScore = '-';
        const emotions = trades.filter(t => t.emotion).map(t => t.emotion);
        if (emotions.length > 0) {
            const positiveEmotions = emotions.filter(e => ['confident', 'neutral'].includes(e)).length;
            const score = Math.round((positiveEmotions / emotions.length) * 100);
            psychologyScore = `${score}/100`;
        }
        this.updateElement('currentStreak', 
            `${consecutiveStats.currentStreak} ${consecutiveStats.currentStreakType === 'win' ? 'wins' : 'losses'}`);
        this.updateElement('riskScore', riskScore);
        this.updateElement('psychologyScore', psychologyScore);
    }
     setupEventListeners() {
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', () => {
                this.setupCharts();
            });
        }
    }
    setupCharts() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        if (ctx.chart) {
            ctx.chart.destroy();
        }
        const chartPeriod = document.getElementById('chartPeriod');
        const period = chartPeriod ? chartPeriod.value : '1M';
        const chartData = this.getChartDataForPeriod(period);
        if (!chartData || chartData.dates.length === 0) {
            return;
        }
        try {
            ctx.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.dates,
                    datasets: [{
                        label: 'Portfolio Value',
                        data: chartData.values,
                        backgroundColor: 'transparent',
                        borderColor: 'rgb(76, 201, 240)',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: false,
                        tension: 0.4,
                        segment: {
                            borderColor: ctx => {
                                const index = ctx.p1DataIndex;
                                const values = chartData.values;
                                if (index > 0 && values[index] < values[index - 1]) {
                                    return 'rgb(247, 37, 133)'; 
                                }
                                return 'rgb(76, 201, 240)'; 
                            }
                        }
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'var(--text-muted)',
                                font: {
                                    size: 11
                                },
                                maxRotation: 0
                            }
                        },
                        y: {
                            display: true,
                            position: 'right',
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'var(--text-muted)',
                                font: {
                                    size: 11
                                },
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    elements: {
                        line: {
                            cubicInterpolationMode: 'monotone'
                        }
                    },
                    animation: {
                        duration: 750,
                        easing: 'easeOutQuart'
                    }
                }
            });
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }
}