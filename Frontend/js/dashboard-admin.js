class AdminDashboard {
    constructor() {
        this.currentSection = 'panel-ejecutivo';
        this.basePath = this.getBasePath();
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        this.sidebarVisible = !this.isMobile;
        this.charts = {};
        this.resizeTimeout = null;
        this.init();
    }

    getBasePath() {
        if (window.location.protocol.startsWith('http')) {
            return window.location.origin;
        }
        return '';
    }

    init() {
        console.log('🔍 DEBUG - Dashboard inicializando');
        console.log('Base path:', this.basePath);
        console.log('Token exists:', !!localStorage.getItem('authToken'));
        console.log('User role:', localStorage.getItem('userRole'));
        console.log('Mobile device:', this.isMobile);
        console.log('Tablet device:', this.isTablet);
        console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
        
        // Verificar autenticación inmediatamente
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
    }

    createMobileToggle() {
        // Crear botón de toggle para mobile si no existe
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
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar) {
            if (this.sidebarVisible) {
                sidebar.classList.add('active');
                // Agregar overlay para cerrar al hacer click fuera
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
        // Detectar cambios de tamaño de pantalla con debounce
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Observer para cambios en la orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 300);
        });
    }

    handleResize() {
        // Usar debounce para mejor rendimiento
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
            console.log(`Nuevo tamaño: ${window.innerWidth} x ${window.innerHeight}`);
            
            this.updateLayout();
            this.applyResponsiveStyles();
            this.initializeCharts(this.isMobile);
            
            // Mostrar notificación de cambio de modo
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
            // Ocultar sidebar en mobile por defecto
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
            // Mostrar sidebar en desktop/tablet
            this.sidebarVisible = true;
            if (sidebar) {
                sidebar.classList.add('active');
                sidebar.style.transform = '';
            }
            if (mainContent) {
                mainContent.style.marginLeft = '';
            }
            this.removeOverlay();
            
            // Remover toggle si existe
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) menuToggle.remove();
        }
    }

    applyResponsiveStyles() {
        const body = document.body;
        
        // Aplicar clases de modo al body
        body.classList.toggle('mobile-mode', this.isMobile);
        body.classList.toggle('tablet-mode', this.isTablet);
        body.classList.toggle('desktop-mode', !this.isMobile && !this.isTablet);
        
        // Ajustar elementos específicos
        this.adjustKPICards();
        this.adjustContentGrids();
        this.adjustQuickTables();
        this.adjustStatsContainers();
        this.adjustSectionHeaders();
        this.adjustCharts();
    }

    adjustKPICards() {
        const kpiCards = document.querySelectorAll('.kpi-card');
        kpiCards.forEach(card => {
            if (this.isMobile) {
                card.style.flexDirection = 'column';
                card.style.textAlign = 'center';
                card.style.padding = '15px';
            } else if (this.isTablet) {
                card.style.flexDirection = 'row';
                card.style.textAlign = 'left';
                card.style.padding = '20px';
            } else {
                card.style.flexDirection = '';
                card.style.textAlign = '';
                card.style.padding = '';
            }
        });
    }

    adjustContentGrids() {
        const contentGrids = document.querySelectorAll('.content-grid');
        contentGrids.forEach(grid => {
            if (this.isMobile) {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '15px';
            } else if (this.isTablet) {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '20px';
            } else {
                grid.style.gridTemplateColumns = '';
                grid.style.gap = '';
            }
        });
    }

    adjustQuickTables() {
        const quickTables = document.querySelectorAll('.quick-tables');
        quickTables.forEach(table => {
            if (this.isMobile || this.isTablet) {
                table.style.gridTemplateColumns = '1fr';
                table.style.gap = '20px';
            } else {
                table.style.gridTemplateColumns = '';
                table.style.gap = '';
            }
        });
    }

    adjustStatsContainers() {
        const statsContainers = document.querySelectorAll('.stats-container, .access-stats');
        statsContainers.forEach(container => {
            if (this.isMobile) {
                container.style.gridTemplateColumns = '1fr';
                container.style.gap = '10px';
            } else if (this.isTablet) {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
                container.style.gap = '15px';
            } else {
                container.style.gridTemplateColumns = '';
                container.style.gap = '';
            }
        });
    }

    adjustSectionHeaders() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            if (this.isMobile) {
                header.style.flexDirection = 'column';
                header.style.alignItems = 'flex-start';
                header.style.gap = '15px';
            } else {
                header.style.flexDirection = '';
                header.style.alignItems = '';
                header.style.gap = '';
            }
        });
        
        const sectionActions = document.querySelectorAll('.section-actions');
        sectionActions.forEach(actions => {
            if (this.isMobile) {
                actions.style.width = '100%';
                actions.style.justifyContent = 'space-between';
                actions.querySelectorAll('.btn').forEach(btn => {
                    btn.style.flex = '1';
                    btn.style.justifyContent = 'center';
                });
            } else {
                actions.style.width = '';
                actions.style.justifyContent = '';
                actions.querySelectorAll('.btn').forEach(btn => {
                    btn.style.flex = '';
                    btn.style.justifyContent = '';
                });
            }
        });
    }

    adjustCharts() {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            if (this.isMobile) {
                container.style.minHeight = '300px';
            } else {
                container.style.minHeight = '';
            }
        });
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        console.log('🔐 Verificando autenticación...');
        console.log('Token:', token ? '✅ Existe' : '❌ No existe');
        console.log('Rol:', userRole || '❌ No definido');
        
        if (!token || !userRole) {
            console.log('❌ No autenticado, redirigiendo a login...');
            this.redirectToLogin();
            return false;
        }

        // Verificar que el rol sea administrador
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
        
        // Limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        
        // Redirigir a login
        setTimeout(() => {
            window.location.href = this.basePath + '/login/';
        }, 1000);
    }

    updateUserInfo() {
        const userEmail = localStorage.getItem('userEmail');
        const userNameElement = document.getElementById('userName');
        
        if (userNameElement && userEmail) {
            // Mostrar el nombre del usuario (parte antes del @)
            const userName = userEmail.split('@')[0];
            userNameElement.textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
        }
    }

    initializeCharts(isMobile = false) {
        // Destruir gráficos existentes
        this.destroyCharts();
        
        this.initializeIncomeExpenseChart(isMobile);
        this.initializeFinancialChart(isMobile);
    }

    initializeIncomeExpenseChart(isMobile = false) {
        const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
        if (incomeExpenseCtx) {
            try {
                // Configuración responsive para el gráfico
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                boxWidth: 12,
                                padding: 15
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
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
                                borderColor: '#27ae60',
                                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true
                            },
                            {
                                label: 'Gastos',
                                data: [80000, 82000, 85000, 83000, 85200, 87000],
                                borderColor: '#e74c3c',
                                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                borderWidth: 2,
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
                                'rgba(39, 174, 96, 0.8)',
                                'rgba(231, 76, 60, 0.8)',
                                'rgba(52, 152, 219, 0.8)'
                            ],
                            borderColor: [
                                '#27ae60',
                                '#e74c3c',
                                '#3498db'
                            ],
                            borderWidth: 1
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
                                    }
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

    destroyCharts() {
        // Destruir todos los gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Botones de acción
        document.querySelectorAll('.btn:not(.btn-logout)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleButtonAction(btn);
            });
        });

        // User menu
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => {
                this.showUserMenu();
            });
        }

        // Búsqueda
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            // Prevent form submission on enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            });
        }

        // Selects de período
        document.querySelectorAll('.period-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.handlePeriodChange(e.target.value);
            });
        });

        // Formularios
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });

        // Notificaciones
        const notifications = document.querySelector('.notifications');
        if (notifications) {
            notifications.addEventListener('click', () => {
                this.showNotificationsPanel();
            });
        }

        console.log('✅ Event listeners configurados');
    }

    switchSection(sectionId) {
        console.log('Cambiando a sección:', sectionId);
        
        // En mobile, cerrar sidebar al cambiar sección
        if (this.isMobile) {
            this.sidebarVisible = false;
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('active');
            this.removeOverlay();
        }
        
        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección objetivo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Scroll al inicio en mobile
            if (this.isMobile) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // Actualizar navegación activa
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
        
        switch(sectionId) {
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
    }

    async loadDashboardData() {
        console.log('🔄 Cargando datos del dashboard...');
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Simulamos una carga de datos
            console.log('📡 Simulando carga de datos...');
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
                },
                {
                    tipo: 'financiero',
                    prioridad: 'medium',
                    mensaje: '3 departamentos con morosidad >60 días',
                    timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
                }
            ],
            accesos_recientes: [
                { usuario: 'Juan Pérez', tipo: 'resident', hora: '08:30 AM', puerta: 'Principal' },
                { usuario: 'María García', tipo: 'visitor', hora: '09:15 AM', puerta: 'Estacionamiento' },
                { usuario: 'Carlos López', tipo: 'technician', hora: '10:00 AM', puerta: 'Servicio' }
            ],
            tickets_activos: [
                { id: '#101', descripcion: 'Fuga de agua en piso 5', prioridad: 'urgent', estado: 'pending' },
                { id: '#102', descripcion: 'Cámara de seguridad offline', prioridad: 'high', estado: 'in-progress' },
                { id: '#103', descripcion: 'Limpieza área común', prioridad: 'medium', estado: 'pending' }
            ]
        };

        this.updateDashboard(demoData);
    }

    updateDashboard(data) {
        console.log('📊 Actualizando dashboard con datos demo');

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
        const alertsContainer = document.querySelector('.alerts-list');
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

    updateRecentAccess(accesos) {
        const tableBody = document.querySelector('.table-scroll:first-child tbody');
        if (tableBody && accesos.length > 0) {
            tableBody.innerHTML = accesos.map(acceso => `
                <tr>
                    <td>${acceso.usuario}</td>
                    <td><span class="badge ${acceso.tipo}">${this.capitalizeFirst(acceso.tipo)}</span></td>
                    <td>${acceso.hora}</td>
                    <td>${acceso.puerta}</td>
                </tr>
            `).join('');
        }
    }

    updateActiveTickets(tickets) {
        const tableBody = document.querySelector('.table-scroll:last-child tbody');
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
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hace unos segundos';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        return `Hace ${diffDays} días`;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    handleButtonAction(button) {
        const action = button.textContent.trim();
        const icon = button.querySelector('i')?.className || '';
        console.log('🔄 Ejecutando acción:', action, icon);
        
        switch(action) {
            case 'Actualizar':
                this.loadDashboardData();
                break;
            case 'Reporte':
                this.generateReport();
                break;
            case 'Nueva Factura':
                this.openInvoiceModal();
                break;
            case 'Nuevo Ticket':
                this.openTicketModal();
                break;
            case 'Nuevo Anuncio':
                this.openAnnouncementModal();
                break;
            case 'Nuevo Residente':
                this.openNewResidentModal();
                break;
            case 'Guardar Cambios':
                this.saveSettings();
                break;
            case 'Enviar Comunicación':
                this.sendCommunication();
                break;
            default:
                this.showNotification(`Función "${action}" en desarrollo`, 'info');
        }
    }

    handleSearch(query) {
        if (query.length > 2) {
            console.log('🔍 Buscando:', query);
            this.showNotification(`Buscando: "${query}"`, 'info', 2000);
            
            // Simular búsqueda
            setTimeout(() => {
                const results = Math.floor(Math.random() * 5);
                if (results > 0) {
                    this.showNotification(`Encontrados ${results} resultados`, 'success', 3000);
                } else {
                    this.showNotification('No se encontraron resultados', 'warning', 3000);
                }
            }, 1000);
        }
    }

    handlePeriodChange(period) {
        console.log('📅 Período cambiado:', period);
        this.showNotification(`Período actualizado: ${period}`, 'info', 2000);
        
        // Simular actualización de datos
        setTimeout(() => {
            this.showNotification(`Datos de ${period} cargados`, 'success', 2000);
        }, 500);
    }

    handleFormSubmit(form) {
        const formId = form.id || 'formulario';
        console.log(`📝 Enviando formulario: ${formId}`);
        
        // Simular envío
        this.showNotification('Enviando formulario...', 'info');
        
        setTimeout(() => {
            this.showNotification('Formulario enviado correctamente', 'success');
            form.reset();
        }, 1500);
    }

    generateReport() {
        this.showNotification('Generando reporte PDF...', 'info');
        setTimeout(() => {
            this.showNotification('Reporte generado exitosamente', 'success');
            // Simular descarga
            const link = document.createElement('a');
            link.href = '#';
            link.download = `reporte-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
        }, 2000);
    }

    openInvoiceModal() {
        this.showNotification('Módulo de facturación en desarrollo', 'info');
    }

    openTicketModal() {
        this.showNotification('Creando nuevo ticket de mantenimiento', 'info');
    }

    openAnnouncementModal() {
        this.showNotification('Creando nuevo anuncio', 'info');
    }

    openNewResidentModal() {
        this.showNotification('Agregando nuevo residente', 'info');
    }

    saveSettings() {
        this.showNotification('Configuración guardada correctamente', 'success');
    }

    sendCommunication() {
        this.showNotification('Comunicación enviada a los residentes', 'success');
    }

    showUserMenu() {
        this.showNotification('Menú de usuario - Funcionalidad en desarrollo', 'info');
    }

    showNotificationsPanel() {
        this.showNotification('Panel de notificaciones - Funcionalidad en desarrollo', 'info');
    }

    showNotification(message, type = 'info', duration = 5000) {
        // Crear contenedor de notificaciones si no existe
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
                .sidebar-overlay {
                    transition: opacity 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(notification);

        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto-remove después de la duración
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
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    }

    async loadFinancialData() {
        console.log('Cargando datos financieros...');
        this.showNotification('Datos financieros cargados', 'success');
    }

    async loadAccessData() {
        console.log('Cargando datos de accesos...');
        this.showNotification('Datos de accesos cargados', 'success');
    }

    async loadMaintenanceData() {
        console.log('Cargando datos de mantenimiento...');
        this.showNotification('Datos de mantenimiento cargados', 'success');
    }

    async loadCommunicationsData() {
        console.log('Cargando datos de comunicaciones...');
        this.showNotification('Datos de comunicaciones cargados', 'success');
    }

    async loadConfigurationData() {
        console.log('Cargando datos de configuración...');
        this.showNotification('Datos de configuración cargados', 'success');
    }

    async loadResidentsData() {
        console.log('Cargando datos de residentes...');
        this.showNotification('Datos de residentes cargados', 'success');
    }

    // Método para limpiar recursos
    cleanup() {
        this.destroyCharts();
        clearTimeout(this.resizeTimeout);
        
        // Remover event listeners globales
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener('orientationchange', this.handleResize.bind(this));
        
        // Limpiar overlay
        this.removeOverlay();
        
        console.log('🧹 Recursos limpiados');
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando dashboard admin...');
    window.adminDashboard = new AdminDashboard();
});

// Manejar carga completa de la página
window.addEventListener('load', () => {
    console.log('📄 Página completamente cargada');
    if (window.adminDashboard) {
        // Forzar un re-check del responsive
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
    
    // Limpiar localStorage
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
    console.log('Token exists:', !!token);
    console.log('Role:', role);
    console.log('Email:', email);
    console.log('Current URL:', window.location.href);
    console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
    console.log('Mobile mode:', window.adminDashboard ? window.adminDashboard.isMobile : 'N/A');
    console.log('Tablet mode:', window.adminDashboard ? window.adminDashboard.isTablet : 'N/A');
    
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

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}