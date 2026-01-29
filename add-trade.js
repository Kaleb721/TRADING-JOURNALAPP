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
    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    setDefaultDate() {
        if (!this.isEditMode) {
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('tradeDate');
            if (dateInput) {
                dateInput.value = today;
                dateInput.max = today;
            }
        }
    }
    setupEventListeners() {
        const form = document.getElementById('tradeForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        ['entryPrice', 'exitPrice', 'quantity', 'fees', 'takeProfit'].forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateProfit();
                    this.calculatePositionSize();
                });
            }
        });
    }    
    setupScreenshotUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const browseBtn = document.getElementById('browseBtn');
        const fileInput = document.getElementById('screenshotInput');
        if (uploadArea && browseBtn && fileInput) {
            browseBtn.addEventListener('click', () => {
                fileInput.click();
            });
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
                uploadArea.style.background = 'var(--bg-primary)';
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'var(--bg-secondary)';
            });   
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'var(--bg-secondary)';    
                const files = e.dataTransfer.files;
                this.handleScreenshotFiles(files);
            });
            fileInput.addEventListener('change', (e) => {
                this.handleScreenshotFiles(e.target.files);
                e.target.value = '';
            });
        }
    }
    handleScreenshotFiles(files) {
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024; 
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        for (let i = 0; i < Math.min(files.length, maxFiles - this.screenshots.length); i++) {
            const file = files[i];
            if (!allowedTypes.includes(file.type)) {
                StorageManager.showNotification(`File ${file.name} is not a supported image type`, 'error');
                continue;
            }
            if (file.size > maxSize) {
                StorageManager.showNotification(`File ${file.name} is too large (max 5MB)`, 'error');
                continue;
            }
            this.compressAndAddScreenshot(file);
        }
    }
    compressAndAddScreenshot(file) {
        StorageManager.compressImage(file)
            .then(compressedImage => {
                this.screenshots.push({
                    name: file.name,
                    data: compressedImage,
                    size: file.size,
                    type: file.type
                });
                this.renderScreenshots();
            })
            .catch(error => {
                StorageManager.showNotification('Error processing image', 'error');
                console.error('Image compression error:', error);
            });
    }
    renderScreenshots() {
        const preview = document.getElementById('screenshotPreview');
        if (!preview) return;
        preview.innerHTML = '';
        if (this.screenshots.length === 0) {
            preview.innerHTML = '<p class="text-muted">No screenshots uploaded</p>';
            return;
        }
        this.screenshots.forEach((screenshot, index) => {
            const item = document.createElement('div');
            item.className = 'screenshot-item';
            item.innerHTML = `
                <img src="${screenshot.data}" alt="Trade screenshot ${index + 1}">
                <button type="button" class="screenshot-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(item);
        });
        preview.querySelectorAll('.screenshot-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.screenshot-remove').dataset.index);
                this.removeScreenshot(index);
            });
        });
    }
     removeScreenshot(index) {
        this.screenshots.splice(index, 1);
        this.renderScreenshots();
    }
    setupLiveCalculations() {
        this.calculateProfit();
    } 
    calculateProfit() {
        const entryPrice = parseFloat(document.getElementById('entryPrice').value) || 0;
        const exitPrice = parseFloat(document.getElementById('exitPrice').value) || 0;
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const fees = parseFloat(document.getElementById('fees').value) || 0;
        const tradeType = document.getElementById('tradeType').value;
        if (!entryPrice || !exitPrice || !quantity || !tradeType) {
            return;
        }
        const priceDifference = exitPrice - entryPrice;
        const direction = tradeType === 'long' ? 1 : -1;
        const grossProfit = priceDifference * direction * quantity;
        const netProfit = grossProfit - fees;
        const investment = entryPrice * quantity;
        const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
        let riskReward = '-';
        const stopLoss = parseFloat(document.getElementById('stopLoss').value);
        const takeProfit = parseFloat(document.getElementById('takeProfit').value);
        
        if (stopLoss && takeProfit) {
            const risk = Math.abs(entryPrice - stopLoss);
            const reward = Math.abs(takeProfit - entryPrice);
            if (risk > 0) {
                riskReward = `1:${(reward / risk).toFixed(2)}`;
            }
        }
        const profitElement = document.getElementById('profitPreview');
        if (profitElement) {
            profitElement.textContent = netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`;
            profitElement.className = `profit-value ${netProfit >= 0 ? 'positive' : 'negative'}`;
        }
        this.updateElement('riskRewardRatio', riskReward);
        this.updateElement('roi', `${roi.toFixed(2)}%`, roi >= 0 ? 'positive' : 'negative');
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
    validateForm() {
        let isValid = true;
        const requiredFields = ['tradeDate', 'asset', 'tradeType', 'quantity', 'entryPrice', 'exitPrice'];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            
            if (!input || !input.value.trim()) {
                isValid = false;
                if (input) input.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = 'This field is required';
                }
            } else {
                if (input) input.classList.remove('error');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
        });
        const quantity = document.getElementById('quantity');
        if (quantity && quantity.value <= 0) {
            isValid = false;
            quantity.classList.add('error');
            const errorElement = document.getElementById('quantityError');
            if (errorElement) {
                errorElement.textContent = 'Quantity must be greater than 0';
            }
        }
        const entryPrice = document.getElementById('entryPrice');
        const exitPrice = document.getElementById('exitPrice');
        if (entryPrice && exitPrice && entryPrice.value && exitPrice.value) {
            const entry = parseFloat(entryPrice.value);
            const exit = parseFloat(exitPrice.value);   
            if (entry <= 0) {
                isValid = false;
                entryPrice.classList.add('error');
                const errorElement = document.getElementById('entryError');
                if (errorElement) {
                    errorElement.textContent = 'Entry price must be greater than 0';
                }
            }
            if (exit <= 0) {
                isValid = false;
                exitPrice.classList.add('error');
                const errorElement = document.getElementById('exitError');
                if (errorElement) {
                    errorElement.textContent = 'Exit price must be greater than 0';
                }
            }
        }
        return isValid;
    }
}