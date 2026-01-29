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
setupEventListeners() {
    this.setupClickListener('prevPage', () => {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    });
    this.setupClickListener('nextPage', () => {
        const totalPages = Math.ceil(this.filteredTrades.length / this.tradesPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    });
    this.setupClickListener('exportPDF', () => {
        this.exportToCSV();  
    });
    this.setupClickListener('applyFilters', () => {
        this.applyFilters();
    });
    this.setupClickListener('clearFilters', () => {
        this.clearFilters();
    });
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-trade')) {
            const tradeId = parseInt(e.target.closest('.edit-trade').dataset.id);
            this.editTrade(tradeId);
        }
        if (e.target.closest('.delete-trade')) {
            const tradeId = parseInt(e.target.closest('.delete-trade').dataset.id);
            this.deleteTrade(tradeId);
        }
        if (e.target.closest('.view-images')) {
            const tradeId = parseInt(e.target.closest('.view-images').dataset.id);
            this.viewTradeImages(tradeId);
        }
    });
}
     setupClickListener(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    }
    viewTradeImages(tradeId) {
        const trade = StorageManager.getTradeById(tradeId);
        if (!trade || !trade.screenshots || trade.screenshots.length === 0) {
            StorageManager.showNotification('No screenshots available for this trade', 'error');
            return;
        }
        this.createImageModal(trade);
    }
    createImageModal(trade) {
        const existingModal = document.getElementById('imageModal');
        if (existingModal) {
            existingModal.remove();
        }
        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        let imagesHTML = '';
        trade.screenshots.forEach((screenshot, index) => {
            imagesHTML += `
                <div class="modal-image-item">
                    <img src="${screenshot.data}" alt="Trade Screenshot ${index + 1}">
                    <div class="image-info">
                        <span class="image-index">Screenshot ${index + 1} of ${trade.screenshots.length}</span>
                        ${screenshot.name ? `<span class="image-name">${screenshot.name}</span>` : ''}
                    </div>
                </div>
            `;
        });
        let notesHTML = '';
        if (trade.screenshotNotes) {
            notesHTML = `
                <div class="image-notes">
                    <h4><i class="fas fa-sticky-note"></i> Screenshot Notes</h4>
                    <p>${trade.screenshotNotes}</p>
                </div>
            `;
        }
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-camera"></i>
                        Screenshots for ${trade.asset} Trade
                        <small>${new Date(trade.date).toLocaleDateString()}</small>
                    </h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="image-gallery">
                        ${imagesHTML}
                    </div>
                    ${notesHTML}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-prev">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <div class="image-counter">1 / ${trade.screenshots.length}</div>
                    <button class="btn btn-secondary modal-next">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.setupImageModal();
    }
setupImageModal() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('fade-out');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', handleEscape);
        let currentImageIndex = 0;
        const images = modal.querySelectorAll('.modal-image-item');
        const prevBtn = modal.querySelector('.modal-prev');
        const nextBtn = modal.querySelector('.modal-next');
        const counter = modal.querySelector('.image-counter');
        const updateImageDisplay = () => {
            images.forEach((img, index) => {
                img.style.display = index === currentImageIndex ? 'block' : 'none';
            });
            if (counter) {
                counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
            }
            if (prevBtn) prevBtn.disabled = currentImageIndex === 0;
            if (nextBtn) nextBtn.disabled = currentImageIndex === images.length - 1;
        };
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentImageIndex > 0) {
                    currentImageIndex--;
                    updateImageDisplay();
                }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentImageIndex < images.length - 1) {
                    currentImageIndex++;
                    updateImageDisplay();
                }
            });
        }
        updateImageDisplay();
        modal.dataset.escapeHandler = handleEscape;
    }
    applyFilters() {
        const allTrades = StorageManager.getTrades();
        let filtered = [...allTrades];
        const assetFilter = document.getElementById('filterAsset');
        if (assetFilter && assetFilter.value !== 'all') {
            filtered = filtered.filter(trade => trade.asset === assetFilter.value);
        }
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter && statusFilter.value !== 'all') {
            filtered = filtered.filter(trade => {
                const profit = StorageManager.calculateProfit(trade);
                return statusFilter.value === 'win' ? profit > 0 : profit < 0;
            });
        }
        const typeFilter = document.getElementById('filterType');
        if (typeFilter && typeFilter.value !== 'all') {
            filtered = filtered.filter(trade => trade.type === typeFilter.value);
        }
        const dateFrom = document.getElementById('filterDateFrom');
        const dateTo = document.getElementById('filterDateTo');
        if (dateFrom && dateFrom.value) {
            filtered = filtered.filter(trade => trade.date >= dateFrom.value);
        }
        if (dateTo && dateTo.value) {
            filtered = filtered.filter(trade => trade.date <= dateTo.value);
        }
        this.filteredTrades = filtered.reverse();
        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    }
  clearFilters() {
        const elements = ['filterAsset', 'filterStatus', 'filterType', 'filterDateFrom', 'filterDateTo'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = 'all' || '';
        });
        this.loadTrades();
    }
    populateFilters() {
        const assets = StorageManager.getUniqueAssets();
        const assetSelect = document.getElementById('filterAsset');
        if (assetSelect) {
            assets.forEach(asset => {
                const option = document.createElement('option');
                option.value = asset;
                option.textContent = asset;
                assetSelect.appendChild(option);
            });
        }
    }
    editTrade(tradeId) {
        window.location.href = `add-trade.html?edit=${tradeId}`;
    }
    deleteTrade(tradeId) {
        if (confirm('Are you sure you want to delete this trade?')) {
            StorageManager.deleteTrade(tradeId);
            this.loadTrades();
            StorageManager.showNotification('Trade deleted successfully!', 'success');
        }
    }
exportToCSV() {
    if (this.filteredTrades.length === 0) {
        StorageManager.showNotification('No trades to export', 'error');
        return;
    }
    const exportBtn = document.getElementById('exportPDF');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<span class="icon icon-spinner"></span> Generating CSV...';
    exportBtn.disabled = true;
    try {
        StorageManager.exportToCSV(this.filteredTrades);
    } catch (error) {
        console.error('CSV export error:', error);
        StorageManager.showNotification('Error generating CSV: ' + error.message, 'error');
    } finally {
        setTimeout(() => {
            exportBtn.innerHTML = '<span class="icon icon-file-pdf"></span> Export CSV';
            exportBtn.disabled = false;
        }, 500);
    }
}

}
