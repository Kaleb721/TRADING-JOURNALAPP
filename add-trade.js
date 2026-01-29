class AddTradePage {
    constructor() {
        this.isEditMode = false;
        this.editTradeId = null;
        this.screenshots = [];
        this.init();
    }
    init() {
        this.setupTheme();
        this.setupMobileMenu();
        this.setupEventListeners();
        this.checkEditMode();
        this.setDefaultDate();
        this.setupLiveCalculations();
        this.setupScreenshotUpload();
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
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            this.isEditMode = true;
            this.editTradeId = parseInt(editId);
            this.loadTradeForEdit();
        }
    }
    loadTradeForEdit() {
        const trade = StorageManager.getTradeById(this.editTradeId);
        if (!trade) return;
        const pageTitle = document.querySelector('.page-title');
        const pageSubtitle = document.querySelector('.page-subtitle');
        const submitBtn = document.getElementById('submitBtn');
        if (pageTitle) pageTitle.textContent = 'Edit Trade';
        if (pageSubtitle) pageSubtitle.textContent = 'Update your trade details';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Trade';
        this.setValue('tradeId', trade.id);
        this.setValue('tradeDate', trade.date);
        this.setValue('asset', trade.asset);
        this.setValue('tradeType', trade.type);
        this.setValue('quantity', trade.quantity);
        this.setValue('entryPrice', trade.entryPrice);
        this.setValue('exitPrice', trade.exitPrice);
        this.setValue('stopLoss', trade.stopLoss || '');
        this.setValue('takeProfit', trade.takeProfit || '');
        this.setValue('fees', trade.fees || 0);
        this.setValue('strategy', trade.strategy || '');
        this.setValue('emotion', trade.emotion || '');
        this.setValue('setup', trade.setup || '');
        this.setValue('notes', trade.notes || '');
        this.setValue('screenshotNotes', trade.screenshotNotes || '');
        if (trade.screenshots && trade.screenshots.length > 0) {
            this.screenshots = trade.screenshots;
            this.renderScreenshots();
        }
        this.calculateProfit();
    }
}