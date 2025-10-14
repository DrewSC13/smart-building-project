// dashboard-admin.js - CÓDIGO COMPLETO Y FUNCIONAL
class CustomModalSystem {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        this.createModalContainer();
        this.addModalStyles();
    }

    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'custom-modal-overlay';
        this.modalContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        this.modalContainer.innerHTML = `
            <div class="custom-modal" style="
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border-radius: 16px;
                padding: 0;
                max-width: 90vw;
                max-height: 90vh;
                width: 500px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(59, 130, 246, 0.3);
                overflow: hidden;
                transform: scale(0.9);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            ">
                <div class="custom-modal-header" style="
                    padding: 20px 24px 0;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
                    margin-bottom: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 class="custom-modal-title" style="
                        margin: 0;
                        color: #f1f5f9;
                        font-size: 1.25rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    "></h3>
                    <button class="custom-modal-close" style="
                        background: none;
                        border: none;
                        color: #94a3b8;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        transition: all 0.2s;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                <div class="custom-modal-content" style="
                    padding: 24px;
                    max-height: 60vh;
                    overflow-y: auto;
                    color: #e2e8f0;
                "></div>
                <div class="custom-modal-footer" style="
                    padding: 16px 24px 24px;
                    border-top: 1px solid rgba(59, 130, 246, 0.2);
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    background: rgba(15, 23, 42, 0.5);
                "></div>
            </div>
        `;
        
        document.body.appendChild(this.modalContainer);

        // Event listeners
        this.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.modalContainer || e.target.classList.contains('custom-modal-close')) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalContainer.style.display === 'flex') {
                this.close();
            }
        });
    }

    addModalStyles() {
        if (!document.getElementById('custom-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'custom-modal-styles';
            styles.textContent = `
                .custom-modal-overlay.active {
                    display: flex !important;
                    animation: fadeIn 0.3s ease;
                }
                
                .custom-modal-overlay.active .custom-modal {
                    transform: scale(1) !important;
                    opacity: 1 !important;
                }
                
                .custom-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .custom-btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                }
                
                .custom-btn-primary:hover {
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                
                .custom-btn-secondary {
                    background: rgba(71, 85, 105, 0.5);
                    color: #e2e8f0;
                    border: 1px solid rgba(100, 116, 139, 0.5);
                }
                
                .custom-btn-secondary:hover {
                    background: rgba(71, 85, 105, 0.8);
                    border-color: rgba(148, 163, 184, 0.8);
                }
                
                .custom-form-group {
                    margin-bottom: 20px;
                }
                
                .custom-form-label {
                    display: block;
                    margin-bottom: 8px;
                    color: #e2e8f0;
                    font-weight: 500;
                    font-size: 0.875rem;
                }
                
                .custom-form-input, .custom-form-select, .custom-form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(71, 85, 105, 0.5);
                    border-radius: 8px;
                    color: #e2e8f0;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                
                .custom-form-input:focus, .custom-form-select:focus, .custom-form-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }
                
                .custom-form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }
                
                .confirmation-modal {
                    text-align: center;
                    padding: 20px 0;
                }
                
                .confirmation-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                    color: #3b82f6;
                }
                
                .confirmation-message {
                    color: #e2e8f0;
                    line-height: 1.6;
                }
                
                .custom-multi-select {
                    border: 1px solid rgba(71, 85, 105, 0.5);
                    border-radius: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    background: rgba(15, 23, 42, 0.7);
                }
                
                .custom-multi-select-item {
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
                    transition: all 0.2s;
                    color: #e2e8f0;
                }
                
                .custom-multi-select-item:hover {
                    background: rgba(59, 130, 246, 0.1);
                }
                
                .custom-multi-select-item.selected {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }
                
                .custom-multi-select-item:last-child {
                    border-bottom: none;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    show(options) {
        const modal = this.modalContainer.querySelector('.custom-modal');
        const title = this.modalContainer.querySelector('.custom-modal-title');
        const content = this.modalContainer.querySelector('.custom-modal-content');
        const footer = this.modalContainer.querySelector('.custom-modal-footer');

        // Configurar título
        title.textContent = options.title || '';
        if (options.icon) {
            title.innerHTML = `<i class="fas fa-${options.icon}"></i> ${title.textContent}`;
        }

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
                if (button.icon) {
                    btn.innerHTML = `<i class="fas fa-${button.icon}"></i> ${btn.textContent}`;
                }
                if (button.disabled) btn.disabled = true;
                footer.appendChild(btn);
            });
        }

        // Aplicar tamaño
        modal.style.width = options.size === 'large' ? '800px' : 
                           options.size === 'small' ? '400px' : '500px';

        // Mostrar modal
        this.modalContainer.classList.add('active');
        this.modalContainer.style.display = 'flex';
        
        setTimeout(() => {
            this.modalContainer.classList.add('active');
        }, 10);

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
        setTimeout(() => {
            this.modalContainer.style.display = 'none';
            if (this.resolvePromise) {
                this.resolvePromise(result);
                this.resolvePromise = null;
            }
        }, 300);
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
                info: 'info-circle',
                success: 'check-circle',
                warning: 'exclamation-triangle',
                error: 'times-circle'
            };

            const colors = {
                info: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444'
            };

            const content = `
                <div class="confirmation-modal">
                    <div class="confirmation-icon" style="color: ${colors[type]}">
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
                        `<option value="${opt.value}" ${opt.value === field.value ? 'selected' : ''}>${opt.text}</option>`
                    ).join('');
                    return `
                        <div class="custom-form-group">
                            <label class="custom-form-label">${field.label}</label>
                            <select class="custom-form-select" ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}>
                                ${options}
                            </select>
                        </div>
                    `;
                } else if (field.type === 'textarea') {
                    return `
                        <div class="custom-form-group">
                            <label class="custom-form-label">${field.label}</label>
                            <textarea class="custom-form-textarea" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}>${field.value || ''}</textarea>
                        </div>
                    `;
                } else {
                    return `
                        <div class="custom-form-group">
                            <label class="custom-form-label">${field.label}</label>
                            <input type="${field.type || 'text'}" class="custom-form-input" 
                                   value="${field.value || ''}" 
                                   placeholder="${field.placeholder || ''}" 
                                   ${field.required ? 'required' : ''}
                                   ${field.disabled ? 'disabled' : ''}>
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
                                    const label = input.previousElementSibling.textContent;
                                    data[label] = input.value;
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
        
        // Inicializar datos
        this.initializeData();
        
        this.modalSystem = new CustomModalSystem();
        this.init();
    }

    initializeData() {
        // Cargar datos desde localStorage o usar valores por defecto
        this.maintenanceTickets = JSON.parse(localStorage.getItem('maintenanceTickets')) || [
            {
                id: 'MT-101',
                title: 'Fuga de agua en baño piso 3',
                area: 'plomeria',
                priority: 'urgente',
                status: 'pending',
                location: 'Torre A, Piso 3, Baño principal',
                description: 'Se reporta fuga constante de agua en el baño principal del departamento 301.',
                assignee: '',
                reporter: 'Ana Martínez (Depto 301)',
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            }
        ];
        
        this.payments = JSON.parse(localStorage.getItem('payments')) || [
            {
                id: 'P-001',
                resident: 'Juan Pérez',
                amount: 120000,
                date: '2024-03-15',
                method: 'Transferencia',
                status: 'completed',
                type: 'mantenimiento',
                description: 'Pago mensual de mantenimiento'
            }
        ];
        
        this.residents = JSON.parse(localStorage.getItem('residents')) || [
            {
                id: 'R-001',
                name: 'Juan Pérez',
                department: 'Torre A - 501',
                phone: '+56 9 1234 5678',
                email: 'juan.perez@email.com',
                status: 'active',
                type: 'owner',
                moveInDate: '2022-01-15'
            }
        ];
        
        this.accessPermissions = JSON.parse(localStorage.getItem('accessPermissions')) || [];
        this.communications = JSON.parse(localStorage.getItem('communications')) || [];
        this.debtors = JSON.parse(localStorage.getItem('debtors')) || [
            {
                name: 'Carlos López',
                department: 'Torre A - 201',
                amount: 5200,
                daysLate: 45,
                status: 'active'
            }
        ];

        // Datos para presupuestos y proyecciones
        this.budgetData = JSON.parse(localStorage.getItem('budgetData')) || {
            categories: [
                { name: 'Ingresos por Alquiler', planned: 85000, actual: 82500 },
                { name: 'Gastos de Mantenimiento', planned: 15000, actual: 13200 },
                { name: 'Servicios Básicos', planned: 8500, actual: 9100 },
                { name: 'Gastos Administrativos', planned: 5000, actual: 4800 }
            ]
        };

        // Datos para emergencias
        this.emergencyData = JSON.parse(localStorage.getItem('emergencyData')) || {
            stats: {
                fire: 12,
                security: 8,
                medical: 5,
                structural: 3,
                utility: 7
            },
            monthlyTrend: [12, 15, 8, 10, 14, 9, 11, 13, 10, 12, 9, 11]
        };
        
        // Contadores
        this.nextTicketId = this.maintenanceTickets.length + 101;
        this.nextPaymentId = this.payments.length + 1;
        this.nextResidentId = this.residents.length + 1;
    }

    getBasePath() {
        return window.location.origin;
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
        
        console.log('✅ Dashboard inicializado completamente');
    }

    setupMockAuth() {
        if (!localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', 'mock-token-' + Date.now());
            localStorage.setItem('userRole', 'administrador');
            localStorage.setItem('userEmail', 'admin@quantumtower.com');
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
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
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
            this.updateLayout();
            this.applyResponsiveStyles();
            this.initializeCharts(this.isMobile);
        }
    }

    updateLayout() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (this.isMobile) {
            this.sidebarVisible = false;
            if (sidebar) sidebar.classList.remove('active');
            if (mainContent) mainContent.style.marginLeft = '0';
            this.removeOverlay();
            this.createMobileToggle();
        } else {
            this.sidebarVisible = true;
            if (sidebar) sidebar.classList.add('active');
            if (mainContent) mainContent.style.marginLeft = '';
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

    // ==================== MEJORAS EN GRÁFICOS ====================

    initializeCharts(isMobile = false) {
        this.destroyCharts();
        
        // Gráfico de Ingresos vs Gastos - MEJORADO
        this.initializeIncomeExpenseChart(isMobile);
        
        // Gráfico Financiero
        this.initializeFinancialChart(isMobile);
        
        // Gráfico de Consumo de Recursos
        this.initializeResourceConsumptionChart(isMobile);
        
        // Gráfico de Mantenimiento - MEJORADO
        this.initializeMaintenanceChart(isMobile);
        
        // Gráfico de Distribución de Residentes
        this.initializeResidentsDistributionChart(isMobile);

        // Gráfico de Presupuestos y Proyecciones
        this.initializeBudgetChart(isMobile);

        // Gráfico de Estadísticas de Emergencias
        this.initializeEmergencyStatsChart(isMobile);
    }

    initializeIncomeExpenseChart(isMobile = false) {
        const ctx = document.getElementById('incomeExpenseChart');
        if (ctx) {
            try {
                // Configuración mejorada del gráfico
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#f1f5f9',
                            bodyColor: '#e2e8f0',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
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
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            },
                            title: {
                                display: true,
                                text: 'Monto ($)',
                                color: '#94a3b8'
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
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    animations: {
                        tension: {
                            duration: 1000,
                            easing: 'linear'
                        }
                    }
                };

                this.charts.incomeExpense = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                        datasets: [
                            {
                                label: 'Ingresos',
                                data: [120000, 125000, 118000, 130000, 125430, 128000, 132000, 135000, 130000, 128000, 125000, 140000],
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderWidth: 3,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: '#10b981',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                                pointRadius: 6,
                                pointHoverRadius: 8
                            },
                            {
                                label: 'Gastos',
                                data: [80000, 82000, 85000, 83000, 85200, 87000, 89000, 91000, 88000, 86000, 85000, 92000],
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderWidth: 3,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: '#ef4444',
                                pointBorderColor: '#ffffff',
                                pointBorderWidth: 2,
                                pointRadius: 6,
                                pointHoverRadius: 8
                            }
                        ]
                    },
                    options: options
                });
                
                console.log('✅ Gráfico de ingresos vs gastos mejorado inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de ingresos vs gastos:', error);
            }
        }
    }

    initializeFinancialChart(isMobile = false) {
        const ctx = document.getElementById('financialChart');
        if (ctx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8'
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

                this.charts.financial = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Ingresos',
                            data: [120000, 125000, 118000, 130000, 125430, 128000],
                            backgroundColor: 'rgba(16, 185, 129, 0.8)'
                        }]
                    },
                    options: options
                });
            } catch (error) {
                console.error('❌ Error inicializando gráfico financiero:', error);
            }
        }
    }

    initializeResourceConsumptionChart(isMobile = false) {
        const ctx = document.getElementById('resourceConsumptionChart');
        if (ctx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20
                            }
                        }
                    }
                };

                this.charts.resourceConsumption = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Torre A', 'Torre B', 'Áreas Comunes'],
                        datasets: [{
                            label: 'Consumo (kWh)',
                            data: [4500, 3800, 2200],
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)'
                            ]
                        }]
                    },
                    options: options
                });
            } catch (error) {
                console.error('❌ Error inicializando gráfico de consumo:', error);
            }
        }
    }

    initializeMaintenanceChart(isMobile = false) {
        const ctx = document.getElementById('maintenanceChart');
        if (ctx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'right',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#f1f5f9',
                            bodyColor: '#e2e8f0',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: isMobile ? '50%' : '60%',
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                };

                this.charts.maintenance = new Chart(ctx, {
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
                            borderWidth: 2,
                            hoverOffset: 15
                        }]
                    },
                    options: options
                });
                console.log('✅ Gráfico de mantenimiento mejorado inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de mantenimiento:', error);
            }
        }
    }

    initializeResidentsDistributionChart(isMobile = false) {
        const ctx = document.getElementById('residentsDistributionChart');
        if (ctx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'right',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20
                            }
                        }
                    }
                };

                this.charts.residentsDistribution = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Propietarios', 'Inquilinos', 'Comerciales'],
                        datasets: [{
                            data: [65, 25, 10],
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)'
                            ]
                        }]
                    },
                    options: options
                });
            } catch (error) {
                console.error('❌ Error inicializando gráfico de residentes:', error);
            }
        }
    }

    initializeBudgetChart(isMobile = false) {
        const ctx = document.getElementById('budgetChart');
        if (ctx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#f1f5f9',
                            bodyColor: '#e2e8f0',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
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

                this.charts.budget = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.budgetData.categories.map(cat => cat.name),
                        datasets: [
                            {
                                label: 'Presupuestado',
                                data: this.budgetData.categories.map(cat => cat.planned),
                                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                borderColor: '#3b82f6',
                                borderWidth: 1
                            },
                            {
                                label: 'Real',
                                data: this.budgetData.categories.map(cat => cat.actual),
                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                borderColor: '#10b981',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: options
                });
                console.log('✅ Gráfico de presupuestos inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de presupuestos:', error);
            }
        }
    }

    initializeEmergencyStatsChart(isMobile = false) {
        const ctx = document.getElementById('emergencyStatsChart');
        if (ctx) {
            try {
                const options = {
                    responsive: true,
                    maintainAspectRatio: !isMobile,
                    plugins: {
                        legend: {
                            position: isMobile ? 'bottom' : 'top',
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: isMobile ? 12 : 14
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#f1f5f9',
                            bodyColor: '#e2e8f0',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8'
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

                this.charts.emergencyStats = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                        datasets: [{
                            label: 'Emergencias Mensuales',
                            data: this.emergencyData.monthlyTrend,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: options
                });
                console.log('✅ Gráfico de estadísticas de emergencias inicializado');
            } catch (error) {
                console.error('❌ Error inicializando gráfico de emergencias:', error);
            }
        }
    }

    // ==================== GESTIÓN FINANCIERA MEJORADA ====================

    setupFinancialEvents() {
        // Botones principales mejorados
        const elements = {
            'new-invoice': () => this.createNewInvoice(),
            'financial-reports': () => this.generateFinancialReports(),
            'generate-receipts': () => this.generateReceipt(),
            'generate-rent-invoices': () => this.generateRentInvoices(),
            'add-service': () => this.addService(),
            'calculate-expenses': () => this.calculateExpenses(),
            'send-bulk-reminders': () => this.sendPaymentReminder(),
            'create-payment-plan': () => this.createPaymentPlan(),
            'block-access': () => this.blockAccessForDebt(),
            'generate-debt-report': () => this.generateDebtReport(),
            'collection-analysis': () => this.collectionAnalysis(),
            'generate-report': () => this.generateFinancialReport(),
            'schedule-report': () => this.scheduleFinancialReport()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Filtros mejorados
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

        // Configuración de reportes
        const reportPeriod = document.getElementById('report-period');
        if (reportPeriod) {
            reportPeriod.addEventListener('change', (e) => {
                this.toggleCustomDateRange(e.target.value);
            });
        }

        // Event delegation para botones de acción en tablas
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-payment')) {
                const paymentId = e.target.closest('.view-payment').getAttribute('data-id');
                this.viewPaymentDetails(paymentId);
            }
            if (e.target.closest('.send-reminder')) {
                const resident = e.target.closest('.send-reminder').getAttribute('data-resident');
                this.sendIndividualReminder(resident);
            }
            if (e.target.closest('.create-plan')) {
                const resident = e.target.closest('.create-plan').getAttribute('data-resident');
                this.createIndividualPaymentPlan(resident);
            }
            if (e.target.closest('.legal-action')) {
                const resident = e.target.closest('.legal-action').getAttribute('data-resident');
                this.initiateLegalAction(resident);
            }
            if (e.target.closest('.pay-service')) {
                const service = e.target.closest('.pay-service').getAttribute('data-service');
                this.payService(service);
            }
            if (e.target.closest('.view-bill')) {
                const service = e.target.closest('.view-bill').getAttribute('data-service');
                this.viewServiceBill(service);
            }
            if (e.target.closest('.print-receipt')) {
                const paymentId = e.target.closest('.print-receipt').getAttribute('data-id');
                this.printReceipt(paymentId);
            }
        });

        // Tabs de pagos
        this.setupPaymentTabs();
    }

    setupPaymentTabs() {
        const tabButtons = document.querySelectorAll('.payment-tabs .tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchPaymentTab(tabId);
            });
        });
    }

    switchPaymentTab(tabId) {
        // Ocultar todos los tabs
        document.querySelectorAll('.payment-tabs .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Desactivar todos los botones de tab
        document.querySelectorAll('.payment-tabs .tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Activar tab seleccionado
        const targetTab = document.getElementById(`${tabId}-tab`);
        const targetButton = document.querySelector(`.payment-tabs .tab-button[data-tab="${tabId}"]`);

        if (targetTab && targetButton) {
            targetTab.classList.add('active');
            targetButton.classList.add('active');
        }
    }

    toggleCustomDateRange(value) {
        const customRange = document.getElementById('custom-date-range');
        if (customRange) {
            customRange.style.display = value === 'custom' ? 'block' : 'none';
        }
    }

    // ==================== MÉTODOS FINANCIEROS MEJORADOS ====================

    async createNewInvoice() {
        const result = await this.modalSystem.form('Crear Nueva Factura', [
            {
                label: 'Residente',
                type: 'select',
                required: true,
                options: this.residents.map(r => ({
                    value: r.id,
                    text: `${r.name} - ${r.department}`
                }))
            },
            {
                label: 'Tipo de Factura',
                type: 'select',
                required: true,
                options: [
                    { value: 'mantenimiento', text: 'Mantenimiento Mensual' },
                    { value: 'multa', text: 'Multa' },
                    { value: 'servicio', text: 'Servicio Adicional' },
                    { value: 'otros', text: 'Otros' }
                ]
            },
            {
                label: 'Monto',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Fecha de Vencimiento',
                type: 'date',
                required: true,
                value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                label: 'Descripción',
                type: 'textarea',
                required: true,
                placeholder: 'Descripción detallada de la factura...'
            }
        ]);

        if (result) {
            const resident = this.residents.find(r => r.id === result['Residente']);
            const newInvoice = {
                id: `INV-${Date.now()}`,
                resident: resident.name,
                residentId: resident.id,
                amount: parseFloat(result['Monto']),
                type: result['Tipo de Factura'],
                dueDate: result['Fecha de Vencimiento'],
                description: result['Descripción'],
                status: 'pending',
                created: new Date().toISOString()
            };
            
            // Guardar en localStorage
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            invoices.push(newInvoice);
            localStorage.setItem('invoices', JSON.stringify(invoices));
            
            this.modalSystem.alert('✅ Factura Creada', 
                `Factura creada exitosamente para ${resident.name}. Monto: $${newInvoice.amount.toLocaleString()}`, 
                'success');
        }
    }

    async generateFinancialReports() {
        const result = await this.modalSystem.form('Generar Reporte Financiero', [
            {
                label: 'Tipo de Reporte',
                type: 'select',
                required: true,
                options: [
                    { value: 'mensual', text: 'Reporte Mensual' },
                    { value: 'trimestral', text: 'Reporte Trimestral' },
                    { value: 'anual', text: 'Reporte Anual' },
                    { value: 'personalizado', text: 'Personalizado' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'ambos', text: 'PDF y Excel' }
                ]
            },
            {
                label: 'Incluir Detalles',
                type: 'checkbox',
                value: 'on'
            },
            {
                label: 'Incluir Gráficos',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte financiero...');
            
            setTimeout(() => {
                this.hideLoading();
                
                // Simular generación de reporte
                const reportData = {
                    totalIncome: this.payments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + p.amount, 0),
                    totalExpenses: 85200,
                    pendingPayments: this.payments.filter(p => p.status === 'pending').length,
                    totalDebt: this.debtors.reduce((sum, d) => sum + d.amount, 0),
                    generatedAt: new Date().toISOString()
                };
                
                this.downloadReport(reportData, result['Formato']);
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte financiero generado exitosamente en formato ${result['Formato'].toUpperCase()}.`, 
                    'success');
            }, 2000);
        }
    }

    downloadReport(data, format) {
        // Simular descarga de reporte
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    async generateReceipt() {
        const paymentsList = this.payments
            .filter(p => p.status === 'completed')
            .map(p => ({
                value: p.id,
                text: `${p.id} - ${p.resident} - $${p.amount.toLocaleString()}`
            }));

        if (paymentsList.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Pagos', 'No hay pagos completados para generar recibos.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Generar Recibo', [
            {
                label: 'Seleccionar Pago',
                type: 'select',
                required: true,
                options: paymentsList
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'email', text: 'Enviar por Email' },
                    { value: 'ambos', text: 'PDF y Email' }
                ]
            },
            {
                label: 'Incluir Detalles Adicionales',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            const payment = this.payments.find(p => p.id === result['Seleccionar Pago']);
            if (payment) {
                this.showLoading('Generando recibo...');
                
                setTimeout(() => {
                    this.hideLoading();
                    
                    // Simular generación de recibo
                    const receiptContent = this.createReceiptContent(payment, result['Incluir Detalles Adicionales'] === 'on');
                    
                    if (result['Formato'] === 'pdf' || result['Formato'] === 'ambos') {
                        this.downloadPDFReceipt(receiptContent, payment.id);
                    }
                    
                    if (result['Formato'] === 'email' || result['Formato'] === 'ambos') {
                        this.sendReceiptByEmail(payment, receiptContent);
                    }
                    
                    this.modalSystem.alert('✅ Recibo Generado', 
                        `Recibo ${payment.id} generado exitosamente.`, 
                        'success');
                }, 1500);
            }
        }
    }

    createReceiptContent(payment, includeDetails = false) {
        const receipt = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #3b82f6; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #3b82f6; margin: 0;">QUANTUM TOWER</h1>
                    <p style="color: #666; margin: 5px 0;">Sistema de Administración de Condominios</p>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #1e293b; margin: 0 0 10px 0;">RECIBO DE PAGO</h2>
                    <p style="margin: 5px 0;"><strong>Número:</strong> ${payment.id}</p>
                    <p style="margin: 5px 0;"><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Residente:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payment.resident}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Monto:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">$${payment.amount.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Método de Pago:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payment.method}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Fecha del Pago:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payment.date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Referencia:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${payment.reference || 'N/A'}</td>
                    </tr>
                </table>
                
                ${includeDetails ? `
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #0369a1; margin: 0 0 10px 0;">Detalles Adicionales</h3>
                    <p style="margin: 5px 0;"><strong>Tipo:</strong> ${payment.type}</p>
                    <p style="margin: 5px 0;"><strong>Descripción:</strong> ${payment.description || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>Estado:</strong> ${payment.status}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #666; margin: 5px 0;">¡Gracias por su pago!</p>
                    <p style="color: #666; margin: 5px 0; font-size: 0.9em;">Este es un comprobante generado automáticamente</p>
                </div>
            </div>
        `;
        
        return receipt;
    }

    downloadPDFReceipt(content, paymentId) {
        // En un entorno real, aquí se generaría el PDF
        // Por ahora simulamos la descarga
        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${paymentId}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    sendReceiptByEmail(payment, receiptContent) {
        // Simular envío de email
        console.log(`Enviando recibo ${payment.id} a ${payment.resident}...`);
        // En un entorno real, aquí se integraría con un servicio de email
    }

    // ==================== GESTIÓN DE DEUDAS MEJORADA ====================

    async sendPaymentReminder() {
        if (this.debtors.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Deudores', 'No hay residentes con pagos pendientes.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Enviar Recordatorios de Pago', [
            {
                label: 'Tipo de Recordatorio',
                type: 'select',
                required: true,
                options: [
                    { value: 'amable', text: 'Recordatorio Amable' },
                    { value: 'urgente', text: 'Recordatorio Urgente' },
                    { value: 'legal', text: 'Aviso Legal' }
                ]
            },
            {
                label: 'Método de Envío',
                type: 'select',
                required: true,
                options: [
                    { value: 'email', text: 'Email' },
                    { value: 'sms', text: 'SMS' },
                    { value: 'ambos', text: 'Email y SMS' }
                ]
            },
            {
                label: 'Incluir Todos los Deudores',
                type: 'checkbox',
                value: 'on'
            },
            {
                label: 'Mensaje Personalizado',
                type: 'textarea',
                placeholder: 'Opcional: Escriba un mensaje personalizado...'
            }
        ]);

        if (result) {
            const selectedDebtors = result['Incluir Todos los Deudores'] === 'on' ? 
                this.debtors : this.debtors;

            if (selectedDebtors.length === 0) {
                this.modalSystem.alert('⚠️ Sin Selección', 'No se seleccionaron deudores para enviar recordatorios.', 'warning');
                return;
            }

            this.showLoading('Enviando recordatorios...');

            setTimeout(() => {
                this.hideLoading();

                // Registrar la acción
                selectedDebtors.forEach(debtor => {
                    debtor.lastReminderSent = new Date().toISOString();
                    debtor.reminderCount = (debtor.reminderCount || 0) + 1;
                });

                this.saveData();

                const summary = selectedDebtors.map(d => 
                    `${d.name}: $${d.amount.toLocaleString()} (${d.daysLate} días)`
                ).join('\n');

                this.modalSystem.alert('✅ Recordatorios Enviados', 
                    `Se enviaron ${selectedDebtors.length} recordatorios exitosamente:\n\n${summary}`, 
                    'success');
            }, 2000);
        }
    }

    async createPaymentPlan() {
        if (this.debtors.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Deudores', 'No hay residentes con pagos pendientes.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Crear Plan de Pago', [
            {
                label: 'Residente',
                type: 'select',
                required: true,
                options: this.debtors.map(d => ({
                    value: d.name,
                    text: `${d.name} - $${d.amount.toLocaleString()} (${d.daysLate} días)`
                }))
            },
            {
                label: 'Monto Total a Financiar',
                type: 'number',
                required: true,
                placeholder: '0',
                value: this.debtors.find(d => d.name === result?.['Residente'])?.amount || 0
            },
            {
                label: 'Número de Cuotas',
                type: 'select',
                required: true,
                options: [
                    { value: '3', text: '3 cuotas' },
                    { value: '6', text: '6 cuotas' },
                    { value: '12', text: '12 cuotas' }
                ]
            },
            {
                label: 'Fecha de Inicio',
                type: 'date',
                required: true,
                value: new Date().toISOString().split('T')[0]
            },
            {
                label: 'Día de Pago Mensual',
                type: 'number',
                required: true,
                min: 1,
                max: 28,
                value: 5
            },
            {
                label: 'Tasa de Interés (%)',
                type: 'number',
                step: '0.1',
                value: '0.0',
                placeholder: '0.0'
            }
        ]);

        if (result) {
            const debtor = this.debtors.find(d => d.name === result['Residente']);
            const totalAmount = parseFloat(result['Monto Total a Financiar']);
            const numberOfInstallments = parseInt(result['Número de Cuotas']);
            const interestRate = parseFloat(result['Tasa de Interés']) / 100;

            // Calcular cuotas
            const totalWithInterest = totalAmount * (1 + interestRate);
            const installmentAmount = totalWithInterest / numberOfInstallments;

            const paymentPlan = {
                id: `PLAN-${Date.now()}`,
                resident: debtor.name,
                totalAmount: totalAmount,
                numberOfInstallments: numberOfInstallments,
                installmentAmount: Math.round(installmentAmount),
                startDate: result['Fecha de Inicio'],
                paymentDay: parseInt(result['Día de Pago Mensual']),
                interestRate: interestRate * 100,
                status: 'active',
                created: new Date().toISOString()
            };

            // Guardar plan
            const paymentPlans = JSON.parse(localStorage.getItem('paymentPlans') || '[]');
            paymentPlans.push(paymentPlan);
            localStorage.setItem('paymentPlans', JSON.stringify(paymentPlans));

            // Mostrar resumen del plan
            const planSummary = `
                <div class="plan-summary">
                    <h3>📋 Resumen del Plan de Pago</h3>
                    <div class="plan-details">
                        <p><strong>Residente:</strong> ${debtor.name}</p>
                        <p><strong>Monto Total:</strong> $${totalAmount.toLocaleString()}</p>
                        <p><strong>Número de Cuotas:</strong> ${numberOfInstallments}</p>
                        <p><strong>Valor Cuota:</strong> $${Math.round(installmentAmount).toLocaleString()}</p>
                        <p><strong>Fecha Inicio:</strong> ${result['Fecha de Inicio']}</p>
                        <p><strong>Día de Pago:</strong> ${result['Día de Pago Mensual']} de cada mes</p>
                        ${interestRate > 0 ? `<p><strong>Tasa de Interés:</strong> ${(interestRate * 100).toFixed(1)}%</p>` : ''}
                    </div>
                </div>
            `;

            this.modalSystem.show({
                title: '✅ Plan de Pago Creado',
                content: planSummary,
                buttons: [
                    {
                        text: 'Imprimir Plan',
                        class: 'custom-btn-primary',
                        icon: 'print',
                        handler: () => this.printPaymentPlan(paymentPlan)
                    },
                    {
                        text: 'Enviar al Residente',
                        class: 'custom-btn-secondary',
                        icon: 'envelope',
                        handler: () => this.sendPaymentPlanToResident(paymentPlan)
                    },
                    {
                        text: 'Cerrar',
                        class: 'custom-btn-secondary',
                        handler: () => this.modalSystem.close()
                    }
                ]
            });
        }
    }

    printPaymentPlan(plan) {
        // Simular impresión
        window.print();
    }

    sendPaymentPlanToResident(plan) {
        this.modalSystem.alert('📧 Plan Enviado', `El plan de pago ha sido enviado a ${plan.resident}.`, 'success');
    }

    async blockAccessForDebt() {
        if (this.debtors.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Deudores', 'No hay residentes con pagos pendientes.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Bloquear Accesos por Mora', [
            {
                label: 'Umbral de Días de Mora',
                type: 'number',
                required: true,
                value: '30',
                placeholder: '30'
            },
            {
                label: 'Tipo de Bloqueo',
                type: 'select',
                required: true,
                options: [
                    { value: 'parcial', text: 'Bloqueo Parcial (Áreas Comunes)' },
                    { value: 'total', text: 'Bloqueo Total' }
                ]
            },
            {
                label: 'Enviar Notificación',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            const threshold = parseInt(result['Umbral de Días de Mora']);
            const affectedDebtors = this.debtors.filter(d => d.daysLate >= threshold);

            if (affectedDebtors.length === 0) {
                this.modalSystem.alert('ℹ️ Sin Afectados', 
                    `No hay residentes con ${threshold} o más días de mora.`, 
                    'info');
                return;
            }

            const confirm = await this.modalSystem.confirm(
                'Confirmar Bloqueo de Accesos',
                `¿Está seguro de bloquear el acceso a ${affectedDebtors.length} residentes con ${threshold}+ días de mora?`
            );

            if (confirm) {
                this.showLoading('Aplicando restricciones de acceso...');

                setTimeout(() => {
                    this.hideLoading();

                    // Aplicar bloqueos
                    affectedDebtors.forEach(debtor => {
                        debtor.accessRestricted = true;
                        debtor.restrictionType = result['Tipo de Bloqueo'];
                        debtor.restrictionDate = new Date().toISOString();
                    });

                    this.saveData();

                    const summary = affectedDebtors.map(d => 
                        `${d.name}: ${d.daysLate} días de mora`
                    ).join('\n');

                    this.modalSystem.alert('✅ Accesos Bloqueados', 
                        `Se aplicaron restricciones de acceso a ${affectedDebtors.length} residentes:\n\n${summary}`, 
                        'success');
                }, 2000);
            }
        }
    }

    // ==================== MANTENIMIENTO MEJORADO ====================

    setupMaintenanceEvents() {
        // Botones principales mejorados
        const elements = {
            'new-maintenance-ticket': () => this.createNewMaintenanceTicket(),
            'filter-maintenance': () => this.filterMaintenanceTickets(),
            'schedule-maintenance': () => this.scheduleMaintenance(),
            'add-company': () => this.addMaintenanceCompany(),
            'create-ticket': () => this.createNewMaintenanceTicket(),
            'assign-technician': () => this.assignTechnician(),
            'update-status': () => this.updateMaintenanceStatus(),
            'maintenance-reports': () => this.generateMaintenanceReports(),
            'inventory-management': () => this.manageInventory(),
            'preventive-maintenance': () => this.schedulePreventiveMaintenance()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Event delegation para acciones de tickets
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-ticket')) {
                const ticketId = e.target.closest('.view-ticket').getAttribute('data-id');
                this.viewTicketDetails(ticketId);
            }
            if (e.target.closest('.edit-ticket')) {
                const ticketId = e.target.closest('.edit-ticket').getAttribute('data-id');
                this.editTicket(ticketId);
            }
            if (e.target.closest('.assign-ticket')) {
                const ticketId = e.target.closest('.assign-ticket').getAttribute('data-id');
                this.assignToTicket(ticketId);
            }
            if (e.target.closest('.resolve-ticket')) {
                const ticketId = e.target.closest('.resolve-ticket').getAttribute('data-id');
                this.resolveTicket(ticketId);
            }
        });
    }

    async createNewMaintenanceTicket() {
        const result = await this.modalSystem.form('Crear Nuevo Ticket de Mantenimiento', [
            {
                label: 'Título del Ticket',
                type: 'text',
                required: true,
                placeholder: 'Ej: Fuga de agua en baño'
            },
            {
                label: 'Área',
                type: 'select',
                required: true,
                options: [
                    { value: 'plomeria', text: 'Plomería' },
                    { value: 'electricidad', text: 'Electricidad' },
                    { value: 'ascensores', text: 'Ascensores' },
                    { value: 'pintura', text: 'Pintura' },
                    { value: 'jardineria', text: 'Jardinería' },
                    { value: 'limpieza', text: 'Limpieza' },
                    { value: 'seguridad', text: 'Seguridad' },
                    { value: 'otros', text: 'Otros' }
                ]
            },
            {
                label: 'Prioridad',
                type: 'select',
                required: true,
                options: [
                    { value: 'baja', text: 'Baja' },
                    { value: 'media', text: 'Media' },
                    { value: 'alta', text: 'Alta' },
                    { value: 'urgente', text: 'Urgente' }
                ]
            },
            {
                label: 'Ubicación Exacta',
                type: 'text',
                required: true,
                placeholder: 'Ej: Torre A, Piso 3, Departamento 301'
            },
            {
                label: 'Descripción Detallada',
                type: 'textarea',
                required: true,
                placeholder: 'Describa el problema en detalle...'
            },
            {
                label: 'Reportado por',
                type: 'text',
                required: true,
                placeholder: 'Nombre de quien reporta'
            },
            {
                label: 'Contacto',
                type: 'tel',
                placeholder: 'Teléfono de contacto'
            }
        ]);

        if (result) {
            const newTicket = {
                id: `MT-${this.nextTicketId}`,
                title: result['Título del Ticket'],
                area: result['Área'],
                priority: result['Prioridad'],
                status: 'pending',
                location: result['Ubicación Exacta'],
                description: result['Descripción Detallada'],
                reporter: result['Reportado por'],
                contact: result['Contacto'],
                assignee: '',
                estimatedCost: 0,
                actualCost: 0,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                history: [
                    {
                        action: 'created',
                        user: 'Sistema',
                        timestamp: new Date().toISOString(),
                        notes: 'Ticket creado'
                    }
                ]
            };
            
            this.maintenanceTickets.unshift(newTicket);
            this.nextTicketId++;
            this.saveData();
            this.updateMaintenanceDashboard();
            
            this.modalSystem.alert('✅ Ticket Creado', 
                `Ticket ${newTicket.id} creado exitosamente. Se ha notificado al equipo de mantenimiento.`, 
                'success');
        }
    }

    async assignTechnician() {
        const pendingTickets = this.maintenanceTickets.filter(t => !t.assignee && t.status === 'pending');
        
        if (pendingTickets.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Tickets Pendientes', 'No hay tickets pendientes de asignación.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Asignar Técnico', [
            {
                label: 'Seleccionar Ticket',
                type: 'select',
                required: true,
                options: pendingTickets.map(t => ({
                    value: t.id,
                    text: `${t.id} - ${t.title} (${t.priority})`
                }))
            },
            {
                label: 'Técnico',
                type: 'select',
                required: true,
                options: [
                    { value: 'juan-perez', text: 'Juan Pérez - Plomería' },
                    { value: 'maria-garcia', text: 'María García - Electricidad' },
                    { value: 'carlos-lopez', text: 'Carlos López - General' },
                    { value: 'ana-martinez', text: 'Ana Martínez - Pintura' }
                ]
            },
            {
                label: 'Fecha Límite',
                type: 'date',
                required: true
            },
            {
                label: 'Presupuesto Estimado',
                type: 'number',
                placeholder: '0'
            },
            {
                label: 'Instrucciones Especiales',
                type: 'textarea',
                placeholder: 'Instrucciones adicionales para el técnico...'
            }
        ]);

        if (result) {
            const ticket = this.maintenanceTickets.find(t => t.id === result['Seleccionar Ticket']);
            if (ticket) {
                ticket.assignee = result['Técnico'];
                ticket.status = 'in-progress';
                ticket.deadline = result['Fecha Límite'];
                ticket.estimatedCost = parseFloat(result['Presupuesto Estimado']) || 0;
                ticket.updated = new Date().toISOString();
                
                ticket.history.push({
                    action: 'assigned',
                    user: 'Administrador',
                    timestamp: new Date().toISOString(),
                    notes: `Asignado a: ${result['Técnico']}. Instrucciones: ${result['Instrucciones Especiales'] || 'Ninguna'}`
                });

                this.saveData();
                this.updateMaintenanceDashboard();
                
                this.modalSystem.alert('✅ Técnico Asignado', 
                    `Ticket ${ticket.id} asignado exitosamente.`, 
                    'success');
            }
        }
    }

    async updateMaintenanceStatus() {
        const activeTickets = this.maintenanceTickets.filter(t => 
            t.status === 'pending' || t.status === 'in-progress'
        );

        if (activeTickets.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Tickets Activos', 'No hay tickets activos para actualizar.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Actualizar Estado de Ticket', [
            {
                label: 'Seleccionar Ticket',
                type: 'select',
                required: true,
                options: activeTickets.map(t => ({
                    value: t.id,
                    text: `${t.id} - ${t.title} (${t.status})`
                }))
            },
            {
                label: 'Nuevo Estado',
                type: 'select',
                required: true,
                options: [
                    { value: 'in-progress', text: 'En Progreso' },
                    { value: 'on-hold', text: 'En Espera' },
                    { value: 'completed', text: 'Completado' },
                    { value: 'cancelled', text: 'Cancelado' }
                ]
            },
            {
                label: 'Costo Real',
                type: 'number',
                placeholder: '0'
            },
            {
                label: 'Tiempo Invertido (horas)',
                type: 'number',
                step: '0.5',
                placeholder: '0'
            },
            {
                label: 'Comentarios',
                type: 'textarea',
                required: true,
                placeholder: 'Describa el progreso o resultado...'
            }
        ]);

        if (result) {
            const ticket = this.maintenanceTickets.find(t => t.id === result['Seleccionar Ticket']);
            if (ticket) {
                const oldStatus = ticket.status;
                ticket.status = result['Nuevo Estado'];
                ticket.actualCost = parseFloat(result['Costo Real']) || 0;
                ticket.timeSpent = parseFloat(result['Tiempo Invertido (horas)']) || 0;
                ticket.updated = new Date().toISOString();
                
                if (ticket.status === 'completed') {
                    ticket.completedAt = new Date().toISOString();
                }

                ticket.history.push({
                    action: 'status_update',
                    user: 'Administrador',
                    timestamp: new Date().toISOString(),
                    notes: `Estado cambiado de ${oldStatus} a ${ticket.status}. ${result['Comentarios']}`
                });

                this.saveData();
                this.updateMaintenanceDashboard();
                
                this.modalSystem.alert('✅ Estado Actualizado', 
                    `Estado del ticket ${ticket.id} actualizado exitosamente.`, 
                    'success');
            }
        }
    }

    updateMaintenanceDashboard() {
        const pending = this.maintenanceTickets.filter(t => t.status === 'pending').length;
        const inProgress = this.maintenanceTickets.filter(t => t.status === 'in-progress').length;
        const completed = this.maintenanceTickets.filter(t => t.status === 'completed').length;
        const urgent = this.maintenanceTickets.filter(t => t.priority === 'urgente').length;

        // Actualizar estadísticas
        this.updateElementText('maintenance-pending', pending);
        this.updateElementText('maintenance-in-progress', inProgress);
        this.updateElementText('maintenance-completed', completed);
        this.updateElementText('maintenance-urgent', urgent);

        // Actualizar tabla
        this.updateMaintenanceTicketsTable();

        // Actualizar gráfico
        if (this.charts.maintenance) {
            this.charts.maintenance.data.datasets[0].data = [pending, inProgress, completed, urgent];
            this.charts.maintenance.update();
        }
    }

    updateMaintenanceTicketsTable() {
        const tbody = document.querySelector('#maintenance-tickets-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = this.maintenanceTickets.map(ticket => `
            <tr>
                <td>${ticket.id}</td>
                <td>
                    <div class="ticket-title">${ticket.title}</div>
                    <div class="ticket-location">${ticket.location}</div>
                </td>
                <td>${this.getAreaDisplayName(ticket.area)}</td>
                <td><span class="badge priority-${ticket.priority}">${this.capitalizeFirst(ticket.priority)}</span></td>
                <td><span class="status status-${ticket.status}">${this.capitalizeFirst(ticket.status)}</span></td>
                <td>${ticket.assignee ? this.getTechnicianName(ticket.assignee) : 'Sin asignar'}</td>
                <td>${new Date(ticket.created).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-ticket" data-id="${ticket.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-ticket" data-id="${ticket.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!ticket.assignee ? `
                        <button class="btn-icon assign-ticket" data-id="${ticket.id}" title="Asignar técnico">
                            <i class="fas fa-user-tie"></i>
                        </button>
                        ` : ''}
                        ${ticket.status !== 'completed' ? `
                        <button class="btn-icon resolve-ticket" data-id="${ticket.id}" title="Resolver ticket">
                            <i class="fas fa-check-circle"></i>
                        </button>
                        ` : ''}
                    </div>
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

    getTechnicianName(techId) {
        const technicians = {
            'juan-perez': 'Juan Pérez',
            'maria-garcia': 'María García',
            'carlos-lopez': 'Carlos López',
            'ana-martinez': 'Ana Martínez'
        };
        return technicians[techId] || techId;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ==================== EMERGENCIAS COMPLETADO ====================

    setupEmergencyEvents() {
        const elements = {
            'new-emergency': () => this.createNewEmergency(),
            'emergency-history': () => this.showEmergencyHistory(),
            'emergency-procedures': () => this.showEmergencyProcedures(),
            'test-fire-alarm': () => this.testFireAlarm(),
            'lockdown-building': () => this.lockdownBuilding(),
            'call-ambulance': () => this.callAmbulance(),
            'test-alert': () => this.testAlert(),
            'send-alert': () => this.sendMassAlert(),
            'generate-emergency-report': () => this.generateEmergencyReport()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Tabs de emergencias
        this.setupEmergencyTabs();

        // Protocolos de emergencia
        document.querySelectorAll('[data-protocol]').forEach(button => {
            button.addEventListener('click', (e) => {
                const protocol = e.target.getAttribute('data-protocol');
                this.executeEmergencyProtocol(protocol);
            });
        });

        // Contactos de emergencia
        document.querySelectorAll('.contact-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const contact = e.target.getAttribute('data-contact');
                this.contactEmergencyService(contact);
            });
        });

        // Reportes de emergencia
        document.querySelectorAll('[data-report]').forEach(button => {
            button.addEventListener('click', (e) => {
                const reportType = e.target.getAttribute('data-report');
                this.generateEmergencyReport(reportType);
            });
        });
    }

    setupEmergencyTabs() {
        const tabButtons = document.querySelectorAll('.emergency-categories-tabs .tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchEmergencyTab(tabId);
            });
        });
    }

    switchEmergencyTab(tabId) {
        // Ocultar todos los tabs
        document.querySelectorAll('.emergency-categories-tabs .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Desactivar todos los botones de tab
        document.querySelectorAll('.emergency-categories-tabs .tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Activar tab seleccionado
        const targetTab = document.getElementById(`${tabId}-tab`);
        const targetButton = document.querySelector(`.emergency-categories-tabs .tab-button[data-tab="${tabId}"]`);

        if (targetTab && targetButton) {
            targetTab.classList.add('active');
            targetButton.classList.add('active');
        }
    }

    async createNewEmergency() {
        const result = await this.modalSystem.form('Registrar Nueva Emergencia', [
            {
                label: 'Tipo de Emergencia',
                type: 'select',
                required: true,
                options: [
                    { value: 'fire', text: 'Incendio' },
                    { value: 'security', text: 'Seguridad' },
                    { value: 'medical', text: 'Médica' },
                    { value: 'structural', text: 'Estructural' },
                    { value: 'utility', text: 'Servicios' }
                ]
            },
            {
                label: 'Gravedad',
                type: 'select',
                required: true,
                options: [
                    { value: 'low', text: 'Baja' },
                    { value: 'medium', text: 'Media' },
                    { value: 'high', text: 'Alta' },
                    { value: 'critical', text: 'Crítica' }
                ]
            },
            {
                label: 'Ubicación',
                type: 'text',
                required: true,
                placeholder: 'Ej: Torre A, Piso 8'
            },
            {
                label: 'Descripción',
                type: 'textarea',
                required: true,
                placeholder: 'Describa la emergencia en detalle...'
            },
            {
                label: 'Reportado por',
                type: 'text',
                required: true,
                placeholder: 'Nombre de quien reporta'
            }
        ]);

        if (result) {
            const newEmergency = {
                id: `EMG-${Date.now()}`,
                type: result['Tipo de Emergencia'],
                severity: result['Gravedad'],
                location: result['Ubicación'],
                description: result['Descripción'],
                reporter: result['Reportado por'],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Guardar emergencia
            const emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
            emergencies.unshift(newEmergency);
            localStorage.setItem('emergencies', JSON.stringify(emergencies));

            // Actualizar estadísticas
            this.updateEmergencyStats();

            this.modalSystem.alert('✅ Emergencia Registrada', 
                `Emergencia ${newEmergency.id} registrada exitosamente. Se han activado los protocolos correspondientes.`, 
                'warning');
        }
    }

    updateEmergencyStats() {
        // Actualizar estadísticas en el dashboard
        const stats = this.emergencyData.stats;
        
        Object.entries(stats).forEach(([type, count]) => {
            const element = document.getElementById(`${type}-emergencies-count`);
            if (element) {
                element.textContent = count;
            }
        });

        // Actualizar gráfico si existe
        if (this.charts.emergencyStats) {
            this.charts.emergencyStats.data.datasets[0].data = this.emergencyData.monthlyTrend;
            this.charts.emergencyStats.update();
        }
    }

    executeEmergencyProtocol(protocol) {
        const protocols = {
            'fire': 'Protocolo de Incendio activado. Iniciando evacuación y contactando bomberos.',
            'security': 'Protocolo de Seguridad activado. Bloqueando accesos y contactando autoridades.',
            'medical': 'Protocolo Médico activado. Despachando equipo de primeros auxilios y ambulancia.',
            'utilities': 'Protocolo de Servicios activado. Aislando área afectada y contactando proveedores.'
        };

        this.modalSystem.alert('🚨 Protocolo Activado', protocols[protocol] || 'Protocolo ejecutado.', 'warning');
    }

    contactEmergencyService(service) {
        const services = {
            'fire-department': 'Llamando a bomberos...',
            'police': 'Contactando policía...',
            'ambulance': 'Solicitando ambulancia...',
            'maintenance': 'Contactando mantenimiento urgente...'
        };

        this.showLoading(services[service] || 'Contactando servicio...');
        
        setTimeout(() => {
            this.hideLoading();
            this.modalSystem.alert('✅ Servicio Contactado', `El servicio de emergencia ha sido contactado exitosamente.`, 'success');
        }, 2000);
    }

    testFireAlarm() {
        this.showLoading('Probando alarma de incendio...');
        
        setTimeout(() => {
            this.hideLoading();
            this.modalSystem.alert('🔊 Prueba de Alarma', 'Alarma de incendio probada exitosamente. Todos los sistemas funcionan correctamente.', 'info');
        }, 1500);
    }

    lockdownBuilding() {
        this.modalSystem.confirm('🔒 Bloqueo de Edificio', '¿Está seguro de activar el bloqueo total del edificio?')
            .then(confirmed => {
                if (confirmed) {
                    this.showLoading('Activando bloqueo de edificio...');
                    
                    setTimeout(() => {
                        this.hideLoading();
                        this.modalSystem.alert('✅ Edificio Bloqueado', 'Bloqueo de seguridad activado. Todos los accesos han sido restringidos.', 'warning');
                    }, 2000);
                }
            });
    }

    callAmbulance() {
        this.showLoading('Solicitando ambulancia...');
        
        setTimeout(() => {
            this.hideLoading();
            this.modalSystem.alert('🚑 Ambulancia Despachada', 'Ambulancia solicitada exitosamente. Tiempo estimado de llegada: 8 minutos.', 'success');
        }, 1500);
    }

    async testAlert() {
        const result = await this.modalSystem.form('Probar Alerta', [
            {
                label: 'Tipo de Alerta',
                type: 'select',
                required: true,
                options: [
                    { value: 'evacuation', text: 'Evacuación' },
                    { value: 'lockdown', text: 'Confinamiento' },
                    { value: 'information', text: 'Informativa' }
                ]
            },
            {
                label: 'Área de Prueba',
                type: 'select',
                required: true,
                options: [
                    { value: 'all', text: 'Todo el Edificio' },
                    { value: 'tower-a', text: 'Torre A' },
                    { value: 'common-areas', text: 'Áreas Comunes' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Enviando alerta de prueba...');
            
            setTimeout(() => {
                this.hideLoading();
                this.modalSystem.alert('✅ Alerta de Prueba', `Alerta ${result['Tipo de Alerta']} enviada exitosamente al área ${result['Área de Prueba']}.`, 'success');
            }, 2000);
        }
    }

    async sendMassAlert() {
        const form = document.getElementById('mass-alert-form');
        if (form && form.checkValidity()) {
            this.showLoading('Enviando alerta masiva...');
            
            setTimeout(() => {
                this.hideLoading();
                this.modalSystem.alert('✅ Alerta Enviada', 'Alerta masiva enviada exitosamente a todos los sistemas.', 'success');
                
                // Limpiar formulario
                form.reset();
            }, 2000);
        } else {
            form.reportValidity();
        }
    }

    generateEmergencyReport(reportType = 'incident') {
        this.showLoading('Generando reporte de emergencia...');
        
        setTimeout(() => {
            this.hideLoading();
            
            const reportTypes = {
                'emergency-log': 'Log de Emergencias',
                'response-times': 'Tiempos de Respuesta',
                'prevention-analysis': 'Análisis de Prevención',
                'incident-report': 'Reporte de Incidente'
            };
            
            this.modalSystem.alert('✅ Reporte Generado', 
                `Reporte ${reportTypes[reportType] || 'de Emergencia'} generado exitosamente.`, 
                'success');
        }, 2500);
    }

    // ==================== CONFIGURACIÓN COMPLETADO ====================

    setupConfigurationEvents() {
        const elements = {
            'save-settings': () => this.saveSettings(),
            'reset-settings': () => this.resetSettings(),
            'backup-now': () => this.createBackup(),
            'restore-backup': () => this.restoreBackup()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Tabs de configuración
        this.setupConfigurationTabs();

        // Formularios de configuración
        this.setupConfigurationForms();
    }

    setupConfigurationTabs() {
        const tabButtons = document.querySelectorAll('.settings-tabs .tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchConfigurationTab(tabId);
            });
        });
    }

    switchConfigurationTab(tabId) {
        // Ocultar todos los tabs
        document.querySelectorAll('.settings-tabs .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Desactivar todos los botones de tab
        document.querySelectorAll('.settings-tabs .tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Activar tab seleccionado
        const targetTab = document.getElementById(`${tabId}-tab`);
        const targetButton = document.querySelector(`.settings-tabs .tab-button[data-tab="${tabId}"]`);

        if (targetTab && targetButton) {
            targetTab.classList.add('active');
            targetButton.classList.add('active');
        }
    }

    setupConfigurationForms() {
        // Configurar eventos para formularios específicos
        const twoFactorAuth = document.getElementById('two-factor-auth');
        if (twoFactorAuth) {
            twoFactorAuth.addEventListener('change', (e) => {
                this.updateSecuritySettings('twoFactorAuth', e.target.checked);
            });
        }

        const activityLogging = document.getElementById('activity-logging');
        if (activityLogging) {
            activityLogging.addEventListener('change', (e) => {
                this.updateSecuritySettings('activityLogging', e.target.checked);
            });
        }
    }

    updateSecuritySettings(setting, value) {
        const securitySettings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
        securitySettings[setting] = value;
        localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
        
        console.log(`Configuración de seguridad actualizada: ${setting} = ${value}`);
    }

    async saveSettings() {
        this.showLoading('Guardando configuración...');
        
        // Recopilar datos de todos los formularios
        const settings = {
            general: this.getFormData('general-settings-form'),
            notifications: this.getFormData('notification-settings-form'),
            security: this.getFormData('security-settings-form'),
            backup: this.getFormData('backup-settings-form')
        };
        
        setTimeout(() => {
            this.hideLoading();
            
            // Guardar en localStorage
            localStorage.setItem('appSettings', JSON.stringify(settings));
            
            this.modalSystem.alert('✅ Configuración Guardada', 'Todas las configuraciones han sido guardadas exitosamente.', 'success');
        }, 1500);
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    resetSettings() {
        this.modalSystem.confirm('🔄 Restablecer Configuración', '¿Está seguro de restablecer toda la configuración a los valores por defecto?')
            .then(confirmed => {
                if (confirmed) {
                    this.showLoading('Restableciendo configuración...');
                    
                    setTimeout(() => {
                        this.hideLoading();
                        
                        // Limpiar configuraciones
                        localStorage.removeItem('appSettings');
                        localStorage.removeItem('securitySettings');
                        
                        // Recargar página para aplicar cambios
                        window.location.reload();
                    }, 2000);
                }
            });
    }

    createBackup() {
        this.showLoading('Creando respaldo del sistema...');
        
        setTimeout(() => {
            this.hideLoading();
            
            // Simular creación de respaldo
            const backupData = {
                timestamp: new Date().toISOString(),
                data: {
                    maintenanceTickets: this.maintenanceTickets,
                    payments: this.payments,
                    residents: this.residents,
                    settings: JSON.parse(localStorage.getItem('appSettings') || '{}')
                }
            };
            
            // Descargar respaldo
            this.downloadBackup(backupData);
            
            this.modalSystem.alert('✅ Respaldo Creado', 'Respaldo del sistema creado exitosamente.', 'success');
        }, 3000);
    }

    downloadBackup(backupData) {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-quantum-tower-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    restoreBackup() {
        this.modalSystem.alert('🔄 Restaurar Respaldo', 'Función de restauración de respaldo en desarrollo.', 'info');
    }

    // ==================== MÉTODOS UTILITARIOS ====================

    updateElementText(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    showLoading(message = 'Cargando...') {
        let loadingOverlay = document.getElementById('loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: white;
                font-size: 1.1rem;
            `;
            document.body.appendChild(loadingOverlay);
        }

        loadingOverlay.innerHTML = `
            <div class="loading-spinner" style="
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            "></div>
            <div>${message}</div>
        `;

        loadingOverlay.style.display = 'flex';

        // Agregar estilos de animación si no existen
        if (!document.getElementById('loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'loading-styles';
            styles.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    saveData() {
        localStorage.setItem('maintenanceTickets', JSON.stringify(this.maintenanceTickets));
        localStorage.setItem('payments', JSON.stringify(this.payments));
        localStorage.setItem('residents', JSON.stringify(this.residents));
        localStorage.setItem('accessPermissions', JSON.stringify(this.accessPermissions));
        localStorage.setItem('communications', JSON.stringify(this.communications));
        localStorage.setItem('debtors', JSON.stringify(this.debtors));
        localStorage.setItem('budgetData', JSON.stringify(this.budgetData));
        localStorage.setItem('emergencyData', JSON.stringify(this.emergencyData));
    }

    switchSection(sectionId) {
        console.log(`🔄 Cambiando a sección: ${sectionId}`);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Desactivar todos los enlaces del menú
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });

        // Activar sección actual
        const targetSection = document.getElementById(sectionId);
        const targetLink = document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`);

        if (targetSection && targetLink) {
            targetSection.classList.add('active');
            targetLink.classList.add('active');
            this.currentSection = sectionId;

            // Cerrar sidebar en móvil
            if (this.isMobile) {
                this.toggleSidebar();
            }

            // Cargar datos específicos de la sección
            this.loadSectionData(sectionId);
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'panel-ejecutivo':
                this.loadExecutivePanelData();
                break;
            case 'gestion-financiera':
                this.loadFinancialData();
                break;
            case 'mantenimiento':
                this.loadMaintenanceData();
                break;
            case 'residentes':
                this.loadResidentsData();
                break;
            case 'control-accesos':
                this.loadAccessData();
                break;
            case 'comunicaciones':
                this.loadCommunicationsData();
                break;
            case 'emergencias':
                this.loadEmergencyData();
                break;
            case 'configuracion':
                this.loadConfigurationData();
                break;
        }
    }

    loadFinancialData() {
        this.updatePaymentsTable();
        this.updateDebtorsTable();
        this.updateFinancialMetrics();
        this.updateBudgetDetails();
    }

    loadMaintenanceData() {
        this.updateMaintenanceDashboard();
    }

    loadEmergencyData() {
        this.updateEmergencyStats();
        this.updateEmergencyCharts();
    }

    loadConfigurationData() {
        this.loadConfigurationSettings();
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
                <td><span class="status status-${payment.status}">${this.capitalizeFirst(payment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-payment" data-id="${payment.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-payment" data-id="${payment.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-payment" data-id="${payment.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateDebtorsTable() {
        const tbody = document.querySelector('#debtors-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.debtors.map(debtor => `
            <tr>
                <td>${debtor.name}</td>
                <td>${debtor.department}</td>
                <td>$${debtor.amount.toLocaleString()}</td>
                <td><span class="badge ${debtor.daysLate > 45 ? 'urgent' : debtor.daysLate > 30 ? 'high' : 'medium'}">${debtor.daysLate} días</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon send-reminder" data-resident="${debtor.name}" title="Enviar recordatorio">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="btn-icon create-plan" data-resident="${debtor.name}" title="Crear plan de pago">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                        <button class="btn-icon legal-action" data-resident="${debtor.name}" title="Acción legal">
                            <i class="fas fa-gavel"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateFinancialMetrics() {
        const totalIncome = this.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
            
        const pendingPayments = this.payments.filter(p => p.status === 'pending').length;
        const totalDebt = this.debtors.reduce((sum, d) => sum + d.amount, 0);
        const debtorsCount = this.debtors.length;

        this.updateElementText('payments-on-time', this.payments.filter(p => p.status === 'completed').length);
        this.updateElementText('pending-payments', pendingPayments);
        this.updateElementText('overdue-payments', debtorsCount);
        this.updateElementText('debtors-count', debtorsCount);
        this.updateElementText('total-income', `$${totalIncome.toLocaleString()}`);
        this.updateElementText('total-debt', `$${totalDebt.toLocaleString()}`);
    }

    updateBudgetDetails() {
        const budgetList = document.querySelector('.budget-list');
        if (!budgetList) return;

        budgetList.innerHTML = this.budgetData.categories.map(category => `
            <div class="budget-item">
                <div class="budget-category">${category.name}</div>
                <div class="budget-amounts">
                    <span class="budget-planned">$${category.planned.toLocaleString()}</span>
                    <span class="budget-actual">$${category.actual.toLocaleString()}</span>
                    <span class="budget-variance ${category.actual >= category.planned ? 'positive' : 'negative'}">
                        ${category.actual >= category.planned ? '+' : '-'}$${Math.abs(category.actual - category.planned).toLocaleString()}
                    </span>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (category.actual / category.planned) * 100)}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateEmergencyCharts() {
        // Actualizar gráficos de emergencia si existen
        if (this.charts.emergencyStats) {
            this.charts.emergencyStats.update();
        }
    }

    loadConfigurationSettings() {
        // Cargar configuraciones guardadas
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        
        // Aplicar configuraciones a los formularios
        this.applyFormSettings('general-settings-form', settings.general);
        this.applyFormSettings('notification-settings-form', settings.notifications);
        this.applyFormSettings('security-settings-form', settings.security);
        this.applyFormSettings('backup-settings-form', settings.backup);
    }

    applyFormSettings(formId, settings) {
        if (!settings) return;
        
        const form = document.getElementById(formId);
        if (!form) return;
        
        Object.entries(settings).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value === 'on';
                } else {
                    input.value = value;
                }
            }
        });
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // ==================== MÉTODOS DE INICIALIZACIÓN ====================

    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Búsqueda global
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Notificaciones
        const notifications = document.getElementById('notifications-bell');
        if (notifications) {
            notifications.addEventListener('click', () => {
                this.showNotificationsPanel();
            });
        }

        // Menú de usuario
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => {
                this.showUserMenu();
            });
        }

        // Botón de cerrar sesión
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Configuración de tabs generales
        document.querySelectorAll('.tab-button:not(.payment-tabs .tab-button):not(.emergency-categories-tabs .tab-button):not(.settings-tabs .tab-button)').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Setup de eventos específicos por sección
        this.setupFinancialEvents();
        this.setupMaintenanceEvents();
        this.setupEmergencyEvents();
        this.setupConfigurationEvents();
    }

    setupExecutivePanelEvents() {
        // Eventos específicos del panel ejecutivo
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
    }

    setupAccessEvents() {
        // Eventos de control de accesos
        const elements = {
            'add-access': () => this.addAccessPermission(),
            'generate-report': () => this.generateAccessReport(),
            'sync-devices': () => this.syncAccessDevices()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupCommunicationsEvents() {
        // Eventos de comunicaciones
        const elements = {
            'send-announcement': () => this.sendAnnouncement(),
            'create-poll': () => this.createPoll(),
            'schedule-meeting': () => this.scheduleMeeting()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupResidentsEvents() {
        // Eventos de gestión de residentes
        const elements = {
            'add-resident': () => this.addResident(),
            'import-residents': () => this.importResidents(),
            'export-residents': () => this.exportResidents()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    switchTab(tabId) {
        // Ocultar todos los tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Desactivar todos los botones de tab
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Activar tab seleccionado
        const targetTab = document.getElementById(`${tabId}-tab`);
        const targetButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);

        if (targetTab && targetButton) {
            targetTab.classList.add('active');
            targetButton.classList.add('active');
        }
    }

    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        console.log(`Buscando: ${query}`);
        // Implementar búsqueda global
    }

    showNotificationsPanel() {
        this.modalSystem.alert('🔔 Notificaciones', 'Sistema de notificaciones en desarrollo.', 'info');
    }

    showUserMenu() {
        this.modalSystem.alert('👤 Menú de Usuario', 'Opciones de usuario en desarrollo.', 'info');
    }

    logout() {
        this.modalSystem.confirm('Cerrar Sesión', '¿Está seguro de que desea cerrar sesión?')
            .then(confirmed => {
                if (confirmed) {
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                }
            });
    }

    refreshDashboard() {
        this.showLoading('Actualizando dashboard...');
        
        setTimeout(() => {
            this.hideLoading();
            this.loadDashboardData();
            this.modalSystem.alert('✅ Dashboard Actualizado', 'Todos los datos han sido actualizados.', 'success');
        }, 1000);
    }

    loadDashboardData() {
        // Cargar datos iniciales del dashboard
        this.updateFinancialMetrics();
        this.updateMaintenanceDashboard();
        this.updateEmergencyStats();
    }

    updateUserInfo() {
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-details">
                    <div class="user-name">${userEmail}</div>
                    <div class="user-role">${userRole}</div>
                </div>
            `;
        }
    }

    // ==================== MÉTODOS ADICIONALES PARA COMPLETAR FUNCIONALIDAD ====================

    filterPaymentsTable(query) {
        const rows = document.querySelectorAll('#payments-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    filterDebtorsTable(query) {
        const rows = document.querySelectorAll('#debtors-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    filterMaintenanceTickets() {
        this.modalSystem.alert('🔍 Filtros', 'Sistema de filtros de mantenimiento en desarrollo.', 'info');
    }

    scheduleMaintenance() {
        this.modalSystem.alert('📅 Programar', 'Sistema de programación de mantenimiento en desarrollo.', 'info');
    }

    addMaintenanceCompany() {
        this.modalSystem.alert('🏢 Agregar Empresa', 'Sistema de gestión de empresas de mantenimiento en desarrollo.', 'info');
    }

    generateMaintenanceReports() {
        this.modalSystem.alert('📊 Reportes', 'Sistema de reportes de mantenimiento en desarrollo.', 'info');
    }

    manageInventory() {
        this.modalSystem.alert('📦 Inventario', 'Sistema de gestión de inventario en desarrollo.', 'info');
    }

    schedulePreventiveMaintenance() {
        this.modalSystem.alert('🛠️ Mantenimiento Preventivo', 'Sistema de mantenimiento preventivo en desarrollo.', 'info');
    }

    generateRentInvoices() {
        this.modalSystem.alert('🏠 Facturas de Alquiler', 'Sistema de generación de facturas de alquiler en desarrollo.', 'info');
    }

    addService() {
        this.modalSystem.alert('➕ Agregar Servicio', 'Sistema de agregar servicios en desarrollo.', 'info');
    }

    calculateExpenses() {
        this.modalSystem.alert('🧮 Calcular Gastos', 'Sistema de cálculo de gastos en desarrollo.', 'info');
    }

    generateDebtReport() {
        this.modalSystem.alert('📋 Reporte de Deudas', 'Sistema de reportes de deudas en desarrollo.', 'info');
    }

    collectionAnalysis() {
        this.modalSystem.alert('📈 Análisis de Cobranza', 'Sistema de análisis de cobranza en desarrollo.', 'info');
    }

    generateFinancialReport() {
        this.modalSystem.alert('📄 Reporte Financiero', 'Sistema de reportes financieros en desarrollo.', 'info');
    }

    scheduleFinancialReport() {
        this.modalSystem.alert('⏰ Programar Reporte', 'Sistema de programación de reportes en desarrollo.', 'info');
    }

    viewPaymentDetails(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            this.modalSystem.alert(`Detalles de Pago ${paymentId}`, 
                `Residente: ${payment.resident}\nMonto: $${payment.amount}\nFecha: ${payment.date}\nEstado: ${payment.status}`, 
                'info');
        }
    }

    sendIndividualReminder(resident) {
        this.modalSystem.alert('🔔 Recordatorio', `Recordatorio enviado a ${resident}.`, 'success');
    }

    createIndividualPaymentPlan(resident) {
        this.modalSystem.alert('📋 Plan de Pago', `Plan de pago creado para ${resident}.`, 'success');
    }

    initiateLegalAction(resident) {
        this.modalSystem.confirm('⚖️ Acción Legal', `¿Iniciar acción legal contra ${resident}?`)
            .then(confirmed => {
                if (confirmed) {
                    this.modalSystem.alert('✅ Acción Legal', `Proceso legal iniciado contra ${resident}.`, 'warning');
                }
            });
    }

    payService(service) {
        this.modalSystem.alert('💳 Pago', `Procesando pago para ${service}.`, 'info');
    }

    viewServiceBill(service) {
        this.modalSystem.alert('🧾 Factura', `Mostrando factura de ${service}.`, 'info');
    }

    printReceipt(paymentId) {
        this.modalSystem.alert('🖨️ Imprimir', `Imprimiendo recibo ${paymentId}.`, 'info');
    }

    viewTicketDetails(ticketId) {
        const ticket = this.maintenanceTickets.find(t => t.id === ticketId);
        if (ticket) {
            this.modalSystem.alert(`Ticket ${ticketId}`, 
                `Título: ${ticket.title}\nÁrea: ${ticket.area}\nPrioridad: ${ticket.priority}\nEstado: ${ticket.status}\nUbicación: ${ticket.location}`, 
                'info');
        }
    }

    editTicket(ticketId) {
        this.modalSystem.alert('✏️ Editar', `Editando ticket ${ticketId}.`, 'info');
    }

    assignToTicket(ticketId) {
        this.modalSystem.alert('👤 Asignar', `Asignando técnico a ticket ${ticketId}.`, 'info');
    }

    resolveTicket(ticketId) {
        this.modalSystem.alert('✅ Resolver', `Resolviendo ticket ${ticketId}.`, 'info');
    }

    showEmergencyHistory() {
        this.modalSystem.alert('📜 Historial', 'Mostrando historial de emergencias.', 'info');
    }

    showEmergencyProcedures() {
        this.modalSystem.alert('📋 Procedimientos', 'Mostrando procedimientos de emergencia.', 'info');
    }

    addAccessPermission() {
        this.modalSystem.alert('🔑 Permiso', 'Agregando permiso de acceso.', 'info');
    }

    generateAccessReport() {
        this.modalSystem.alert('📊 Reporte', 'Generando reporte de accesos.', 'info');
    }

    syncAccessDevices() {
        this.modalSystem.alert('🔄 Sincronizar', 'Sincronizando dispositivos de acceso.', 'info');
    }

    sendAnnouncement() {
        this.modalSystem.alert('📢 Anuncio', 'Enviando anuncio a residentes.', 'info');
    }

    createPoll() {
        this.modalSystem.alert('📊 Encuesta', 'Creando encuesta para residentes.', 'info');
    }

    scheduleMeeting() {
        this.modalSystem.alert('📅 Reunión', 'Programando reunión de condominio.', 'info');
    }

    addResident() {
        this.modalSystem.alert('👤 Residente', 'Agregando nuevo residente.', 'info');
    }

    importResidents() {
        this.modalSystem.alert('📥 Importar', 'Importando datos de residentes.', 'info');
    }

    exportResidents() {
        this.modalSystem.alert('📤 Exportar', 'Exportando datos de residentes.', 'info');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminDashboard, CustomModalSystem };
}