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

}