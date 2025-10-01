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
        
        if (!this.checkAuth()) {
            return;
        }
        
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
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: block;
        `;
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
                sidebar.style.transform = 'translateX(-100%)';
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
                sidebar.style.transform = '';
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
        
        console.log('🔐 Verificando autenticación...');
        
        if (!token || !userRole) {
            console.log('❌ No autenticado, redirigiendo a login...');
            this.redirectToLogin();
            return false;
        }

        if (userRole !== 'administrador') {
            console.log(`❌ Acceso denegado. Rol requerido: administrador, Rol actual: ${userRole}`);
            this.redirectToLogin();
            return false;
        }

        console.log('✅ Autenticación válida - Usuario administrador');
        return true;
    }

    redirectToLogin() {
        console.log('🔒 Redirigiendo a login...');
        
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
        this.initializeResidentsChart(isMobile);
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

    initializeResidentsChart(isMobile = false) {
        const residentsCtx = document.getElementById('residentsChart');
        if (residentsCtx) {
            try {
                this.charts.residents = new Chart(residentsCtx, {
                    type: 'pie',
                    data: {
                        labels: ['Activos', 'En Mora', 'Pendientes', 'Inactivos'],
                        datasets: [{
                            data: [75, 5, 8, 2],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(148, 163, 184, 0.8)'
                            ],
                            borderColor: [
                                '#10b981',
                                '#ef4444',
                                '#f59e0b',
                                '#94a3b8'
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
                console.log('✅ Gráfico de residentes inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de residentes:', error);
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

        console.log('✅ Event listeners globales configurados');
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

    // ==================== MÓDULO FINANCIERO ====================
    initializeFinancialModule() {
        this.setupFinancialEventListeners();
    }

    setupFinancialEventListeners() {
        const elements = {
            'refresh-dashboard': () => this.loadDashboardData(),
            'generate-executive-report': () => this.generateExecutiveReport(),
            'new-invoice': () => this.openInvoiceModal(),
            'financial-reports': () => this.viewFinancialReports(),
            'register-payment': () => this.openPaymentModal(),
            'validate-online-payment': () => this.validateOnlinePayment(),
            'generate-receipt': () => this.generateReceipt(),
            'send-reminder': () => this.sendPaymentReminder(),
            'create-payment-plan': () => this.createPaymentPlan(),
            'block-access': () => this.blockAccessForDebt()
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
                this.filterPayments(e.target.value);
            });
        }

        const searchDebtors = document.getElementById('search-debtors');
        if (searchDebtors) {
            searchDebtors.addEventListener('input', (e) => {
                this.filterDebtors(e.target.value);
            });
        }

        const permissionForm = document.getElementById('new-permission-form');
        if (permissionForm) {
            permissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createNewPermission();
            });
        }

        const cancelPermission = document.getElementById('cancel-permission');
        if (cancelPermission) {
            cancelPermission.addEventListener('click', () => {
                this.closePermissionForm();
            });
        }
    }

    async loadFinancialData() {
        try {
            console.log('💰 Cargando datos financieros...');
            
            const financialData = {
                income: 125430,
                expenses: 85200,
                balance: 40230,
                debt: 12850,
                debtors: 5,
                paymentsOnTime: 45,
                pendingPayments: 8,
                overduePayments: 3,
                debtors: [
                    { name: 'Carlos López', department: 'Torre A - 201', amount: 5200, days: 45 },
                    { name: 'Ana Martínez', department: 'Torre B - 305', amount: 3800, days: 30 },
                    { name: 'Roberto Sánchez', department: 'Torre A - 102', amount: 2850, days: 60 }
                ],
                recentPayments: [
                    { id: 'P-001', resident: 'Juan Pérez', amount: 1200, date: '2024-03-15', method: 'Transferencia', status: 'completed' },
                    { id: 'P-002', resident: 'María García', amount: 1200, date: '2024-03-14', method: 'Efectivo', status: 'completed' },
                    { id: 'P-003', resident: 'Pedro López', amount: 1200, date: '2024-03-14', method: 'Tarjeta', status: 'pending' }
                ]
            };
            
            this.data.financial = financialData;
            this.updateFinancialDashboard();
            this.showNotification('Datos financieros cargados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos financieros:', error);
            this.showNotification('Error al cargar datos financieros', 'error');
        }
    }

    updateFinancialDashboard() {
        const data = this.data.financial;
        
        this.updateElementText('total-income', `$${data.income.toLocaleString()}`);
        this.updateElementText('total-debt', `$${data.debt.toLocaleString()}`);
        this.updateElementText('total-expenses', `$${data.expenses.toLocaleString()}`);
        this.updateElementText('payments-on-time', data.paymentsOnTime);
        this.updateElementText('pending-payments', data.pendingPayments);
        this.updateElementText('overdue-payments', data.overduePayments);
        this.updateElementText('debtors-count', data.debtors.length);
        
        this.updateDebtorsTable(data.debtors);
        this.updatePaymentsTable(data.recentPayments);
    }

    updateDebtorsTable(debtors) {
        const tbody = document.querySelector('#debtors-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = debtors.map(debtor => `
            <tr>
                <td>${debtor.name}</td>
                <td>${debtor.department}</td>
                <td>$${debtor.amount.toLocaleString()}</td>
                <td>
                    <span class="badge ${debtor.days > 60 ? 'urgent' : debtor.days > 30 ? 'high' : 'medium'}">
                        ${debtor.days} días
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="adminDashboard.sendPaymentReminderTo('${debtor.name}')" title="Enviar recordatorio">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="btn-icon" onclick="adminDashboard.createPaymentPlanFor('${debtor.name}')" title="Plan de pago">
                        <i class="fas fa-calendar"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updatePaymentsTable(payments) {
        const tbody = document.querySelector('#payments-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.resident}</td>
                <td>$${payment.amount.toLocaleString()}</td>
                <td>${new Date(payment.date).toLocaleDateString()}</td>
                <td>${payment.method}</td>
                <td>
                    <span class="status ${payment.status === 'completed' ? 'completed' : 'pending'}">
                        ${payment.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="adminDashboard.viewPaymentDetails('${payment.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ==================== MÓDULO DE ACCESOS ====================
    initializeAccessModule() {
        this.setupAccessEventListeners();
        this.startRealTimeMonitor();
    }

    setupAccessEventListeners() {
        const elements = {
            'new-access': () => this.openNewAccessModal(),
            'access-history': () => this.viewAccessHistory()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    async loadAccessData() {
        try {
            console.log('🔑 Cargando datos de acceso...');
            
            const accessData = {
                todayAccess: 127,
                activeResidents: 89,
                registeredVisitors: 15,
                securityIncidents: 2,
                recentAccess: [
                    { user: 'Juan Pérez', type: 'resident', time: '08:30 AM', door: 'Principal', status: 'success' },
                    { user: 'María García', type: 'visitor', time: '09:15 AM', door: 'Estacionamiento', status: 'success' },
                    { user: 'Carlos López', type: 'technician', time: '10:00 AM', door: 'Servicio', status: 'success' }
                ],
                permissions: [
                    { user: 'Juan Pérez', type: 'resident', areas: ['Principal', 'Estacionamiento', 'Gimnasio'], schedule: '24/7', validUntil: '2024-12-31' },
                    { user: 'María García', type: 'visitor', areas: ['Principal'], schedule: 'Business Hours', validUntil: '2024-03-20' }
                ]
            };
            
            this.data.access = accessData;
            this.updateAccessDashboard();
            this.showNotification('Datos de acceso cargados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos de acceso:', error);
            this.showNotification('Error al cargar datos de acceso', 'error');
        }
    }

    updateAccessDashboard() {
        const data = this.data.access;
        
        this.updateElementText('today-access-count', data.todayAccess);
        this.updateElementText('active-residents', data.activeResidents);
        this.updateElementText('registered-visitors', data.registeredVisitors);
        this.updateElementText('security-incidents', data.securityIncidents);
        
        this.updateRecentAccessTable(data.recentAccess);
        this.updatePermissionsTable(data.permissions);
        this.updateRealTimeMonitor(data.recentAccess);
    }

    updateRecentAccessTable(accesses) {
        const tbody = document.querySelector('#recent-access-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = accesses.map(access => `
            <tr>
                <td>${access.user}</td>
                <td>
                    <span class="badge ${access.type}">
                        ${access.type === 'resident' ? 'Residente' : 
                          access.type === 'visitor' ? 'Visitante' : 'Técnico'}
                    </span>
                </td>
                <td>${access.time}</td>
                <td>${access.door}</td>
                <td>
                    <span class="status ${access.status}">
                        ${access.status === 'success' ? 'Exitoso' : 'Fallido'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updatePermissionsTable(permissions) {
        const tbody = document.querySelector('#access-permissions-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = permissions.map(permission => `
            <tr>
                <td>${permission.user}</td>
                <td>
                    <span class="badge ${permission.type}">
                        ${permission.type === 'resident' ? 'Residente' : 'Visitante'}
                    </span>
                </td>
                <td>${permission.areas.join(', ')}</td>
                <td>${permission.schedule}</td>
                <td>${new Date(permission.validUntil).toLocaleDateString()}</td>
                <td>
                    <button class="btn-icon" onclick="adminDashboard.editPermission('${permission.user}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateRealTimeMonitor(accesses) {
        const container = document.getElementById('real-time-access');
        if (!container) return;
        
        const recentAccesses = accesses.slice(0, 3);
        
        container.innerHTML = recentAccesses.map(access => `
            <div class="access-event ${access.status}">
                <div class="event-icon">
                    <i class="fas fa-${access.status === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                </div>
                <div class="event-content">
                    <h4>${access.user} - ${access.door}</h4>
                    <p>${access.time} • ${access.type}</p>
                </div>
            </div>
        `).join('');
    }

    startRealTimeMonitor() {
        setInterval(() => {
            this.simulateRealTimeAccess();
        }, 15000);
    }

    simulateRealTimeAccess() {
        const accessTypes = [
            { user: 'Residente Torre A', type: 'resident', door: 'Principal', status: 'success' },
            { user: 'Proveedor Agua', type: 'technician', door: 'Servicio', status: 'success' },
            { user: 'Visitante Torre B', type: 'visitor', door: 'Estacionamiento', status: 'success' }
        ];
        
        const randomAccess = accessTypes[Math.floor(Math.random() * accessTypes.length)];
        const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        if (this.data.access.recentAccess) {
            this.data.access.recentAccess.unshift({
                ...randomAccess,
                time: currentTime
            });
            
            this.data.access.recentAccess = this.data.access.recentAccess.slice(0, 5);
            this.updateRealTimeMonitor(this.data.access.recentAccess);
            
            this.data.access.todayAccess++;
            this.updateElementText('today-access-count', this.data.access.todayAccess);
        }
    }

    // ==================== MÓDULO DE MANTENIMIENTO ====================
    initializeMaintenanceModule() {
        this.setupMaintenanceEventListeners();
    }

    setupMaintenanceEventListeners() {
        const elements = {
            'new-maintenance-ticket': () => this.openNewMaintenanceTicket(),
            'filter-maintenance': () => this.filterMaintenanceTickets(),
            'refresh-maintenance': () => this.refreshMaintenanceData()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    async loadMaintenanceData() {
        try {
            console.log('🔧 Cargando datos de mantenimiento...');
            
            const maintenanceData = {
                activeOrders: 12,
                inProgress: 5,
                completed: 28,
                urgent: 3,
                tickets: [
                    { id: 'MT-101', description: 'Fuga de agua en baño piso 3', area: 'Plomería', priority: 'urgent', status: 'pending', date: '2024-03-15' },
                    { id: 'MT-102', description: 'Ascensor torre B con ruidos', area: 'Elevadores', priority: 'high', status: 'in-progress', date: '2024-03-14' },
                    { id: 'MT-103', description: 'Pintura área común piso 1', area: 'Pintura', priority: 'medium', status: 'pending', date: '2024-03-13' }
                ]
            };
            
            this.data.maintenance = maintenanceData;
            this.updateMaintenanceDashboard();
            this.showNotification('Datos de mantenimiento cargados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos de mantenimiento:', error);
            this.showNotification('Error al cargar datos de mantenimiento', 'error');
        }
    }

    updateMaintenanceDashboard() {
        const data = this.data.maintenance;
        
        this.updateElementText('maintenance-pending', data.activeOrders);
        this.updateElementText('maintenance-in-progress', data.inProgress);
        this.updateElementText('maintenance-completed', data.completed);
        this.updateElementText('maintenance-urgent', data.urgent);
        
        this.updateMaintenanceTicketsTable(data.tickets);
    }

    updateMaintenanceTicketsTable(tickets) {
        const tbody = document.querySelector('#maintenance-tickets-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = tickets.map(ticket => `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.description}</td>
                <td>${ticket.area}</td>
                <td><span class="badge ${ticket.priority}">${this.capitalizeFirst(ticket.priority)}</span></td>
                <td><span class="status ${ticket.status}">${this.capitalizeFirst(ticket.status.replace('-', ' '))}</span></td>
                <td>${new Date(ticket.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn-icon" onclick="adminDashboard.viewTicketDetails('${ticket.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ==================== MÓDULO DE COMUNICACIONES ====================
    initializeCommunicationsModule() {
        this.setupCommunicationsEventListeners();
    }

    setupCommunicationsEventListeners() {
        const elements = {
            'new-announcement': () => this.openNewAnnouncement(),
            'send-email': () => this.openEmailComposer(),
            'send-communication': () => this.sendCommunication()
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

    async loadCommunicationsData() {
        try {
            console.log('📢 Cargando datos de comunicaciones...');
            
            const communicationsData = {
                announcements: [
                    { title: 'Mantenimiento Ascensores', type: 'maintenance', audience: 'Todos', date: '2024-03-15 10:30', status: 'sent' },
                    { title: 'Corte Programado de Agua', type: 'service', audience: 'Torre A', date: '2024-03-14 16:45', status: 'sent' }
                ]
            };
            
            this.data.communications = communicationsData;
            this.updateCommunicationsDashboard();
            this.showNotification('Datos de comunicaciones cargados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos de comunicaciones:', error);
            this.showNotification('Error al cargar datos de comunicaciones', 'error');
        }
    }

    updateCommunicationsDashboard() {
        const data = this.data.communications;
        this.updateCommunicationsHistory(data.announcements);
    }

    updateCommunicationsHistory(announcements) {
        const container = document.getElementById('communications-history');
        if (!container) return;
        
        container.innerHTML = announcements.map(announcement => `
            <div class="history-item">
                <div class="history-icon ${announcement.type}">
                    <i class="fas fa-${announcement.type === 'maintenance' ? 'tools' : 'exclamation-triangle'}"></i>
                </div>
                <div class="history-content">
                    <h4>${announcement.title}</h4>
                    <p>Enviado a: ${announcement.audience} • ${new Date(announcement.date).toLocaleString()}</p>
                </div>
            </div>
        `).join('');
    }

    // ==================== MÓDULO DE RESIDENTES ====================
    initializeResidentsModule() {
        this.setupResidentsEventListeners();
    }

    setupResidentsEventListeners() {
        const elements = {
            'new-resident': () => this.openNewResidentForm(),
            'export-residents': () => this.exportResidentsList()
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
                this.searchResidents(e.target.value);
            });
        }
    }

    async loadResidentsData() {
        try {
            console.log('👥 Cargando datos de residentes...');
            
            const residentsData = {
                totalResidents: 89,
                occupiedUnits: 45,
                vacantUnits: 12,
                inDebt: 3,
                residents: [
                    { name: 'Juan Pérez', department: 'Torre A - 501', phone: '+56 9 1234 5678', email: 'juan.perez@email.com', status: 'active' },
                    { name: 'María González', department: 'Torre B - 302', phone: '+56 9 8765 4321', email: 'maria.gonzalez@email.com', status: 'active' },
                    { name: 'Carlos López', department: 'Torre A - 201', phone: '+56 9 5555 6666', email: 'carlos.lopez@email.com', status: 'warning' }
                ]
            };
            
            this.data.residents = residentsData;
            this.updateResidentsDashboard();
            this.showNotification('Datos de residentes cargados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos de residentes:', error);
            this.showNotification('Error al cargar datos de residentes', 'error');
        }
    }

    updateResidentsDashboard() {
        const data = this.data.residents;
        
        this.updateElementText('total-residents', data.totalResidents);
        this.updateElementText('occupied-units', data.occupiedUnits);
        this.updateElementText('vacant-units', data.vacantUnits);
        this.updateElementText('residents-in-debt', data.inDebt);
        
        this.updateResidentsTable(data.residents);
    }

    updateResidentsTable(residents) {
        const tbody = document.querySelector('#residents-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = residents.map(resident => `
            <tr>
                <td>${resident.name}</td>
                <td>${resident.department}</td>
                <td>${resident.phone}</td>
                <td>${resident.email}</td>
                <td><span class="status ${resident.status}">${this.capitalizeFirst(resident.status)}</span></td>
                <td>
                    <button class="btn-icon" onclick="adminDashboard.editResident('${resident.name}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ==================== MÓDULO DE CONFIGURACIÓN ====================
    initializeConfigurationModule() {
        this.setupConfigurationEventListeners();
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
    }

    async loadConfigurationData() {
        try {
            console.log('⚙️ Cargando datos de configuración...');
            
            const configurationData = {
                buildingInfo: {
                    name: 'Quantum Tower',
                    address: 'Av. Principal #123',
                    phone: '+56 2 2345 6789',
                    email: 'admin@quantumtower.cl'
                },
                notifications: {
                    securityAlerts: true,
                    paymentReminders: true,
                    maintenanceNotifications: true,
                    generalCommunications: false
                },
                security: {
                    sessionTimeout: 30,
                    loginAttempts: 3,
                    twoFactorAuth: true
                }
            };
            
            this.data.configuration = configurationData;
            this.updateConfigurationDashboard();
            this.showNotification('Datos de configuración cargados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error cargando datos de configuración:', error);
            this.showNotification('Error al cargar datos de configuración', 'error');
        }
    }

    updateConfigurationDashboard() {
        const data = this.data.configuration;
        
        this.updateBuildingSettings(data.buildingInfo);
        this.updateNotificationSettings(data.notifications);
        this.updateSecuritySettings(data.security);
    }

    updateBuildingSettings(buildingInfo) {
        this.setInputValue('building-name', buildingInfo.name);
        this.setInputValue('building-address', buildingInfo.address);
        this.setInputValue('building-phone', buildingInfo.phone);
        this.setInputValue('building-email', buildingInfo.email);
    }

    updateNotificationSettings(notifications) {
        this.setCheckboxValue('security-alerts', notifications.securityAlerts);
        this.setCheckboxValue('payment-reminders', notifications.paymentReminders);
        this.setCheckboxValue('maintenance-notifications', notifications.maintenanceNotifications);
        this.setCheckboxValue('general-communications', notifications.generalCommunications);
    }

    updateSecuritySettings(security) {
        this.setInputValue('session-timeout', security.sessionTimeout);
        this.setInputValue('login-attempts', security.loginAttempts);
        this.setCheckboxValue('two-factor-auth', security.twoFactorAuth);
    }

    // ==================== MÉTODOS AUXILIARES ====================
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

    setCheckboxValue(elementId, checked) {
        const element = document.getElementById(elementId);
        if (element) {
            element.checked = checked;
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
            },
            alertas: [
                {
                    tipo: 'seguridad',
                    prioridad: 'critical',
                    mensaje: 'Sensor de puerta principal fallando',
                    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
                },
                {
                    tipo: 'mantenimiento',
                    prioridad: 'high',
                    mensaje: 'Ascensor torre A requiere mantenimiento',
                    timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
                }
            ],
            accesos_recientes: [
                { usuario: 'Juan Pérez', tipo: 'resident', hora: '08:30 AM', puerta: 'Principal' },
                { usuario: 'María García', tipo: 'visitor', hora: '09:15 AM', puerta: 'Estacionamiento' }
            ],
            tickets_activos: [
                { id: '#101', descripcion: 'Fuga de agua en piso 5', prioridad: 'urgent', estado: 'pending' },
                { id: '#102', descripcion: 'Cámara de seguridad offline', prioridad: 'high', estado: 'in-progress' }
            ]
        };

        this.updateDashboard(demoData);
    }

    updateDashboard(data) {
        if (data.alertas) {
            this.updateAlerts(data.alertas);
        }

        if (data.accesos_recientes) {
            this.updateRecentAccess(data.accesos_recientes);
        }

        if (data.tickets_activos) {
            this.updateActiveTickets(data.tickets_activos);
        }
    }

    updateAlerts(alertas) {
        const alertsContainer = document.getElementById('critical-alerts');
        if (alertsContainer && alertas.length > 0) {
            alertsContainer.innerHTML = alertas.map(alert => `
                <div class="alert-item ${alert.prioridad}">
                    <div class="alert-icon">
                        <i class="fas fa-${this.getAlertIcon(alert.tipo)}"></i>
                    </div>
                    <div class="alert-content">
                        <h4>${alert.mensaje}</h4>
                        <p>Área: ${this.capitalizeFirst(alert.tipo)} • ${this.formatTime(alert.timestamp)}</p>
                    </div>
                </div>
            `).join('');
            
            const alertCount = document.querySelector('.alert-count');
            if (alertCount) {
                alertCount.textContent = alertas.length;
            }
        }
    }

    updateActiveTickets(tickets) {
        const tableBody = document.querySelector('#active-tickets-table tbody');
        if (tableBody && tickets.length > 0) {
            tableBody.innerHTML = tickets.map(ticket => `
                <tr>
                    <td>${ticket.id}</td>
                    <td>${ticket.descripcion}</td>
                    <td><span class="badge ${ticket.prioridad}">${this.capitalizeFirst(ticket.prioridad)}</span></td>
                    <td><span class="status ${ticket.estado}">${this.capitalizeFirst(ticket.estado.replace('-', ' '))}</span></td>
                </tr>
            `).join('');
        }
    }

    getAlertIcon(tipo) {
        const icons = {
            'seguridad': 'shield-alt',
            'mantenimiento': 'tools',
            'financiero': 'money-bill-wave',
            'default': 'exclamation-circle'
        };
        return icons[tipo] || icons.default;
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Hace unos segundos';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        return `Hace ${Math.floor(diffMs / 86400000)} días`;
    }

    // ==================== MÉTODOS DE ACCIONES ====================
    handleGlobalSearch(query) {
        if (query.length > 2) {
            console.log('🔍 Búsqueda global:', query);
            this.showNotification(`Buscando: "${query}"`, 'info', 2000);
        }
    }

    handlePeriodChange(period) {
        console.log('📅 Período cambiado:', period);
        this.showNotification(`Período actualizado: ${period}`, 'info', 2000);
    }

    showUserMenu() {
        this.showNotification('Menú de usuario', 'info');
    }

    showNotificationsPanel() {
        this.showNotification('Panel de notificaciones', 'info');
    }

    // Métodos de acciones básicas (simuladas)
    generateExecutiveReport() {
        this.showNotification('Generando reporte ejecutivo...', 'info');
        setTimeout(() => {
            this.showNotification('Reporte ejecutivo generado', 'success');
        }, 2000);
    }

    openInvoiceModal() {
        this.showNotification('Abriendo módulo de facturación', 'info');
    }

    openPaymentModal() {
        this.showNotification('Abriendo registro de pagos', 'info');
    }

    validateOnlinePayment() {
        this.showNotification('Validando pagos en línea...', 'info');
        setTimeout(() => {
            this.showNotification('Pagos validados correctamente', 'success');
        }, 1500);
    }

    generateReceipt() {
        this.showNotification('Generando recibo...', 'info');
        setTimeout(() => {
            this.showNotification('Recibo generado', 'success');
        }, 1000);
    }

    sendPaymentReminder() {
        this.showNotification('Enviando recordatorios...', 'info');
        setTimeout(() => {
            this.showNotification('Recordatorios enviados', 'success');
        }, 2000);
    }

    sendPaymentReminderTo(debtorName) {
        this.showNotification(`Enviando recordatorio a ${debtorName}`, 'info');
    }

    createPaymentPlan() {
        this.showNotification('Creando plan de pagos...', 'info');
        setTimeout(() => {
            this.showNotification('Plan de pagos creado', 'success');
        }, 1500);
    }

    createPaymentPlanFor(debtorName) {
        this.showNotification(`Creando plan para ${debtorName}`, 'info');
    }

    blockAccessForDebt() {
        this.showNotification('Bloqueando accesos por deuda...', 'warning');
        setTimeout(() => {
            this.showNotification('Accesos bloqueados', 'success');
        }, 2000);
    }

    filterPayments(query) {
        this.showNotification(`Filtrando pagos: "${query}"`, 'info');
    }

    filterDebtors(query) {
        this.showNotification(`Filtrando deudores: "${query}"`, 'info');
    }

    createNewPermission() {
        this.showNotification('Creando nuevo permiso...', 'info');
        setTimeout(() => {
            this.showNotification('Permiso creado exitosamente', 'success');
            document.getElementById('new-permission-form').reset();
        }, 1500);
    }

    closePermissionForm() {
        document.getElementById('new-permission-form').reset();
        this.showNotification('Formulario cancelado', 'info');
    }

    editPermission(userName) {
        this.showNotification(`Editando permiso de ${userName}`, 'info');
    }

    openNewAccessModal() {
        this.showNotification('Abriendo nuevo acceso', 'info');
    }

    viewAccessHistory() {
        this.showNotification('Cargando historial de accesos', 'info');
    }

    openNewMaintenanceTicket() {
        this.showNotification('Abriendo nuevo ticket', 'info');
    }

    filterMaintenanceTickets() {
        this.showNotification('Filtrando tickets', 'info');
    }

    refreshMaintenanceData() {
        this.loadMaintenanceData();
    }

    viewTicketDetails(ticketId) {
        this.showNotification(`Viendo ticket ${ticketId}`, 'info');
    }

    openNewAnnouncement() {
        this.showNotification('Abriendo nuevo anuncio', 'info');
    }

    openEmailComposer() {
        this.showNotification('Abriendo compositor de email', 'info');
    }

    sendCommunication() {
        this.showNotification('Enviando comunicación...', 'info');
        setTimeout(() => {
            this.showNotification('Comunicación enviada', 'success');
            document.getElementById('communication-form').reset();
        }, 1500);
    }

    openNewResidentForm() {
        this.showNotification('Abriendo formulario de residente', 'info');
    }

    exportResidentsList() {
        this.showNotification('Exportando lista de residentes...', 'info');
        setTimeout(() => {
            this.showNotification('Lista exportada', 'success');
        }, 1500);
    }

    searchResidents(query) {
        if (query.length > 2) {
            this.showNotification(`Buscando residentes: "${query}"`, 'info');
        }
    }

    editResident(residentName) {
        this.showNotification(`Editando ${residentName}`, 'info');
    }

    saveSettings() {
        this.showNotification('Guardando configuración...', 'info');
        setTimeout(() => {
            this.showNotification('Configuración guardada', 'success');
        }, 1500);
    }

    resetSettings() {
        this.showNotification('Restableciendo configuración...', 'warning');
        setTimeout(() => {
            this.showNotification('Configuración restablecida', 'success');
            this.loadConfigurationData();
        }, 1500);
    }

    viewPaymentDetails(paymentId) {
        this.showNotification(`Viendo pago ${paymentId}`, 'info');
    }

    viewFinancialReports() {
        this.showNotification('Abriendo reportes financieros', 'info');
    }

    loadExecutivePanelData() {
        this.useDemoData();
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

// Función global para verificar estado
function debugAuth() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    console.log('🔍 DEBUG AUTH:');
    console.log('Token:', token);
    console.log('Role:', role);
    console.log('Email:', email);
    
    if (window.adminDashboard) {
        window.adminDashboard.showNotification('Información de debug en consola', 'info');
    }
}

// Función global para forzar modo responsive
function forceResponsive() {
    if (window.adminDashboard) {
        console.log('🔄 Forzando actualización responsive...');
        window.adminDashboard.handleResize();
        window.adminDashboard.showNotification('Modo responsive actualizado', 'info');
    }
}