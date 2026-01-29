class TradesPage {
    constructor() {
        this.currentPage = 1;
        this.tradesPerPage = 10;
        this.filteredTrades = [];
        
        this.init();
    }
    init() {
        this.setupTheme();
        this.setupMobileMenu();
        this.loadTrades();
        this.setupEventListeners();
        this.populateFilters();
        this.setupBackupRestore();
    }
setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('tradingJournalTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<span class="icon icon-sun"></span>';
        } else {
            themeToggle.innerHTML = '<span class="icon icon-moon"></span>';
        }
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('tradingJournalTheme', isDark ? 'dark' : 'light');
            this.innerHTML = isDark ? 
                '<span class="icon icon-sun"></span>' : 
                '<span class="icon icon-moon"></span>';
        });
    }
}
setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
                    navLinks.classList.remove('show');
                }
            });
        }
    }
    loadTrades() {
        const allTrades = StorageManager.getTrades();
        this.filteredTrades = [...allTrades].reverse();
        this.renderTable();
        this.updateStats();
    }
    renderTable() {
        const tableBody = document.getElementById('tradesTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableCard = document.querySelector('.table-card');
        if (!tableBody) return;
        const startIndex = (this.currentPage - 1) * this.tradesPerPage;
        const endIndex = startIndex + this.tradesPerPage;
        const pageTrades = this.filteredTrades.slice(startIndex, endIndex);
        if (this.filteredTrades.length === 0) {
            if (tableCard) tableCard.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        } else {
            if (tableCard) tableCard.style.display = 'block';
            if (emptyState) emptyState.style.display = 'none';
        }
        tableBody.innerHTML = '';
        pageTrades.forEach(trade => {
            const profit = StorageManager.calculateProfit(trade);
            const row = document.createElement('tr');
            const hasScreenshots = trade.screenshots && trade.screenshots.length > 0;
            const tradeDate = new Date(trade.date);
            const formattedDate = tradeDate.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }).replace(',', '');
            const formattedEntryPrice = parseFloat(trade.entryPrice).toFixed(2);
            const formattedExitPrice = parseFloat(trade.exitPrice).toFixed(2);
            const formattedQuantity = parseFloat(trade.quantity).toLocaleString();
            const formattedProfit = Math.abs(profit).toFixed(2);
            const fullDate = tradeDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
row.innerHTML = `
    <td title="${fullDate}">
        ${formattedDate}
    </td>
    <td title="${trade.asset}">
        <strong>${trade.asset}</strong>
    </td>
    <td>
        <span class="trade-type ${trade.type}">
            ${trade.type === 'long' ? 'Long' : 'Short'}
        </span>
    </td>
    <td title="Entry Price: $${formattedEntryPrice}">
        $${formattedEntryPrice}
    </td>
    <td title="Exit Price: $${formattedExitPrice}">
        $${formattedExitPrice}
    </td>
    <td title="Quantity: ${formattedQuantity}">
        ${formattedQuantity}
    </td>
    <td class="${profit >= 0 ? 'positive' : 'negative'}" 
        title="${profit >= 0 ? 'Profit' : 'Loss'}: ${profit >= 0 ? '+' : '-'}$${formattedProfit}">
        ${profit >= 0 ? '+' : ''}$${formattedProfit}
    </td>
    <td>
        <span class="status-badge ${profit >= 0 ? 'win' : 'loss'}">
            ${profit >= 0 ? 'Win' : 'Loss'}
        </span>
    </td>
    <td>
        <div class="action-buttons">
            ${hasScreenshots ? 
                `<button class="btn-icon view-images" data-id="${trade.id}" title="View Screenshots">
                    <span class="icon icon-eye"></span>
                </button>` 
                : ''
            }
            <button class="btn-icon edit-trade" data-id="${trade.id}" title="Edit Trade">
                <span class="icon icon-edit"></span>
            </button>
            <button class="btn-icon delete-trade" data-id="${trade.id}" title="Delete Trade">
                <span class="icon icon-trash"></span>
            </button>
        </div>
    </td>
`;
            tableBody.appendChild(row);
        });
        this.updatePagination();
    }
   updatePagination() {
        const totalPages = Math.ceil(this.filteredTrades.length / this.tradesPerPage);
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }
    updateStats() {
        const totalProfit = this.filteredTrades.reduce((sum, trade) => {
            return sum + StorageManager.calculateProfit(trade);
        }, 0);
        const winningTrades = this.filteredTrades.filter(trade => {
            return StorageManager.calculateProfit(trade) > 0;
        }).length;
        const winRate = this.filteredTrades.length > 0 
            ? Math.round((winningTrades / this.filteredTrades.length) * 100) 
            : 0;
        const avgProfit = this.filteredTrades.length > 0
            ? totalProfit / this.filteredTrades.length
            : 0;
        this.updateElement('filteredProfit', `$${totalProfit.toFixed(2)}`);
        this.updateElement('filteredWinRate', `${winRate}%`);
        this.updateElement('filteredTrades', this.filteredTrades.length);
        this.updateElement('avgFilteredProfit', `$${avgProfit.toFixed(2)}`);
        this.updateElement('tradeCount', `${this.filteredTrades.length} trades`);
    }
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    } 
}

