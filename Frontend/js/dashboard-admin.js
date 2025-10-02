class CustomModalSystem {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        this.createModalContainer();
    }

    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'custom-modal-overlay';
        this.modalContainer.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h3 class="custom-modal-title"></h3>
                    <button class="custom-modal-close">&times;</button>
                </div>
                <div class="custom-modal-content"></div>
                <div class="custom-modal-footer"></div>
            </div>
        `;
        document.body.appendChild(this.modalContainer);

        // Event listener para cerrar modal
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer || e.target.classList.contains('custom-modal-close')) {
                this.close();
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalContainer.classList.contains('active')) {
                this.close();
            }
        });
    }

    show(options) {
        const modal = this.modalContainer.querySelector('.custom-modal');
        const title = this.modalContainer.querySelector('.custom-modal-title');
        const content = this.modalContainer.querySelector('.custom-modal-content');
        const footer = this.modalContainer.querySelector('.custom-modal-footer');

        // Configurar título
        title.textContent = options.title || '';

        // Configurar contenido
        content.innerHTML = options.content || '';

        // Configurar footer con botones
        footer.innerHTML = '';
        if (options.buttons) {
            options.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `custom-btn ${button.class || 'custom-btn-secondary'}`;
                btn.textContent = button.text;
                btn.onclick = button.handler;
                if (button.disabled) btn.disabled = true;
                footer.appendChild(btn);
            });
        }

        // Aplicar clases adicionales
        modal.className = 'custom-modal';
        if (options.size) modal.classList.add(options.size);
        if (options.theme) modal.classList.add(options.theme);

        // Mostrar modal
        this.modalContainer.classList.add('active');
        
        // Enfocar primer input si existe
        const firstInput = content.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    close(result = null) {
        this.modalContainer.classList.remove('active');
        if (this.resolvePromise) {
            this.resolvePromise(result);
            this.resolvePromise = null;
        }
    }

    async prompt(title, message, defaultValue = '', type = 'text') {
        return new Promise((resolve) => {
            const content = `
                <div class="custom-form-group">
                    <label class="custom-form-label">${message}</label>
                    <input type="${type}" class="custom-form-input" value="${defaultValue}" placeholder="${message}">
                </div>
            `;

            this.show({
                title,
                content,
                buttons: [
                    {
                        text: 'Cancelar',
                        class: 'custom-btn-secondary',
                        handler: () => this.close(null)
                    },
                    {
                        text: 'Aceptar',
                        class: 'custom-btn-primary',
                        handler: () => {
                            const input = this.modalContainer.querySelector('.custom-form-input');
                            this.close(input.value);
                        }
                    }
                ]
            }).then(resolve);
        });
    }

    async confirm(title, message) {
        return new Promise((resolve) => {
            const content = `
                <div class="confirmation-modal">
                    <div class="confirmation-icon">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <div class="confirmation-message">${message}</div>
                </div>
            `;

            this.show({
                title,
                content,
                buttons: [
                    {
                        text: 'Cancelar',
                        class: 'custom-btn-secondary',
                        handler: () => this.close(false)
                    },
                    {
                        text: 'Confirmar',
                        class: 'custom-btn-primary',
                        handler: () => this.close(true)
                    }
                ]
            }).then(resolve);
        });
    }

    async alert(title, message, type = 'info') {
        return new Promise((resolve) => {
            const icons = {
                info: 'fa-info-circle',
                success: 'fa-check-circle',
                warning: 'fa-exclamation-triangle',
                error: 'fa-times-circle'
            };

            const content = `
                <div class="confirmation-modal ${type}-modal">
                    <div class="confirmation-icon">
                        <i class="fas ${icons[type]}"></i>
                    </div>
                    <div class="confirmation-message">${message}</div>
                </div>
            `;

            this.show({
                title,
                content,
                buttons: [
                    {
                        text: 'Aceptar',
                        class: 'custom-btn-primary',
                        handler: () => this.close()
                    }
                ]
            }).then(resolve);
        });
    }

    async select(title, message, options, multiple = false) {
        return new Promise((resolve) => {
            const optionsHtml = options.map(option => `
                <div class="custom-multi-select-item" data-value="${option.value}">
                    ${option.text}
                </div>
            `).join('');

            const content = `
                <div class="custom-form-group">
                    <label class="custom-form-label">${message}</label>
                    <div class="custom-multi-select">
                        ${optionsHtml}
                    </div>
                </div>
            `;

            this.show({
                title,
                content,
                buttons: [
                    {
                        text: 'Cancelar',
                        class: 'custom-btn-secondary',
                        handler: () => this.close(null)
                    },
                    {
                        text: 'Seleccionar',
                        class: 'custom-btn-primary',
                        handler: () => {
                            const selected = this.modalContainer.querySelectorAll('.custom-multi-select-item.selected');
                            const values = Array.from(selected).map(item => item.getAttribute('data-value'));
                            this.close(multiple ? values : values[0]);
                        }
                    }
                ]
            });

            // Configurar selección de items
            const items = this.modalContainer.querySelectorAll('.custom-multi-select-item');
            items.forEach(item => {
                item.addEventListener('click', () => {
                    if (multiple) {
                        item.classList.toggle('selected');
                    } else {
                        items.forEach(i => i.classList.remove('selected'));
                        item.classList.add('selected');
                    }
                });
            });
        });
    }

    async form(title, fields) {
        return new Promise((resolve) => {
            const fieldsHtml = fields.map(field => {
                if (field.type === 'select') {
                    const options = field.options.map(opt => 
                        `<option value="${opt.value}">${opt.text}</option>`
                    ).join('');
                    return `
                        <div class="custom-form-group">
                            <label class="custom-form-label">${field.label}</label>
                            <select class="custom-form-select" ${field.required ? 'required' : ''}>
                                ${options}
                            </select>
                        </div>
                    `;
                } else if (field.type === 'textarea') {
                    return `
                        <div class="custom-form-group">
                            <label class="custom-form-label">${field.label}</label>
                            <textarea class="custom-form-textarea" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>
                        </div>
                    `;
                } else {
                    return `
                        <div class="custom-form-group">
                            <label class="custom-form-label">${field.label}</label>
                            <input type="${field.type || 'text'}" class="custom-form-input" 
                                   value="${field.value || ''}" 
                                   placeholder="${field.placeholder || ''}" 
                                   ${field.required ? 'required' : ''}>
                        </div>
                    `;
                }
            }).join('');

            const content = `<form id="custom-modal-form">${fieldsHtml}</form>`;

            this.show({
                title,
                content,
                buttons: [
                    {
                        text: 'Cancelar',
                        class: 'custom-btn-secondary',
                        handler: () => this.close(null)
                    },
                    {
                        text: 'Guardar',
                        class: 'custom-btn-primary',
                        handler: () => {
                            const form = this.modalContainer.querySelector('#custom-modal-form');
                            if (form.checkValidity()) {
                                const inputs = form.querySelectorAll('input, select, textarea');
                                const data = {};
                                inputs.forEach(input => {
                                    const name = input.previousElementSibling.textContent;
                                    data[name] = input.value;
                                });
                                this.close(data);
                            } else {
                                form.reportValidity();
                            }
                        }
                    }
                ]
            });
        });
    }
}

class AdminDashboard {
    constructor() {
        this.currentSection = 'panel-ejecutivo';
        this.basePath = this.getBasePath();
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        this.sidebarVisible = !this.isMobile;
        this.charts = {};
        this.resizeTimeout = null;
        this.data = {
            financial: {},
            access: {},
            maintenance: {},
            communications: {},
            residents: {},
            configuration: {}
        };
        this.maintenanceTickets = [];
        this.nextTicketId = 104;
        this.payments = [];
        this.nextPaymentId = 4;
        this.residents = [];
        this.accessLogs = [];
        this.communications = [];
        this.nextCommunicationId = 3;
        this.accessPermissions = [];
        this.nextPermissionId = 3;
        this.debtors = [];
        this.modalSystem = new CustomModalSystem();
        this.init();
    }

    getBasePath() {
        if (window.location.protocol.startsWith('http')) {
            return window.location.origin;
        }
        return '';
    }

    init() {
        console.log('🚀 Quantum Tower Dashboard inicializando');
        
        this.setupMockAuth();
        
        this.createMobileToggle();
        this.initializeCharts();
        this.setupEventListeners();
        this.setupResponsive();
        this.loadDashboardData();
        this.updateUserInfo();
        this.applyResponsiveStyles();
        
        this.initializeFinancialModule();
        this.initializeAccessModule();
        this.initializeMaintenanceModule();
        this.initializeCommunicationsModule();
        this.initializeResidentsModule();
        this.initializeConfigurationModule();
        
        this.loadSampleData();
        
        console.log('✅ Dashboard inicializado completamente');
    }

    setupMockAuth() {
        if (!localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', 'mock-token-' + Date.now());
            localStorage.setItem('userRole', 'administrador');
            localStorage.setItem('userEmail', 'admin@quantumtower.cl');
        }
    }

    createMobileToggle() {
        const topBar = document.querySelector('.top-bar');
        const existingToggle = document.querySelector('.menu-toggle');
        
        if (existingToggle) {
            existingToggle.remove();
        }
        
        if (topBar && this.isMobile) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-label', 'Abrir menú');
            menuToggle.addEventListener('click', () => this.toggleSidebar());
            topBar.insertBefore(menuToggle, topBar.firstChild);
        }
    }

    toggleSidebar() {
        this.sidebarVisible = !this.sidebarVisible;
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebar) {
            if (this.sidebarVisible) {
                sidebar.classList.add('active');
                this.createOverlay();
            } else {
                sidebar.classList.remove('active');
                this.removeOverlay();
            }
        }
    }

    createOverlay() {
        if (document.querySelector('.sidebar-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay active';
        overlay.addEventListener('click', () => {
            this.toggleSidebar();
        });
        document.body.appendChild(overlay);
    }

    removeOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    setupResponsive() {
        window.addEventListener('resize', this.handleResize.bind(this));
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 300);
        });
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.performResize();
        }, 150);
    }

    performResize() {
        const previousMobile = this.isMobile;
        const previousTablet = this.isTablet;
        
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        const mobileChanged = previousMobile !== this.isMobile;
        const tabletChanged = previousTablet !== this.isTablet;
        
        if (mobileChanged || tabletChanged) {
            console.log(`📱 Modo ${this.isMobile ? 'mobile' : this.isTablet ? 'tablet' : 'desktop'} detectado`);
            
            this.updateLayout();
            this.applyResponsiveStyles();
            this.initializeCharts(this.isMobile);
            
            if (mobileChanged) {
                const mode = this.isMobile ? 'móvil' : 'escritorio';
                this.showNotification(`Modo ${mode} activado`, 'info', 2000);
            }
        }
    }

    updateLayout() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (this.isMobile) {
            this.sidebarVisible = false;
            if (sidebar) {
                sidebar.classList.remove('active');
            }
            if (mainContent) {
                mainContent.style.marginLeft = '0';
            }
            this.removeOverlay();
            this.createMobileToggle();
        } else {
            this.sidebarVisible = true;
            if (sidebar) {
                sidebar.classList.add('active');
            }
            if (mainContent) {
                mainContent.style.marginLeft = '';
            }
            this.removeOverlay();
            
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) menuToggle.remove();
        }
    }

    applyResponsiveStyles() {
        const body = document.body;
        
        body.classList.toggle('mobile-mode', this.isMobile);
        body.classList.toggle('tablet-mode', this.isTablet);
        body.classList.toggle('desktop-mode', !this.isMobile && !this.isTablet);
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!token || !userRole) {
            this.redirectToLogin();
            return false;
        }

        if (userRole !== 'administrador') {
            this.redirectToLogin();
            return false;
        }

        return true;
    }

    redirectToLogin() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        
        setTimeout(() => {
            window.location.href = this.basePath + '/login/';
        }, 1000);
    }

    updateUserInfo() {
        const userEmail = localStorage.getItem('userEmail');
        const userNameElement = document.getElementById('userName');
        
        if (userNameElement && userEmail) {
            const userName = userEmail.split('@')[0];
            userNameElement.textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
        }
    }

    initializeCharts(isMobile = false) {
        this.destroyCharts();
        
        this.initializeIncomeExpenseChart(isMobile);
        this.initializeFinancialChart(isMobile);
        this.initializeResourceConsumptionChart(isMobile);
        this.initializeMaintenanceChart(isMobile);
    }

    initializeIncomeExpenseChart(isMobile = false) {
        const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
        if (incomeExpenseCtx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                color: '#e2e8f0'
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleColor: '#e2e8f0',
                            bodyColor: '#e2e8f0',
                            borderColor: '#3b82f6',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                },
                                color: '#94a3b8'
                            },
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8'
                            }
                        }
                    }
                };

                this.charts.incomeExpense = new Chart(incomeExpenseCtx, {
                    type: 'line',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                        datasets: [
                            {
                                label: 'Ingresos',
                                data: [120000, 125000, 118000, 130000, 125430, 128000],
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderWidth: 3,
                                tension: 0.4,
                                fill: true
                            },
                            {
                                label: 'Gastos',
                                data: [80000, 82000, 85000, 83000, 85200, 87000],
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderWidth: 3,
                                tension: 0.4,
                                fill: true
                            }
                        ]
                    },
                    options: options
                });
                
                console.log('✅ Gráfico de ingresos vs gastos inicializado');

            } catch (error) {
                console.error('❌ Error inicializando gráfico de ingresos vs gastos:', error);
            }
        }
    }

    initializeFinancialChart(isMobile = false) {
        const financialCtx = document.getElementById('financialChart');
        if (financialCtx) {
            try {
                this.charts.financial = new Chart(financialCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Ingresos', 'Gastos', 'Utilidad'],
                        datasets: [{
                            label: 'Monto ($)',
                            data: [125430, 85200, 40230],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(59, 130, 246, 0.8)'
                            ],
                            borderColor: [
                                '#10b981',
                                '#ef4444',
                                '#3b82f6'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: !isMobile,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                titleColor: '#e2e8f0',
                                bodyColor: '#e2e8f0',
                                callbacks: {
                                    label: function(context) {
                                        return `$${context.parsed.y.toLocaleString()}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toLocaleString();
                                    },
                                    color: '#94a3b8'
                                },
                                grid: {
                                    color: 'rgba(59, 130, 246, 0.1)'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#94a3b8'
                                },
                                grid: {
                                    color: 'rgba(59, 130, 246, 0.1)'
                                }
                            }
                        }
                    }
                });
                console.log('✅ Gráfico financiero inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico financiero:', error);
            }
        }
    }

    initializeResourceConsumptionChart(isMobile = false) {
        const resourceCtx = document.getElementById('resourceConsumptionChart');
        if (resourceCtx) {
            try {
                this.charts.resourceConsumption = new Chart(resourceCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Torre A', 'Torre B', 'Torre C', 'Áreas Comunes'],
                        datasets: [
                            {
                                label: 'Agua (m³)',
                                data: [450, 380, 420, 280],
                                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                borderColor: '#3b82f6',
                                borderWidth: 2
                            },
                            {
                                label: 'Luz (kWh)',
                                data: [12500, 11800, 13200, 8500],
                                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                                borderColor: '#f59e0b',
                                borderWidth: 2
                            },
                            {
                                label: 'Gas (m³)',
                                data: [320, 280, 350, 180],
                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                borderColor: '#10b981',
                                borderWidth: 2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: !isMobile,
                        plugins: {
                            legend: {
                                position: isMobile ? 'bottom' : 'top',
                                labels: {
                                    color: '#e2e8f0'
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#94a3b8'
                                },
                                grid: {
                                    color: 'rgba(59, 130, 246, 0.1)'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#94a3b8'
                                },
                                grid: {
                                    color: 'rgba(59, 130, 246, 0.1)'
                                }
                            }
                        }
                    }
                });
                console.log('✅ Gráfico de consumo de recursos inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de consumo:', error);
            }
        }
    }

    initializeMaintenanceChart(isMobile = false) {
        const maintenanceCtx = document.getElementById('maintenanceChart');
        if (maintenanceCtx) {
            try {
                this.charts.maintenance = new Chart(maintenanceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Pendientes', 'En Proceso', 'Completados', 'Urgentes'],
                        datasets: [{
                            data: [12, 5, 28, 3],
                            backgroundColor: [
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderColor: [
                                '#f59e0b',
                                '#3b82f6',
                                '#10b981',
                                '#ef4444'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: !isMobile,
                        plugins: {
                            legend: {
                                position: isMobile ? 'bottom' : 'right',
                                labels: {
                                    color: '#e2e8f0',
                                    padding: 15
                                }
                            }
                        }
                    }
                });
                console.log('✅ Gráfico de mantenimiento inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de mantenimiento:', error);
            }
        }
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    setupEventListeners() {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        const notifications = document.getElementById('notifications-bell');
        if (notifications) {
            notifications.addEventListener('click', () => {
                this.showNotificationsPanel();
            });
        }

        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => {
                this.showUserMenu();
            });
        }

        document.querySelectorAll('.period-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.handlePeriodChange(e.target.value);
            });
        });

        this.setupExecutivePanelEvents();
        
        console.log('✅ Event listeners globales configurados');
    }

    setupExecutivePanelEvents() {
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        const reportBtn = document.getElementById('generate-executive-report');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                this.generateExecutiveReport();
            });
        }
    }

    switchSection(sectionId) {
        console.log('Cambiando a sección:', sectionId);
        
        if (this.isMobile) {
            this.sidebarVisible = false;
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('active');
            this.removeOverlay();
        }
        
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            if (this.isMobile) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionId;
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        console.log(`📊 Cargando datos para sección: ${sectionId}`);
        
        try {
            switch(sectionId) {
                case 'panel-ejecutivo':
                    this.loadExecutivePanelData();
                    break;
                case 'gestion-financiera':
                    this.loadFinancialData();
                    break;
                case 'control-accesos':
                    this.loadAccessData();
                    break;
                case 'mantenimiento':
                    this.loadMaintenanceData();
                    break;
                case 'comunicaciones':
                    this.loadCommunicationsData();
                    break;
                case 'configuracion':
                    this.loadConfigurationData();
                    break;
                case 'residentes':
                    this.loadResidentsData();
                    break;
                default:
                    console.log(`ℹ️  No hay carga específica para: ${sectionId}`);
            }
        } catch (error) {
            console.error(`❌ Error cargando sección ${sectionId}:`, error);
            this.showNotification(`Error al cargar sección ${sectionId}`, 'error');
        }
    }

    // ==================== MÓDULO DE MANTENIMIENTO ====================
    initializeMaintenanceModule() {
        this.setupMaintenanceEventListeners();
        this.loadSampleMaintenanceData();
    }

    setupMaintenanceEventListeners() {
        const elements = {
            'new-maintenance-ticket': () => this.openNewMaintenanceTicket(),
            'filter-maintenance': () => this.filterMaintenanceTickets(),
            'refresh-maintenance': () => this.refreshMaintenanceData(),
            'export-maintenance-history': () => this.exportMaintenanceHistory()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        const newTicketForm = document.getElementById('new-maintenance-form');
        if (newTicketForm) {
            newTicketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewMaintenanceTicket();
            });
        }

        const cancelTicket = document.getElementById('cancel-ticket');
        if (cancelTicket) {
            cancelTicket.addEventListener('click', () => {
                this.resetTicketForm();
            });
        }

        this.setupMaintenanceTableEvents();
    }

    setupMaintenanceTableEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-ticket')) {
                const ticketId = e.target.closest('.view-ticket').getAttribute('data-id');
                this.viewTicketDetails(ticketId);
            } else if (e.target.closest('.edit-ticket')) {
                const ticketId = e.target.closest('.edit-ticket').getAttribute('data-id');
                this.editTicket(ticketId);
            }
        });
    }

    loadSampleMaintenanceData() {
        this.maintenanceTickets = [
            {
                id: 'MT-101',
                title: 'Fuga de agua en baño piso 3',
                area: 'plomeria',
                priority: 'urgente',
                status: 'pending',
                location: 'Torre A, Piso 3, Baño principal',
                description: 'Se reporta fuga constante de agua en el baño principal del departamento 301. El agua sale por debajo del lavamanos y ya ha causado daños en el piso.',
                assignee: '',
                reporter: 'Ana Martínez (Depto 301)',
                created: '2024-03-15 09:30',
                updated: '2024-03-15 09:30'
            },
            {
                id: 'MT-102',
                title: 'Ascensor torre B con ruidos',
                area: 'ascensores',
                priority: 'alta',
                status: 'in-progress',
                location: 'Torre B, Ascensor principal',
                description: 'Los residentes reportan ruidos anormales en el ascensor principal de la torre B. El sonido parece provenir del mecanismo de cables.',
                assignee: 'juan-perez',
                reporter: 'Varios residentes',
                created: '2024-03-14 14:20',
                updated: '2024-03-15 10:15'
            },
            {
                id: 'MT-103',
                title: 'Pintura área común piso 1',
                area: 'pintura',
                priority: 'media',
                status: 'pending',
                location: 'Torre A, Piso 1, Pasillo principal',
                description: 'La pintura del pasillo principal del piso 1 presenta desgaste y necesita retoque. Área de aproximadamente 15 metros lineales.',
                assignee: '',
                reporter: 'Personal de limpieza',
                created: '2024-03-13 11:45',
                updated: '2024-03-13 11:45'
            }
        ];
        
        this.updateMaintenanceDashboard();
    }

    updateMaintenanceDashboard() {
        const pending = this.maintenanceTickets.filter(t => t.status === 'pending').length;
        const inProgress = this.maintenanceTickets.filter(t => t.status === 'in-progress').length;
        const completed = 28;
        const urgent = this.maintenanceTickets.filter(t => t.priority === 'urgente').length;

        this.updateElementText('maintenance-pending', pending);
        this.updateElementText('maintenance-in-progress', inProgress);
        this.updateElementText('maintenance-completed', completed);
        this.updateElementText('maintenance-urgent', urgent);

        this.updateMaintenanceTicketsTable();
        this.updateMaintenanceChart();
    }

    updateMaintenanceTicketsTable() {
        const tbody = document.querySelector('#maintenance-tickets-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.maintenanceTickets.map(ticket => `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${this.getAreaDisplayName(ticket.area)}</td>
                <td><span class="badge ${ticket.priority}">${this.capitalizeFirst(ticket.priority)}</span></td>
                <td><span class="status ${ticket.status}">${this.capitalizeFirst(ticket.status.replace('-', ' '))}</span></td>
                <td>${new Date(ticket.created).toLocaleDateString()}</td>
                <td>
                    <button class="btn-icon view-ticket" data-id="${ticket.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-ticket" data-id="${ticket.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getAreaDisplayName(area) {
        const areas = {
            'plomeria': 'Plomería',
            'electricidad': 'Electricidad',
            'ascensores': 'Ascensores',
            'pintura': 'Pintura',
            'jardineria': 'Jardinería',
            'limpieza': 'Limpieza',
            'seguridad': 'Seguridad',
            'otros': 'Otros'
        };
        return areas[area] || area;
    }

    updateMaintenanceChart() {
        if (this.charts.maintenance) {
            const pending = this.maintenanceTickets.filter(t => t.status === 'pending').length;
            const inProgress = this.maintenanceTickets.filter(t => t.status === 'in-progress').length;
            const completed = 28;
            const urgent = this.maintenanceTickets.filter(t => t.priority === 'urgente').length;

            this.charts.maintenance.data.datasets[0].data = [pending, inProgress, completed, urgent];
            this.charts.maintenance.update();
        }
    }

    openNewMaintenanceTicket() {
        const formSection = document.querySelector('#mantenimiento .form-card');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
        this.showNotification('Complete el formulario para crear un nuevo ticket', 'info');
    }

    createNewMaintenanceTicket() {
        const newTicket = {
            id: `MT-${this.nextTicketId++}`,
            title: document.getElementById('ticket-title').value,
            area: document.getElementById('ticket-area').value,
            priority: document.getElementById('ticket-priority').value,
            status: 'pending',
            location: document.getElementById('ticket-location').value,
            description: document.getElementById('ticket-description').value,
            assignee: document.getElementById('ticket-assignee').value,
            reporter: 'Sistema',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };

        this.maintenanceTickets.unshift(newTicket);
        this.updateMaintenanceDashboard();
        this.resetTicketForm();
        
        this.showNotification(`Ticket ${newTicket.id} creado exitosamente`, 'success');
        
        this.updateElementText('active-maintenance', this.maintenanceTickets.filter(t => t.status === 'pending').length);
    }

    resetTicketForm() {
        const form = document.getElementById('new-maintenance-form');
        if (form) {
            form.reset();
        }
    }

    viewTicketDetails(ticketId) {
        const ticket = this.maintenanceTickets.find(t => t.id === ticketId);
        if (!ticket) return;

        document.getElementById('modal-ticket-id').textContent = ticket.id;
        document.getElementById('modal-ticket-title').textContent = ticket.title;
        document.getElementById('modal-ticket-area').textContent = this.getAreaDisplayName(ticket.area);
        document.getElementById('modal-ticket-priority').textContent = this.capitalizeFirst(ticket.priority);
        document.getElementById('modal-ticket-status').textContent = this.capitalizeFirst(ticket.status.replace('-', ' '));
        document.getElementById('modal-ticket-location').textContent = ticket.location;
        document.getElementById('modal-ticket-assignee').textContent = ticket.assignee ? this.getAssigneeName(ticket.assignee) : 'Sin asignar';
        document.getElementById('modal-ticket-description').textContent = ticket.description;
        document.getElementById('modal-ticket-created').textContent = new Date(ticket.created).toLocaleString();
        document.getElementById('modal-ticket-reporter').textContent = ticket.reporter;

        const priorityBadge = document.getElementById('modal-ticket-priority');
        priorityBadge.className = `badge ${ticket.priority}`;
        
        const statusBadge = document.getElementById('modal-ticket-status');
        statusBadge.className = `status ${ticket.status}`;

        const modal = document.getElementById('ticket-details-modal');
        modal.classList.add('active');

        this.setupModalEventListeners(ticketId);
    }

    getAssigneeName(assigneeId) {
        const assignees = {
            'juan-perez': 'Juan Pérez',
            'maria-garcia': 'María García',
            'carlos-lopez': 'Carlos López'
        };
        return assignees[assigneeId] || assigneeId;
    }

    setupModalEventListeners(ticketId) {
        const modal = document.getElementById('ticket-details-modal');
        const closeBtn = document.getElementById('close-ticket-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const editBtn = document.getElementById('edit-ticket-btn');
        const resolveBtn = document.getElementById('resolve-ticket-btn');

        const closeModal = () => {
            modal.classList.remove('active');
        };

        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        
        editBtn.addEventListener('click', () => {
            closeModal();
            this.editTicket(ticketId);
        });

        resolveBtn.addEventListener('click', () => {
            this.resolveTicket(ticketId);
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    async editTicket(ticketId) {
        const ticket = this.maintenanceTickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const result = await this.modalSystem.form('Editar Ticket de Mantenimiento', [
            {
                label: 'Título del Ticket',
                type: 'text',
                value: ticket.title,
                required: true
            },
            {
                label: 'Área',
                type: 'select',
                value: ticket.area,
                options: [
                    { value: 'plomeria', text: 'Plomería' },
                    { value: 'electricidad', text: 'Electricidad' },
                    { value: 'ascensores', text: 'Ascensores' },
                    { value: 'pintura', text: 'Pintura' },
                    { value: 'jardineria', text: 'Jardinería' },
                    { value: 'limpieza', text: 'Limpieza' },
                    { value: 'seguridad', text: 'Seguridad' },
                    { value: 'otros', text: 'Otros' }
                ],
                required: true
            },
            {
                label: 'Prioridad',
                type: 'select',
                value: ticket.priority,
                options: [
                    { value: 'baja', text: 'Baja' },
                    { value: 'media', text: 'Media' },
                    { value: 'alta', text: 'Alta' },
                    { value: 'urgente', text: 'Urgente' }
                ],
                required: true
            },
            {
                label: 'Ubicación',
                type: 'text',
                value: ticket.location,
                required: true
            },
            {
                label: 'Descripción',
                type: 'textarea',
                value: ticket.description,
                required: true
            },
            {
                label: 'Asignar a',
                type: 'select',
                value: ticket.assignee,
                options: [
                    { value: '', text: 'Sin asignar' },
                    { value: 'juan-perez', text: 'Juan Pérez' },
                    { value: 'maria-garcia', text: 'María García' },
                    { value: 'carlos-lopez', text: 'Carlos López' }
                ]
            }
        ]);

        if (result) {
            const ticketIndex = this.maintenanceTickets.findIndex(t => t.id === ticketId);
            if (ticketIndex !== -1) {
                this.maintenanceTickets[ticketIndex] = {
                    ...this.maintenanceTickets[ticketIndex],
                    title: result['Título del Ticket'],
                    area: result['Área'],
                    priority: result['Prioridad'],
                    location: result['Ubicación'],
                    description: result['Descripción'],
                    assignee: result['Asignar a'],
                    updated: new Date().toISOString()
                };

                this.updateMaintenanceDashboard();
                this.showNotification(`Ticket ${ticketId} actualizado exitosamente`, 'success');
            }
        }
    }

    resolveTicket(ticketId) {
        const ticketIndex = this.maintenanceTickets.findIndex(t => t.id === ticketId);
        if (ticketIndex !== -1) {
            this.maintenanceTickets[ticketIndex].status = 'completed';
            this.maintenanceTickets[ticketIndex].updated = new Date().toISOString();
            this.updateMaintenanceDashboard();
            this.showNotification(`Ticket ${ticketId} marcado como resuelto`, 'success');
        }
    }

    async filterMaintenanceTickets() {
        const searchTerm = await this.modalSystem.prompt(
            'Filtrar Tickets de Mantenimiento',
            'Ingrese término de búsqueda:',
            '',
            'text'
        );
        
        if (searchTerm) {
            const filteredTickets = this.maintenanceTickets.filter(ticket => 
                ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            const tbody = document.querySelector('#maintenance-tickets-table tbody');
            if (tbody) {
                tbody.innerHTML = filteredTickets.map(ticket => `
                    <tr>
                        <td>${ticket.id}</td>
                        <td>${ticket.title}</td>
                        <td>${this.getAreaDisplayName(ticket.area)}</td>
                        <td><span class="badge ${ticket.priority}">${this.capitalizeFirst(ticket.priority)}</span></td>
                        <td><span class="status ${ticket.status}">${this.capitalizeFirst(ticket.status.replace('-', ' '))}</span></td>
                        <td>${new Date(ticket.created).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-icon view-ticket" data-id="${ticket.id}" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon edit-ticket" data-id="${ticket.id}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
            
            this.showNotification(`Mostrando ${filteredTickets.length} tickets filtrados`, 'info');
        }
    }

    refreshMaintenanceData() {
        this.loadMaintenanceData();
        this.showNotification('Datos de mantenimiento actualizados', 'success');
    }

    exportMaintenanceHistory() {
        const historyData = this.maintenanceTickets.map(ticket => ({
            ID: ticket.id,
            Título: ticket.title,
            Área: this.getAreaDisplayName(ticket.area),
            Prioridad: this.capitalizeFirst(ticket.priority),
            Estado: this.capitalizeFirst(ticket.status.replace('-', ' ')),
            Ubicación: ticket.location,
            Fecha: new Date(ticket.created).toLocaleDateString()
        }));

        const csvContent = this.convertToCSV(historyData);
        this.downloadCSV(csvContent, 'historial_mantenimiento.csv');
        this.showNotification('Historial exportado exitosamente', 'success');
    }

    // ==================== MÓDULO FINANCIERO ====================
    initializeFinancialModule() {
        this.setupFinancialEventListeners();
        this.loadSampleFinancialData();
    }

    setupFinancialEventListeners() {
        const elements = {
            'new-invoice': () => this.createNewInvoice(),
            'financial-reports': () => this.generateFinancialReports(),
            'register-payment': () => this.registerManualPayment(),
            'validate-online-payment': () => this.validateOnlinePayment(),
            'generate-receipt': () => this.generateReceipt(),
            'send-reminder': () => this.sendPaymentReminder(),
            'create-payment-plan': () => this.createPaymentPlan(),
            'block-access': () => this.blockAccessForDebt(),
            'filter-payments': () => this.filterPayments(),
            'filter-debtors': () => this.filterDebtors()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        const searchPayments = document.getElementById('search-payments');
        if (searchPayments) {
            searchPayments.addEventListener('input', (e) => {
                this.filterPaymentsTable(e.target.value);
            });
        }

        const searchDebtors = document.getElementById('search-debtors');
        if (searchDebtors) {
            searchDebtors.addEventListener('input', (e) => {
                this.filterDebtorsTable(e.target.value);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-payment')) {
                const paymentId = e.target.closest('.view-payment').getAttribute('data-id');
                this.viewPaymentDetails(paymentId);
            } else if (e.target.closest('.send-reminder')) {
                const resident = e.target.closest('.send-reminder').getAttribute('data-resident');
                this.sendIndividualReminder(resident);
            } else if (e.target.closest('.create-plan')) {
                const resident = e.target.closest('.create-plan').getAttribute('data-resident');
                this.createIndividualPaymentPlan(resident);
            }
        });
    }

    loadSampleFinancialData() {
        this.payments = [
            {
                id: 'P-001',
                resident: 'Juan Pérez',
                amount: 120000,
                date: '2024-03-15',
                method: 'Transferencia',
                status: 'completed'
            },
            {
                id: 'P-002',
                resident: 'María García',
                amount: 120000,
                date: '2024-03-14',
                method: 'Efectivo',
                status: 'completed'
            },
            {
                id: 'P-003',
                resident: 'Pedro López',
                amount: 120000,
                date: '2024-03-14',
                method: 'Tarjeta',
                status: 'pending'
            }
        ];

        this.debtors = [
            {
                resident: 'Carlos López',
                department: 'Torre A - 201',
                amount: 5200,
                daysLate: 45
            },
            {
                resident: 'Ana Martínez',
                department: 'Torre B - 305',
                amount: 3800,
                daysLate: 30
            },
            {
                resident: 'Roberto Sánchez',
                department: 'Torre A - 102',
                amount: 2850,
                daysLate: 60
            }
        ];

        this.updateFinancialDashboard();
    }

    updateFinancialDashboard() {
        this.updatePaymentsTable();
        this.updateDebtorsTable();
        this.updateFinancialStats();
    }

    updatePaymentsTable() {
        const tbody = document.querySelector('#payments-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.resident}</td>
                <td>$${payment.amount.toLocaleString()}</td>
                <td>${payment.date}</td>
                <td>${payment.method}</td>
                <td><span class="status ${payment.status}">${this.capitalizeFirst(payment.status)}</span></td>
                <td>
                    <button class="btn-icon view-payment" data-id="${payment.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateDebtorsTable() {
        const tbody = document.querySelector('#debtors-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.debtors.map(debtor => `
            <tr>
                <td>${debtor.resident}</td>
                <td>${debtor.department}</td>
                <td>$${debtor.amount.toLocaleString()}</td>
                <td><span class="badge ${debtor.daysLate > 45 ? 'urgent' : debtor.daysLate > 30 ? 'high' : 'medium'}">${debtor.daysLate} días</span></td>
                <td>
                    <button class="btn-icon send-reminder" data-resident="${debtor.resident}" title="Enviar recordatorio">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="btn-icon create-plan" data-resident="${debtor.resident}" title="Plan de pago">
                        <i class="fas fa-calendar"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateFinancialStats() {
        const onTime = this.payments.filter(p => p.status === 'completed').length;
        const pending = this.payments.filter(p => p.status === 'pending').length;
        const overdue = this.debtors.length;
        const debtors = this.debtors.length;

        this.updateElementText('payments-on-time', onTime);
        this.updateElementText('pending-payments', pending);
        this.updateElementText('overdue-payments', overdue);
        this.updateElementText('debtors-count', debtors);
    }

    async createNewInvoice() {
        const result = await this.modalSystem.form('Crear Nueva Factura', [
            {
                label: 'Residente',
                type: 'text',
                placeholder: 'Nombre del residente',
                required: true
            },
            {
                label: 'Monto',
                type: 'number',
                placeholder: 'Monto en pesos',
                required: true
            },
            {
                label: 'Descripción',
                type: 'text',
                placeholder: 'Descripción del cargo',
                required: true
            },
            {
                label: 'Fecha de Vencimiento',
                type: 'date',
                required: true
            }
        ]);

        if (result) {
            const newInvoice = {
                id: `F-${Date.now()}`,
                resident: result['Residente'],
                amount: parseFloat(result['Monto']),
                description: result['Descripción'],
                dueDate: result['Fecha de Vencimiento'],
                date: new Date().toISOString().split('T')[0],
                status: 'pending'
            };
            
            this.showNotification(`Factura ${newInvoice.id} creada para ${result['Residente']}`, 'success');
        }
    }

    generateFinancialReports() {
        const reportData = {
            ingresos: 125430,
            gastos: 85200,
            utilidad: 40230,
            morosidad: 12850,
            pagosPendientes: this.payments.filter(p => p.status === 'pending').length
        };

        const reportContent = `
REPORTE FINANCIERO - QUANTUM TOWER
Fecha: ${new Date().toLocaleDateString()}

INGRESOS:
• Total Ingresos: $${reportData.ingresos.toLocaleString()}
• Total Gastos: $${reportData.gastos.toLocaleString()}
• Utilidad Neta: $${reportData.utilidad.toLocaleString()}

MOROSIDAD:
• Monto en Mora: $${reportData.morosidad.toLocaleString()}
• Pagos Pendientes: ${reportData.pagosPendientes}

RESUMEN DE PAGOS:
${this.payments.map(p => `• ${p.resident}: $${p.amount.toLocaleString()} - ${p.status}`).join('\n')}
        `;

        this.downloadTextFile(reportContent, 'reporte_financiero.txt');
        this.showNotification('Reporte financiero generado exitosamente', 'success');
    }

    async registerManualPayment() {
        const result = await this.modalSystem.form('Registrar Pago Manual', [
            {
                label: 'Residente',
                type: 'text',
                placeholder: 'Nombre del residente',
                required: true
            },
            {
                label: 'Monto',
                type: 'number',
                placeholder: 'Monto del pago',
                required: true
            },
            {
                label: 'Método de Pago',
                type: 'select',
                options: [
                    { value: 'transfer', text: 'Transferencia Bancaria' },
                    { value: 'cash', text: 'Efectivo' },
                    { value: 'card', text: 'Tarjeta de Crédito/Débito' },
                    { value: 'check', text: 'Cheque' }
                ],
                required: true
            },
            {
                label: 'Fecha del Pago',
                type: 'date',
                required: true
            }
        ]);
        
        if (result) {
            const newPayment = {
                id: `P-${this.nextPaymentId++}`,
                resident: result['Residente'],
                amount: parseFloat(result['Monto']),
                date: result['Fecha del Pago'],
                method: result['Método de Pago'],
                status: 'completed'
            };
            
            this.payments.unshift(newPayment);
            this.updateFinancialDashboard();
            this.showNotification(`Pago ${newPayment.id} registrado exitosamente`, 'success');
        }
    }

    async validateOnlinePayment() {
        const paymentId = await this.modalSystem.prompt(
            'Validar Pago Online',
            'Ingrese el ID del pago a validar:',
            '',
            'text'
        );
        
        if (paymentId) {
            const payment = this.payments.find(p => p.id === paymentId);
            if (payment) {
                payment.status = 'completed';
                this.updateFinancialDashboard();
                this.showNotification(`Pago ${paymentId} validado exitosamente`, 'success');
            } else {
                this.showNotification('Pago no encontrado', 'error');
            }
        }
    }

    async generateReceipt() {
        const paymentId = await this.modalSystem.prompt(
            'Generar Recibo',
            'Ingrese el ID del pago:',
            '',
            'text'
        );
        
        if (paymentId) {
            const payment = this.payments.find(p => p.id === paymentId);
            if (payment) {
                const receiptContent = `
RECIBO DE PAGO - QUANTUM TOWER
Número: ${payment.id}
Fecha: ${new Date().toLocaleDateString()}

RESIDENTE: ${payment.resident}
MONTO: $${payment.amount.toLocaleString()}
MÉTODO: ${payment.method}
ESTADO: ${payment.status}

¡Gracias por su pago!
                `;
                
                this.downloadTextFile(receiptContent, `recibo_${payment.id}.txt`);
                this.showNotification('Recibo generado exitosamente', 'success');
            } else {
                this.showNotification('Pago no encontrado', 'error');
            }
        }
    }

    async sendPaymentReminder() {
        const confirm = await this.modalSystem.confirm(
            'Enviar Recordatorios',
            `¿Está seguro de que desea enviar recordatorios a ${this.debtors.length} residentes morosos?`
        );
        
        if (confirm) {
            const selectedDebtors = this.debtors.map(d => d.resident).join(', ');
            this.showNotification(`Recordatorio enviado a: ${selectedDebtors}`, 'success');
        }
    }

    async sendIndividualReminder(resident) {
        const confirm = await this.modalSystem.confirm(
            'Enviar Recordatorio',
            `¿Enviar recordatorio de pago a ${resident}?`
        );
        
        if (confirm) {
            this.showNotification(`Recordatorio enviado a ${resident}`, 'success');
        }
    }

    async createPaymentPlan() {
        const resident = await this.modalSystem.prompt(
            'Crear Plan de Pago',
            'Ingrese el nombre del residente:',
            '',
            'text'
        );
        
        if (!resident) return;

        const amount = await this.modalSystem.prompt(
            'Crear Plan de Pago',
            'Ingrese el monto total:',
            '',
            'number'
        );

        const installments = await this.modalSystem.prompt(
            'Crear Plan de Pago',
            'Ingrese el número de cuotas:',
            '3',
            'number'
        );
        
        if (resident && amount && installments) {
            const installmentAmount = (parseFloat(amount) / parseInt(installments)).toFixed(2);
            this.showNotification(`Plan de pago creado para ${resident}: ${installments} cuotas de $${installmentAmount}`, 'success');
        }
    }

    async createIndividualPaymentPlan(resident) {
        const amount = await this.modalSystem.prompt(
            'Crear Plan de Pago',
            `Ingrese el monto total para ${resident}:`,
            '',
            'number'
        );

        const installments = await this.modalSystem.prompt(
            'Crear Plan de Pago',
            'Ingrese el número de cuotas:',
            '3',
            'number'
        );
        
        if (amount && installments) {
            const installmentAmount = (parseFloat(amount) / parseInt(installments)).toFixed(2);
            this.showNotification(`Plan de pago creado para ${resident}: ${installments} cuotas de $${installmentAmount}`, 'success');
        }
    }

    async blockAccessForDebt() {
        const confirm = await this.modalSystem.confirm(
            'Bloquear Acceso',
            `¿Está seguro de que desea bloquear el acceso a ${this.debtors.length} residentes morosos?`
        );
        
        if (confirm) {
            const selectedDebtors = this.debtors.map(d => d.resident).join(', ');
            this.showNotification(`Acceso bloqueado para: ${selectedDebtors}`, 'warning');
        }
    }

    async filterPayments() {
        const searchTerm = await this.modalSystem.prompt(
            'Filtrar Pagos',
            'Ingrese término de búsqueda:',
            '',
            'text'
        );
        
        if (searchTerm) {
            this.filterPaymentsTable(searchTerm);
        }
    }

    filterPaymentsTable(searchTerm) {
        const filteredPayments = this.payments.filter(payment => 
            payment.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.method.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const tbody = document.querySelector('#payments-table tbody');
        if (tbody) {
            tbody.innerHTML = filteredPayments.map(payment => `
                <tr>
                    <td>${payment.id}</td>
                    <td>${payment.resident}</td>
                    <td>$${payment.amount.toLocaleString()}</td>
                    <td>${payment.date}</td>
                    <td>${payment.method}</td>
                    <td><span class="status ${payment.status}">${this.capitalizeFirst(payment.status)}</span></td>
                    <td>
                        <button class="btn-icon view-payment" data-id="${payment.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    async filterDebtors() {
        const searchTerm = await this.modalSystem.prompt(
            'Filtrar Deudores',
            'Ingrese término de búsqueda:',
            '',
            'text'
        );
        
        if (searchTerm) {
            this.filterDebtorsTable(searchTerm);
        }
    }

    filterDebtorsTable(searchTerm) {
        const filteredDebtors = this.debtors.filter(debtor => 
            debtor.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
            debtor.department.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const tbody = document.querySelector('#debtors-table tbody');
        if (tbody) {
            tbody.innerHTML = filteredDebtors.map(debtor => `
                <tr>
                    <td>${debtor.resident}</td>
                    <td>${debtor.department}</td>
                    <td>$${debtor.amount.toLocaleString()}</td>
                    <td><span class="badge ${debtor.daysLate > 45 ? 'urgent' : debtor.daysLate > 30 ? 'high' : 'medium'}">${debtor.daysLate} días</span></td>
                    <td>
                        <button class="btn-icon send-reminder" data-resident="${debtor.resident}" title="Enviar recordatorio">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn-icon create-plan" data-resident="${debtor.resident}" title="Plan de pago">
                            <i class="fas fa-calendar"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    viewPaymentDetails(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            const details = `
ID: ${payment.id}
Residente: ${payment.resident}
Monto: $${payment.amount.toLocaleString()}
Fecha: ${payment.date}
Método: ${payment.method}
Estado: ${payment.status}
            `;
            this.modalSystem.alert('Detalles del Pago', details, 'info');
        }
    }

    // ==================== MÓDULO DE ACCESOS ====================
    initializeAccessModule() {
        this.setupAccessEventListeners();
        this.loadSampleAccessData();
    }

    setupAccessEventListeners() {
        const elements = {
            'new-access': () => this.createNewAccess(),
            'access-history': () => this.showAccessHistory(),
            'cancel-permission': () => this.resetPermissionForm()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        const permissionForm = document.getElementById('new-permission-form');
        if (permissionForm) {
            permissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewPermission();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-permission')) {
                const user = e.target.closest('.edit-permission').getAttribute('data-user');
                this.editPermission(user);
            }
        });
    }

    loadSampleAccessData() {
        this.accessLogs = [
            {
                user: 'Juan Pérez',
                type: 'resident',
                time: '08:30 AM',
                door: 'Principal',
                status: 'success'
            },
            {
                user: 'María García',
                type: 'visitor',
                time: '09:15 AM',
                door: 'Estacionamiento',
                status: 'success'
            },
            {
                user: 'Carlos López',
                type: 'technician',
                time: '10:00 AM',
                door: 'Servicio',
                status: 'success'
            }
        ];

        this.accessPermissions = [
            {
                user: 'Juan Pérez',
                type: 'resident',
                areas: ['Principal', 'Estacionamiento', 'Gimnasio'],
                schedule: '24/7',
                validUntil: '2024-12-31'
            },
            {
                user: 'María García',
                type: 'visitor',
                areas: ['Principal'],
                schedule: 'Business Hours',
                validUntil: '2024-03-20'
            }
        ];

        this.updateAccessDashboard();
    }

    updateAccessDashboard() {
        this.updateAccessStats();
        this.updateAccessMonitor();
        this.updatePermissionsTable();
    }

    updateAccessStats() {
        this.updateElementText('today-access-count', '127');
        this.updateElementText('active-residents', '89');
        this.updateElementText('registered-visitors', '15');
        this.updateElementText('security-incidents', '2');
    }

    updateAccessMonitor() {
        const monitorFeed = document.getElementById('real-time-access');
        if (monitorFeed) {
            monitorFeed.innerHTML = this.accessLogs.map(log => `
                <div class="access-event success">
                    <div class="event-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="event-content">
                        <h4>${log.user} - ${log.door}</h4>
                        <p>${log.time} • ${this.capitalizeFirst(log.type)}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    updatePermissionsTable() {
        const tbody = document.querySelector('#access-permissions-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.accessPermissions.map(permission => `
            <tr>
                <td>${permission.user}</td>
                <td><span class="badge ${permission.type}">${this.capitalizeFirst(permission.type)}</span></td>
                <td>${permission.areas.join(', ')}</td>
                <td>${permission.schedule}</td>
                <td>${permission.validUntil}</td>
                <td>
                    <button class="btn-icon edit-permission" data-user="${permission.user}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async createNewAccess() {
        const result = await this.modalSystem.form('Crear Nuevo Acceso', [
            {
                label: 'Usuario',
                type: 'text',
                placeholder: 'Nombre del usuario',
                required: true
            },
            {
                label: 'Tipo de Acceso',
                type: 'select',
                options: [
                    { value: 'resident', text: 'Residente' },
                    { value: 'visitor', text: 'Visitante' },
                    { value: 'staff', text: 'Personal' },
                    { value: 'contractor', text: 'Contratista' }
                ],
                required: true
            },
            {
                label: 'Puerta/Área',
                type: 'text',
                placeholder: 'Ej: Principal, Estacionamiento',
                required: true
            },
            {
                label: 'Horario',
                type: 'text',
                placeholder: 'Ej: 24/7, 8:00-18:00',
                required: true
            }
        ]);

        if (result) {
            this.showNotification(`Acceso creado para ${result['Usuario']}`, 'success');
        }
    }

    showAccessHistory() {
        const historyContent = this.accessLogs.map(log => 
            `${log.time} - ${log.user} (${log.type}) - ${log.door} - ${log.status}`
        ).join('\n');
        
        this.modalSystem.alert('Historial de Accesos', historyContent, 'info');
    }

    createNewPermission() {
        const user = document.getElementById('permission-user').value;
        const type = document.getElementById('permission-type').value;
        const areas = Array.from(document.querySelectorAll('input[name="access-areas"]:checked'))
            .map(cb => cb.value);
        const schedule = document.getElementById('access-schedule').value;
        const validUntil = document.getElementById('permission-valid-until').value;

        if (user && areas.length > 0 && validUntil) {
            const newPermission = {
                user: document.getElementById('permission-user').options[document.getElementById('permission-user').selectedIndex].text,
                type: type,
                areas: areas.map(area => this.getAreaDisplayName(area)),
                schedule: schedule,
                validUntil: validUntil
            };

            this.accessPermissions.push(newPermission);
            this.updatePermissionsTable();
            this.resetPermissionForm();
            this.showNotification(`Permiso creado para ${newPermission.user}`, 'success');
        } else {
            this.showNotification('Complete todos los campos requeridos', 'error');
        }
    }

    resetPermissionForm() {
        const form = document.getElementById('new-permission-form');
        if (form) {
            form.reset();
        }
    }

    async editPermission(user) {
        const permission = this.accessPermissions.find(p => p.user === user);
        if (permission) {
            const result = await this.modalSystem.form('Editar Permiso', [
                {
                    label: 'Usuario',
                    type: 'text',
                    value: permission.user,
                    required: true
                },
                {
                    label: 'Tipo de Acceso',
                    type: 'select',
                    value: permission.type,
                    options: [
                        { value: 'resident', text: 'Residente' },
                        { value: 'visitor', text: 'Visitante' },
                        { value: 'staff', text: 'Personal' },
                        { value: 'contractor', text: 'Contratista' }
                    ],
                    required: true
                },
                {
                    label: 'Horario de Acceso',
                    type: 'text',
                    value: permission.schedule,
                    required: true
                },
                {
                    label: 'Válido Hasta',
                    type: 'date',
                    value: permission.validUntil,
                    required: true
                }
            ]);

            if (result) {
                const permissionIndex = this.accessPermissions.findIndex(p => p.user === user);
                if (permissionIndex !== -1) {
                    this.accessPermissions[permissionIndex] = {
                        ...this.accessPermissions[permissionIndex],
                        type: result['Tipo de Acceso'],
                        schedule: result['Horario de Acceso'],
                        validUntil: result['Válido Hasta']
                    };

                    this.updatePermissionsTable();
                    this.showNotification(`Permiso de ${user} actualizado`, 'success');
                }
            }
        }
    }

    // ==================== MÓDULO DE COMUNICACIONES ====================
    initializeCommunicationsModule() {
        this.setupCommunicationsEventListeners();
        this.loadSampleCommunicationsData();
    }

    setupCommunicationsEventListeners() {
        const elements = {
            'new-announcement': () => this.createNewAnnouncement(),
            'send-email': () => this.sendEmail(),
            'cancel-communication': () => this.resetCommunicationForm()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        const communicationForm = document.getElementById('communication-form');
        if (communicationForm) {
            communicationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendCommunication();
            });
        }
    }

    loadSampleCommunicationsData() {
        this.communications = [
            {
                id: 'C-001',
                type: 'maintenance',
                title: 'Mantenimiento Ascensores',
                audience: 'Todos',
                date: '2024-03-15 10:30',
                message: 'Se realizará mantenimiento preventivo en los ascensores este viernes de 2:00 PM a 6:00 PM.'
            },
            {
                id: 'C-002',
                type: 'service',
                title: 'Corte Programado de Agua',
                audience: 'Torre A',
                date: '2024-03-14 16:45',
                message: 'Corte programado de agua para mantenimiento del sistema hidráulico.'
            }
        ];

        this.updateCommunicationsDashboard();
    }

    updateCommunicationsDashboard() {
        this.updateCommunicationsHistory();
    }

    updateCommunicationsHistory() {
        const historyList = document.getElementById('communications-history');
        if (historyList) {
            historyList.innerHTML = this.communications.map(comm => `
                <div class="history-item">
                    <div class="history-icon ${comm.type}">
                        <i class="fas fa-${comm.type === 'maintenance' ? 'tools' : 'exclamation-triangle'}"></i>
                    </div>
                    <div class="history-content">
                        <h4>${comm.title}</h4>
                        <p>Enviado a: ${comm.audience} • ${comm.date}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    createNewAnnouncement() {
        document.getElementById('communication-type').value = 'Anuncio General';
        document.getElementById('communication-audience').value = 'Todos los Residentes';
        this.showNotification('Formulario listo para nuevo anuncio', 'info');
    }

    async sendEmail() {
        const result = await this.modalSystem.form('Enviar Email', [
            {
                label: 'Destinatario',
                type: 'text',
                placeholder: 'Email del destinatario',
                required: true
            },
            {
                label: 'Asunto',
                type: 'text',
                placeholder: 'Asunto del email',
                required: true
            },
            {
                label: 'Mensaje',
                type: 'textarea',
                placeholder: 'Escriba su mensaje aquí...',
                required: true
            }
        ]);

        if (result) {
            this.showNotification(`Email enviado a ${result['Destinatario']}`, 'success');
        }
    }

    sendCommunication() {
        const type = document.getElementById('communication-type').value;
        const audience = document.getElementById('communication-audience').value;
        const subject = document.getElementById('communication-subject').value;
        const message = document.getElementById('communication-message').value;

        if (subject && message) {
            const newCommunication = {
                id: `C-${this.nextCommunicationId++}`,
                type: type.toLowerCase().includes('anuncio') ? 'announcement' : 
                      type.toLowerCase().includes('mantenimiento') ? 'maintenance' : 
                      type.toLowerCase().includes('emergencia') ? 'emergency' : 'service',
                title: subject,
                audience: audience,
                date: new Date().toLocaleString(),
                message: message
            };

            this.communications.unshift(newCommunication);
            this.updateCommunicationsHistory();
            this.resetCommunicationForm();
            this.showNotification('Comunicación enviada exitosamente', 'success');
        } else {
            this.showNotification('Complete el asunto y mensaje', 'error');
        }
    }

    resetCommunicationForm() {
        const form = document.getElementById('communication-form');
        if (form) {
            form.reset();
        }
    }

    // ==================== MÓDULO DE RESIDENTES ====================
    initializeResidentsModule() {
        this.setupResidentsEventListeners();
        this.loadSampleResidentsData();
    }

    setupResidentsEventListeners() {
        const elements = {
            'new-resident': () => this.createNewResident(),
            'export-residents': () => this.exportResidents(),
            'filter-residents': () => this.filterResidents()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        const searchResidents = document.getElementById('search-residents');
        if (searchResidents) {
            searchResidents.addEventListener('input', (e) => {
                this.filterResidentsTable(e.target.value);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-resident')) {
                const resident = e.target.closest('.edit-resident').getAttribute('data-resident');
                this.editResident(resident);
            }
        });
    }

    loadSampleResidentsData() {
        this.residents = [
            {
                name: 'Juan Pérez',
                department: 'Torre A - 501',
                phone: '+56 9 1234 5678',
                email: 'juan.perez@email.com',
                status: 'active'
            },
            {
                name: 'María González',
                department: 'Torre B - 302',
                phone: '+56 9 8765 4321',
                email: 'maria.gonzalez@email.com',
                status: 'active'
            },
            {
                name: 'Carlos López',
                department: 'Torre A - 201',
                phone: '+56 9 5555 6666',
                email: 'carlos.lopez@email.com',
                status: 'warning'
            },
            {
                name: 'Ana Martínez',
                department: 'Torre B - 405',
                phone: '+56 9 7777 8888',
                email: 'ana.martinez@email.com',
                status: 'active'
            },
            {
                name: 'Roberto Sánchez',
                department: 'Torre A - 102',
                phone: '+56 9 9999 0000',
                email: 'roberto.sanchez@email.com',
                status: 'inactive'
            }
        ];

        this.updateResidentsDashboard();
    }

    updateResidentsDashboard() {
        this.updateResidentsTable();
        this.updateResidentsStats();
        
        // También actualizar estadísticas relacionadas en otras secciones
        this.updateElementText('active-residents', this.residents.filter(r => r.status === 'active').length);
        this.updateElementText('total-residents', this.residents.length);
    }

    updateResidentsTable() {
        const tbody = document.querySelector('#residents-table tbody');
        if (!tbody) {
            console.error('No se encontró la tabla de residentes');
            return;
        }
        
        console.log('Actualizando tabla de residentes con:', this.residents.length, 'residentes');
        
        tbody.innerHTML = this.residents.map(resident => `
            <tr>
                <td>${resident.name}</td>
                <td>${resident.department}</td>
                <td>${resident.phone}</td>
                <td>${resident.email}</td>
                <td><span class="status ${resident.status}">${this.capitalizeFirst(resident.status)}</span></td>
                <td>
                    <button class="btn-icon edit-resident" data-resident="${resident.name}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-resident" data-resident="${resident.name}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Agregar event listeners para los botones de eliminar
        this.setupResidentsDeleteEvents();
    }

    updateResidentsStats() {
        const total = this.residents.length;
        const active = this.residents.filter(r => r.status === 'active').length;
        const inactive = this.residents.filter(r => r.status === 'inactive').length;
        const warning = this.residents.filter(r => r.status === 'warning').length;

        console.log('Estadísticas de residentes - Total:', total, 'Activos:', active, 'Inactivos:', inactive, 'En mora:', warning);

        this.updateElementText('total-residents', total);
        this.updateElementText('active-residents-count', active);
        this.updateElementText('inactive-residents', inactive + warning); // Sumar inactivos y en mora
        
        // Actualizar también en la sección de control de accesos si existe
        this.updateElementText('active-residents', active);
    }

    setupResidentsDeleteEvents() {
        document.querySelectorAll('.delete-resident').forEach(button => {
            button.addEventListener('click', async (e) => {
                const residentName = e.target.closest('.delete-resident').getAttribute('data-resident');
                await this.deleteResident(residentName);
            });
        });
    }

    async deleteResident(residentName) {
        const confirm = await this.modalSystem.confirm(
            'Eliminar Residente',
            `¿Está seguro de que desea eliminar a ${residentName}? Esta acción no se puede deshacer.`
        );
        
        if (confirm) {
            const index = this.residents.findIndex(r => r.name === residentName);
            if (index !== -1) {
                this.residents.splice(index, 1);
                this.updateResidentsDashboard();
                this.showNotification(`Residente ${residentName} eliminado exitosamente`, 'success');
            }
        }
    }

    async createNewResident() {
        const result = await this.modalSystem.form('Nuevo Residente', [
            {
                label: 'Nombre',
                type: 'text',
                placeholder: 'Nombre completo',
                required: true
            },
            {
                label: 'Departamento',
                type: 'text',
                placeholder: 'Ej: Torre A - 501',
                required: true
            },
            {
                label: 'Teléfono',
                type: 'tel',
                placeholder: '+56 9 1234 5678',
                required: true
            },
            {
                label: 'Email',
                type: 'email',
                placeholder: 'ejemplo@email.com',
                required: true
            },
            {
                label: 'Estado',
                type: 'select',
                options: [
                    { value: 'active', text: 'Activo' },
                    { value: 'inactive', text: 'Inactivo' },
                    { value: 'warning', text: 'En mora' }
                ],
                required: true
            }
        ]);

        if (result) {
            const newResident = {
                name: result['Nombre'],
                department: result['Departamento'],
                phone: result['Teléfono'],
                email: result['Email'],
                status: result['Estado']
            };

            // AGREGAR A LA LISTA DE RESIDENTES
            this.residents.push(newResident);
            
            // ACTUALIZAR LA TABLA Y ESTADÍSTICAS
            this.updateResidentsDashboard();
            
            this.showNotification(`Residente ${result['Nombre']} agregado exitosamente`, 'success');
            
            // ACTUALIZAR ESTADÍSTICAS DEL PANEL EJECUTIVO
            this.updateElementText('total-residents', this.residents.length);
            this.updateElementText('active-residents-count', this.residents.filter(r => r.status === 'active').length);
        }
    }

    async editResident(residentName) {
        const resident = this.residents.find(r => r.name === residentName);
        if (resident) {
            const result = await this.modalSystem.form('Editar Residente', [
                {
                    label: 'Nombre',
                    type: 'text',
                    value: resident.name,
                    required: true
                },
                {
                    label: 'Departamento',
                    type: 'text',
                    value: resident.department,
                    required: true
                },
                {
                    label: 'Teléfono',
                    type: 'tel',
                    value: resident.phone,
                    required: true
                },
                {
                    label: 'Email',
                    type: 'email',
                    value: resident.email,
                    required: true
                },
                {
                    label: 'Estado',
                    type: 'select',
                    value: resident.status,
                    options: [
                        { value: 'active', text: 'Activo' },
                        { value: 'inactive', text: 'Inactivo' },
                        { value: 'warning', text: 'En mora' }
                    ],
                    required: true
                }
            ]);
            
            if (result) {
                // Actualizar el residente existente
                resident.name = result['Nombre'];
                resident.department = result['Departamento'];
                resident.phone = result['Teléfono'];
                resident.email = result['Email'];
                resident.status = result['Estado'];
                
                this.updateResidentsDashboard();
                this.showNotification(`Residente ${result['Nombre']} actualizado`, 'success');
            }
        }
    }

    exportResidents() {
        const csvContent = this.convertToCSV(this.residents);
        this.downloadCSV(csvContent, 'lista_residentes.csv');
        this.showNotification('Lista de residentes exportada', 'success');
    }

    async filterResidents() {
        const searchTerm = await this.modalSystem.prompt(
            'Filtrar Residentes',
            'Ingrese término de búsqueda:',
            '',
            'text'
        );
        
        if (searchTerm) {
            this.filterResidentsTable(searchTerm);
        }
    }

    filterResidentsTable(searchTerm) {
        const filteredResidents = this.residents.filter(resident => 
            resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resident.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const tbody = document.querySelector('#residents-table tbody');
        if (tbody) {
            tbody.innerHTML = filteredResidents.map(resident => `
                <tr>
                    <td>${resident.name}</td>
                    <td>${resident.department}</td>
                    <td>${resident.phone}</td>
                    <td>${resident.email}</td>
                    <td><span class="status ${resident.status}">${this.capitalizeFirst(resident.status)}</span></td>
                    <td>
                        <button class="btn-icon edit-resident" data-resident="${resident.name}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-resident" data-resident="${resident.name}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // Re-configurar event listeners después de filtrar
            this.setupResidentsDeleteEvents();
        }
        
        this.showNotification(`Mostrando ${filteredResidents.length} residentes filtrados`, 'info');
    }

    // ==================== MÓDULO DE CONFIGURACIÓN ====================
    initializeConfigurationModule() {
        this.setupConfigurationEventListeners();
        this.loadSampleSettings();
    }

    setupConfigurationEventListeners() {
        const elements = {
            'save-settings': () => this.saveSettings(),
            'reset-settings': () => this.resetSettings()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        this.setupSettingsValidation();
    }

    setupSettingsValidation() {
        const loginAttempts = document.getElementById('login-attempts');
        if (loginAttempts) {
            loginAttempts.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value < 3 || value > 10) {
                    this.showNotification('El número de intentos debe estar entre 3 y 10', 'warning');
                    e.target.value = 5;
                }
            });
        }

        const gracePeriod = document.getElementById('grace-period');
        if (gracePeriod) {
            gracePeriod.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value < 0 || value > 15) {
                    this.showNotification('Los días de gracia deben estar entre 0 y 15', 'warning');
                    e.target.value = 5;
                }
            });
        }

        const lateInterest = document.getElementById('late-interest');
        if (lateInterest) {
            lateInterest.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                if (value < 0 || value > 10) {
                    this.showNotification('El interés por mora debe estar entre 0% y 10%', 'warning');
                    e.target.value = 1.5;
                }
            });
        }
    }

    loadSampleSettings() {
        this.settings = {
            building: {
                name: 'Quantum Tower',
                address: 'Av. Principal #123',
                phone: '+56 2 2345 6789',
                email: 'admin@quantumtower.cl',
                hours: 'Lunes a Viernes 8:00 - 18:00'
            },
            notifications: {
                securityAlerts: true,
                paymentReminders: true,
                maintenanceNotifications: true,
                generalCommunications: false,
                emergencyAlerts: true
            },
            security: {
                passwordRequirement: 'medium',
                passwordExpiry: 90,
                twoFactorAuth: 'required',
                loginAttempts: 5
            },
            reports: {
                frequency: 'weekly',
                recipients: 'admin@quantumtower.cl, gerencia@quantumtower.cl',
                format: 'pdf'
            },
            maintenance: {
                reminder: 7,
                urgentThreshold: 4,
                providers: 'Servicio Técnico ABC, Mantenimientos XYZ, Electricidad Pro'
            },
            financial: {
                currency: 'CLP',
                gracePeriod: 5,
                lateInterest: 1.5,
                paymentMethods: ['transfer', 'cash', 'card']
            }
        };

        this.updateConfigurationDashboard();
    }

    updateConfigurationDashboard() {
        this.updateBuildingSettings();
        this.updateNotificationSettings();
        this.updateSecuritySettings();
        this.updateReportSettings();
        this.updateMaintenanceSettings();
        this.updateFinancialSettings();
    }

    updateBuildingSettings() {
        const settings = this.settings.building;
        this.setInputValue('building-name', settings.name);
        this.setInputValue('building-address', settings.address);
        this.setInputValue('building-phone', settings.phone);
        this.setInputValue('building-email', settings.email);
        this.setInputValue('building-hours', settings.hours);
    }

    updateNotificationSettings() {
        const settings = this.settings.notifications;
        this.setCheckboxValue('security-alerts', settings.securityAlerts);
        this.setCheckboxValue('payment-reminders', settings.paymentReminders);
        this.setCheckboxValue('maintenance-notifications', settings.maintenanceNotifications);
        this.setCheckboxValue('general-communications', settings.generalCommunications);
        this.setCheckboxValue('emergency-alerts', settings.emergencyAlerts);
    }

    updateSecuritySettings() {
        const settings = this.settings.security;
        this.setSelectValue('password-requirement', settings.passwordRequirement);
        this.setInputValue('password-expiry', settings.passwordExpiry);
        this.setSelectValue('two-factor-auth', settings.twoFactorAuth);
        this.setInputValue('login-attempts', settings.loginAttempts);
    }

    updateReportSettings() {
        const settings = this.settings.reports;
        this.setSelectValue('report-frequency', settings.frequency);
        this.setInputValue('report-recipients', settings.recipients);
        this.setSelectValue('report-format', settings.format);
    }

    updateMaintenanceSettings() {
        const settings = this.settings.maintenance;
        this.setInputValue('maintenance-reminder', settings.reminder);
        this.setInputValue('urgent-threshold', settings.urgentThreshold);
        this.setTextareaValue('maintenance-providers', settings.providers);
    }

    updateFinancialSettings() {
        const settings = this.settings.financial;
        this.setSelectValue('currency', settings.currency);
        this.setInputValue('grace-period', settings.gracePeriod);
        this.setInputValue('late-interest', settings.lateInterest);
        
        const checkboxes = document.querySelectorAll('input[name="payment-methods"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = settings.paymentMethods.includes(checkbox.value);
        });
    }

    saveSettings() {
        this.collectSettings();
        
        this.showNotification('Guardando configuración...', 'info');
        
        setTimeout(() => {
            localStorage.setItem('quantumTowerSettings', JSON.stringify(this.settings));
            this.showNotification('Configuración guardada exitosamente', 'success');
        }, 2000);
    }

    collectSettings() {
        this.settings.building = {
            name: document.getElementById('building-name').value,
            address: document.getElementById('building-address').value,
            phone: document.getElementById('building-phone').value,
            email: document.getElementById('building-email').value,
            hours: document.getElementById('building-hours').value
        };

        this.settings.notifications = {
            securityAlerts: document.getElementById('security-alerts').checked,
            paymentReminders: document.getElementById('payment-reminders').checked,
            maintenanceNotifications: document.getElementById('maintenance-notifications').checked,
            generalCommunications: document.getElementById('general-communications').checked,
            emergencyAlerts: document.getElementById('emergency-alerts').checked
        };

        this.settings.security = {
            passwordRequirement: document.getElementById('password-requirement').value,
            passwordExpiry: parseInt(document.getElementById('password-expiry').value),
            twoFactorAuth: document.getElementById('two-factor-auth').value,
            loginAttempts: parseInt(document.getElementById('login-attempts').value)
        };

        this.settings.reports = {
            frequency: document.getElementById('report-frequency').value,
            recipients: document.getElementById('report-recipients').value,
            format: document.getElementById('report-format').value
        };

        this.settings.maintenance = {
            reminder: parseInt(document.getElementById('maintenance-reminder').value),
            urgentThreshold: parseInt(document.getElementById('urgent-threshold').value),
            providers: document.getElementById('maintenance-providers').value
        };

        const paymentMethods = [];
        document.querySelectorAll('input[name="payment-methods"]:checked').forEach(checkbox => {
            paymentMethods.push(checkbox.value);
        });

        this.settings.financial = {
            currency: document.getElementById('currency').value,
            gracePeriod: parseInt(document.getElementById('grace-period').value),
            lateInterest: parseFloat(document.getElementById('late-interest').value),
            paymentMethods: paymentMethods
        };
    }

    resetSettings() {
        this.showNotification('Restableciendo configuración...', 'warning');
        
        setTimeout(() => {
            this.loadSampleSettings();
            this.showNotification('Configuración restablecida a valores predeterminados', 'success');
        }, 1500);
    }

    // ==================== MÉTODOS AUXILIARES ====================
    loadSampleData() {
        this.loadSampleMaintenanceData();
        this.loadSampleFinancialData();
        this.loadSampleAccessData();
        this.loadSampleCommunicationsData();
        this.loadSampleResidentsData();
        this.loadSampleSettings();
    }

    refreshDashboard() {
        this.showNotification('Actualizando dashboard...', 'info');
        setTimeout(() => {
            this.loadDashboardData();
            this.showNotification('Dashboard actualizado', 'success');
        }, 1000);
    }

    generateExecutiveReport() {
        const reportData = {
            fecha: new Date().toLocaleDateString(),
            ingresos: 125430,
            gastos: 85200,
            morosidad: 12850,
            ocupacion: '85%',
            ticketsActivos: this.maintenanceTickets.filter(t => t.status !== 'completed').length,
            incidentes: 5
        };

        const reportContent = `
REPORTE EJECUTIVO - QUANTUM TOWER
Fecha: ${reportData.fecha}

RESUMEN FINANCIERO:
• Ingresos Totales: $${reportData.ingresos.toLocaleString()}
• Gastos Mensuales: $${reportData.gastos.toLocaleString()}
• Morosidad: $${reportData.morosidad.toLocaleString()}
• Tasa de Ocupación: ${reportData.ocupacion}

OPERACIONES:
• Tickets de Mantenimiento Activos: ${reportData.ticketsActivos}
• Incidentes Reportados: ${reportData.incidentes}

        `;

        this.downloadTextFile(reportContent, 'reporte_ejecutivo.txt');
        this.showNotification('Reporte ejecutivo generado', 'success');
    }

    async handleGlobalSearch(query) {
        if (query.length > 2) {
            console.log('🔍 Búsqueda global:', query);
            this.showNotification(`Buscando: "${query}"`, 'info', 2000);
            
            const results = [];
            
            this.residents.forEach(resident => {
                if (resident.name.toLowerCase().includes(query.toLowerCase()) ||
                    resident.department.toLowerCase().includes(query.toLowerCase()) ||
                    resident.email.toLowerCase().includes(query.toLowerCase())) {
                    results.push(`Residente: ${resident.name} - ${resident.department}`);
                }
            });
            
            this.maintenanceTickets.forEach(ticket => {
                if (ticket.title.toLowerCase().includes(query.toLowerCase()) ||
                    ticket.description.toLowerCase().includes(query.toLowerCase())) {
                    results.push(`Ticket: ${ticket.id} - ${ticket.title}`);
                }
            });
            
            if (results.length > 0) {
                await this.modalSystem.alert('Resultados de Búsqueda', results.join('\n'), 'info');
            } else {
                this.showNotification('No se encontraron resultados', 'info');
            }
        }
    }

    handlePeriodChange(period) {
        console.log('📅 Período cambiado:', period);
        this.showNotification(`Período actualizado: ${period}`, 'info', 2000);
    }

    async showUserMenu() {
        const actions = [
            'Ver Perfil',
            'Cambiar Contraseña',
            'Configuración Personal',
            'Cerrar Sesión'
        ];
        
        const selected = await this.modalSystem.select(
            'Menú de Usuario',
            'Seleccione una opción:',
            actions.map((action, index) => ({ value: index + 1, text: action }))
        );
        
        if (selected === '4') {
            logout();
        } else if (selected) {
            this.showNotification(`Acción: ${actions[selected - 1]}`, 'info');
        }
    }

    showNotificationsPanel() {
        const notifications = [
            'Nuevo pago recibido de Juan Pérez',
            'Ticket MT-101 requiere atención urgente',
            '5 residentes con pagos pendientes',
            'Reunión de condominio programada para viernes'
        ];
        
        this.modalSystem.alert('Notificaciones', notifications.join('\n\n'), 'info');
    }

    updateElementText(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    setInputValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    setSelectValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    setTextareaValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    setCheckboxValue(elementId, checked) {
        const element = document.getElementById(elementId);
        if (element) {
            element.checked = checked;
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    downloadCSV(csvContent, fileName) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    downloadTextFile(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info', duration = 5000) {
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: ${this.isMobile ? '90vw' : '400px'};
            `;
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: inherit;
            word-break: break-word;
            max-width: 100%;
        `;

        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span style="flex: 1;">${message}</span>
            <button style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px; flex-shrink: 0; padding: 5px; border-radius: 3px; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">&times;</button>
        `;

        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(notification);

        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        setTimeout(() => {
            if (notification.parentElement) {
                this.removeNotification(notification);
            }
        }, duration);
    }

    removeNotification(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }

    async loadDashboardData() {
        console.log('🔄 Cargando datos del dashboard...');
        
        try {
            setTimeout(() => {
                this.useDemoData();
                this.showNotification('Dashboard cargado correctamente', 'success');
            }, 1000);

        } catch (error) {
            console.warn('❌ Error al cargar datos:', error);
            this.useDemoData();
        }
    }

    useDemoData() {
        const demoData = {
            kpis: {
                ingresos: 125430,
                morosidad: 12850,
                gastos: 85200,
                ocupacion: 85
            }
        };

        this.updateDashboard(demoData);
    }

    updateDashboard(data) {
        if (data.kpis) {
            this.updateElementText('total-income', `$${data.kpis.ingresos.toLocaleString()}`);
            this.updateElementText('total-debt', `$${data.kpis.morosidad.toLocaleString()}`);
            this.updateElementText('total-expenses', `$${data.kpis.gastos.toLocaleString()}`);
            this.updateElementText('occupancy-rate', `${data.kpis.ocupacion}%`);
        }
    }

    loadExecutivePanelData() {
        this.useDemoData();
        this.showNotification('Datos del panel ejecutivo cargados', 'success');
    }

    loadFinancialData() {
        this.loadSampleFinancialData();
        this.showNotification('Datos financieros cargados', 'success');
    }

    loadAccessData() {
        this.loadSampleAccessData();
        this.showNotification('Datos de acceso cargados', 'success');
    }

    loadMaintenanceData() {
        this.loadSampleMaintenanceData();
        this.showNotification('Datos de mantenimiento cargados', 'success');
    }

    loadCommunicationsData() {
        this.loadSampleCommunicationsData();
        this.showNotification('Datos de comunicaciones cargados', 'success');
    }

    loadConfigurationData() {
        this.loadSampleSettings();
        this.showNotification('Configuración cargada', 'success');
    }

    loadResidentsData() {
        this.loadSampleResidentsData();
        this.showNotification('Datos de residentes cargados', 'success');
    }

    cleanup() {
        this.destroyCharts();
        clearTimeout(this.resizeTimeout);
        this.removeOverlay();
        console.log('🧹 Recursos limpiados');
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando Quantum Tower Dashboard...');
    window.customModalSystem = new CustomModalSystem();
    window.adminDashboard = new AdminDashboard();
});

// Manejar carga completa de la página
window.addEventListener('load', () => {
    console.log('📄 Página completamente cargada');
    if (window.adminDashboard) {
        setTimeout(() => {
            window.adminDashboard.handleResize();
        }, 100);
    }
});

// Manejar cambios de visibilidad
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.adminDashboard) {
        console.log('👀 Página visible, reajustando...');
        setTimeout(() => {
            window.adminDashboard.handleResize();
        }, 300);
    }
});

// Limpiar recursos cuando se cierra la página
window.addEventListener('beforeunload', () => {
    if (window.adminDashboard) {
        window.adminDashboard.cleanup();
    }
});

// Función global para logout
function logout() {
    console.log('🔒 Cerrando sesión...');
    
    if (window.adminDashboard) {
        window.adminDashboard.showNotification('Cerrando sesión...', 'info');
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    const dashboard = window.adminDashboard;
    if (dashboard) {
        setTimeout(() => {
            dashboard.redirectToLogin();
        }, 1000);
    } else {
        window.location.href = '/login/';
    }
}