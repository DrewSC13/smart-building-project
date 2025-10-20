// dashboard-residente.js
// Sistema de Dashboard para Residente - JavaScript Completo

class DashboardResidente {
    constructor() {
        this.currentSection = 'inicio';
        this.currentCurrency = 'BOB';
        this.exchangeRate = 6.96;
        this.userData = {
            name: 'Juan Pérez',
            apartment: '5A - Torre 1',
            email: 'juan.perez@email.com',
            phone: '+591 1234-5678'
        };
        
        this.reservations = [];
        this.payments = [];
        this.maintenanceRequests = [];
        this.consumptionData = {};
        this.communityData = {};
        this.selectedArea = null;
        this.selectedTimeSlot = null;
        this.selectedPaymentMethod = 'credit-card';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.loadInitialData();
        this.initializeCharts();
        this.setupServiceWorker();
        this.setupRealTimeUpdates();
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

        // Botón de logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        document.getElementById('user-menu-logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Notificaciones
        document.querySelector('.notification-icon').addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Menú de usuario
        document.querySelector('.user-avatar').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserMenu();
        });

        // Cerrar menús al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-icon')) {
                this.hideNotifications();
            }
            if (!e.target.closest('.user-avatar')) {
                this.hideUserMenu();
            }
        });

        // Asistente IA
        document.querySelector('.ai-assistant').addEventListener('click', () => {
            this.toggleAIAssistant();
        });

        // Modal de reserva rápida
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Tecla Escape para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Input del asistente IA
        document.getElementById('ai-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });

        // Selector de moneda
        document.getElementById('currency-select').addEventListener('change', (e) => {
            this.changeCurrency(e.target.value);
        });

        // Filtros de pagos
        document.getElementById('payment-status-filter').addEventListener('change', () => {
            this.filterPayments();
        });

        document.getElementById('payment-category-filter').addEventListener('change', () => {
            this.filterPayments();
        });

        document.getElementById('payment-date-filter').addEventListener('change', () => {
            this.filterPayments();
        });

        document.getElementById('search-payments').addEventListener('input', () => {
            this.searchPayments();
        });

        // Filtros de reservas
        document.getElementById('reservation-status-filter').addEventListener('change', () => {
            this.filterReservations();
        });

        document.getElementById('reservation-area-filter').addEventListener('change', () => {
            this.filterReservations();
        });

        document.getElementById('reservation-date-filter').addEventListener('change', () => {
            this.filterReservations();
        });

        document.getElementById('search-reservations').addEventListener('input', () => {
            this.searchReservations();
        });

        // Selector de áreas comunes
        document.querySelectorAll('.area-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectArea(card);
            });
        });

        // Slots de tiempo
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot-cell') && e.target.classList.contains('available')) {
                this.selectTimeSlot(e.target);
            }
        });

        // Botones de emergencia
        document.querySelectorAll('.btn-danger, .btn-warning, .btn-info').forEach(btn => {
            if (btn.closest('.emergency-actions')) {
                btn.addEventListener('click', (e) => {
                    const type = e.target.closest('button').getAttribute('onclick').match(/'([^']+)'/)[1];
                    this.triggerEmergency(type);
                });
            }
        });

        // Configuración - Selector de tema
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                this.changeTheme(option.dataset.theme);
            });
        });

        // Configuración - Guardar cambios
        document.querySelector('button[onclick="saveSettings()"]').addEventListener('click', () => {
            this.saveSettings();
        });

        // Period selector en consumo
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectPeriod(btn);
            });
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Métodos de pago
        document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectPaymentMethod(e.target.value);
            });
        });

        // Criptomonedas
        document.querySelectorAll('input[name="crypto-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectCryptoMethod(e.target.value);
            });
        });

        // Copiar dirección crypto
        document.querySelector('.btn-copy')?.addEventListener('click', () => {
            this.copyCryptoAddress();
        });

        // Procesar pago
        document.getElementById('process-payment-btn')?.addEventListener('click', () => {
            this.processAreaPayment();
        });

        // Selector de área para pago
        document.querySelectorAll('.pricing-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const area = e.target.closest('.pricing-card').querySelector('h4').textContent;
                const priceText = e.target.closest('.pricing-card').querySelector('.price').textContent;
                const price = this.extractPrice(priceText);
                this.selectAreaForPayment(area, price);
            });
        });
    }

    loadUserData() {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
            this.userData = { ...this.userData, ...JSON.parse(savedUserData) };
        }

        // Actualizar UI con datos del usuario
        document.getElementById('resident-name').textContent = this.userData.name;
        document.getElementById('sidebar-resident-name').textContent = this.userData.name;
        document.getElementById('apartment-info').textContent = this.userData.apartment;
        document.getElementById('sidebar-apartment-info').textContent = this.userData.apartment;
        
        // Actualizar formulario de configuración
        document.getElementById('profile-name').value = this.userData.name;
        document.getElementById('profile-email').value = this.userData.email;
        document.getElementById('profile-phone').value = this.userData.phone;
        document.getElementById('profile-apartment').value = this.userData.apartment;
    }

    loadInitialData() {
        this.loadPayments();
        this.loadReservations();
        this.loadMaintenanceRequests();
        this.loadCommunityFeed();
        this.loadConsumptionData();
        this.loadCommonAreas();
        this.loadEmergencyContacts();
        this.loadCommonAreasPayments();
    }

    switchSection(sectionId) {
        // Ocultar sección actual
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar nueva sección
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            // Actualizar menú activo
            document.querySelectorAll('.sidebar-menu a').forEach(link => {
                link.classList.remove('active');
            });
            const activeLink = document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Scroll to top
            window.scrollTo(0, 0);

            // Cerrar menú móvil si está abierto
            this.hideMobileMenu();

            // Cargar datos específicos de la sección
            this.loadSectionData(sectionId);
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'finanzas':
                this.loadFinancialData();
                break;
            case 'reservas':
                this.loadReservationsCalendar();
                break;
            case 'areas-comunes':
                this.loadCommonAreasAvailability();
                break;
            case 'mantenimiento':
                this.loadMaintenanceSchedule();
                break;
            case 'consumo':
                this.loadConsumptionCharts();
                break;
            case 'comunidad':
                this.loadCommunityData();
                break;
            case 'configuracion':
                this.loadSettings();
                break;
        }
    }

    // ===== SISTEMA DE PAGOS =====
    loadPayments() {
        this.payments = [
            {
                id: 1,
                description: 'Mantenimiento Mensual',
                category: 'maintenance',
                amount: 250.00,
                dueDate: '2024-02-05',
                status: 'pending',
                currency: 'BOB'
            },
            {
                id: 2,
                description: 'Servicio de Agua',
                category: 'utilities',
                amount: 85.50,
                dueDate: '2024-02-10',
                status: 'pending',
                currency: 'BOB'
            },
            {
                id: 3,
                description: 'Alquiler Enero',
                category: 'rent',
                amount: 1200.00,
                dueDate: '2024-01-01',
                status: 'paid',
                paidDate: '2024-01-01',
                method: 'Transferencia',
                reference: 'TRF-001234',
                currency: 'BOB'
            },
            {
                id: 4,
                description: 'Expensas Extraordinarias',
                category: 'expenses',
                amount: 150.00,
                dueDate: '2024-03-01',
                status: 'upcoming',
                currency: 'BOB'
            },
            {
                id: 5,
                description: 'Servicio de Gas',
                category: 'utilities',
                amount: 45.75,
                dueDate: '2024-02-08',
                status: 'pending',
                currency: 'BOB'
            }
        ];

        this.renderPayments(this.payments);
        this.renderPaymentHistory();
        this.updateFinancialOverview();
    }

    renderPayments(payments) {
        const container = document.getElementById('payments-table-body');
        if (!container) return;

        container.innerHTML = payments.map(payment => `
            <div class="table-row" data-payment-id="${payment.id}" data-status="${payment.status}" data-category="${payment.category}">
                <div class="table-cell">${this.formatDate(payment.dueDate)}</div>
                <div class="table-cell">${payment.description}</div>
                <div class="table-cell">
                    <span class="payment-category ${payment.category}">
                        ${this.getCategoryLabel(payment.category)}
                    </span>
                </div>
                <div class="table-cell">
                    <span class="amount">${this.formatCurrency(payment.amount)}</span>
                </div>
                <div class="table-cell">
                    <span class="status-badge ${payment.status}">
                        ${this.getStatusLabel(payment.status)}
                    </span>
                </div>
                <div class="table-cell">
                    ${payment.status === 'pending' ? 
                        `<button class="btn btn-primary btn-sm" onclick="dashboard.processPayment(${payment.id})">
                            Pagar
                        </button>` : 
                        payment.status === 'paid' ?
                        `<span class="text-success"><i class="fas fa-check"></i> Pagado</span>` :
                        `<button class="btn btn-outline btn-sm" disabled>Próximo</button>`
                    }
                </div>
            </div>
        `).join('');
    }

    renderPaymentHistory() {
        const history = this.payments.filter(p => p.status === 'paid');
        const container = document.getElementById('payment-history-body');
        if (!container) return;

        container.innerHTML = history.map(payment => `
            <div class="table-row">
                <div class="table-cell">${this.formatDate(payment.paidDate)}</div>
                <div class="table-cell">${payment.description}</div>
                <div class="table-cell">${payment.method}</div>
                <div class="table-cell">${this.formatCurrency(payment.amount)}</div>
                <div class="table-cell">${payment.reference}</div>
                <div class="table-cell">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.downloadReceipt(${payment.id})">
                        <i class="fas fa-receipt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateFinancialOverview() {
        const pendingPayments = this.payments.filter(p => p.status === 'pending');
        const paidPayments = this.payments.filter(p => p.status === 'paid');
        const upcomingPayments = this.payments.filter(p => p.status === 'upcoming');
        
        const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Actualizar tarjetas de resumen
        const totalPendingEl = document.getElementById('total-pending');
        const totalPaidEl = document.getElementById('total-paid');
        const totalUpcomingEl = document.getElementById('total-upcoming');
        const totalSavingsEl = document.getElementById('total-savings');
        
        if (totalPendingEl) totalPendingEl.textContent = this.formatCurrency(totalPending);
        if (totalPaidEl) totalPaidEl.textContent = this.formatCurrency(totalPaid);
        if (totalUpcomingEl) totalUpcomingEl.textContent = this.formatCurrency(totalUpcoming);
        
        // Calcular ahorro (simulado)
        const savings = totalPaid * 0.1; // 10% de ahorro simulado
        if (totalSavingsEl) totalSavingsEl.textContent = this.formatCurrency(savings);
        
        // Actualizar contadores en la sección inicio
        this.updatePaymentCounters();
    }

    processPayment(paymentId) {
        this.showLoading('Procesando pago...');
        
        setTimeout(() => {
            const payment = this.payments.find(p => p.id === paymentId);
            if (payment) {
                payment.status = 'paid';
                payment.paidDate = new Date().toISOString().split('T')[0];
                payment.method = 'Tarjeta de Crédito';
                payment.reference = `CARD-${Date.now()}`;
                
                this.renderPayments(this.payments);
                this.renderPaymentHistory();
                this.updateFinancialOverview();
                
                this.hideLoading();
                this.showNotification('Pago procesado exitosamente', 'success');
            }
        }, 2000);
    }

    downloadReceipt(paymentId) {
        this.showNotification('Descargando recibo...', 'info');
        // Simular descarga
        setTimeout(() => {
            this.showNotification('Recibo descargado exitosamente', 'success');
        }, 1000);
    }

    filterPayments() {
        const statusFilter = document.getElementById('payment-status-filter').value;
        const categoryFilter = document.getElementById('payment-category-filter').value;
        const dateFilter = document.getElementById('payment-date-filter').value;
        const searchTerm = document.getElementById('search-payments').value.toLowerCase();

        let filtered = this.payments;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        if (dateFilter !== 'all') {
            const today = new Date();
            filtered = filtered.filter(p => {
                const dueDate = new Date(p.dueDate);
                switch (dateFilter) {
                    case 'this-month':
                        return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
                    case 'next-month':
                        return dueDate.getMonth() === today.getMonth() + 1 && dueDate.getFullYear() === today.getFullYear();
                    case 'overdue':
                        return dueDate < today && p.status === 'pending';
                    default:
                        return true;
                }
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.description.toLowerCase().includes(searchTerm) ||
                this.getCategoryLabel(p.category).toLowerCase().includes(searchTerm)
            );
        }

        this.renderPayments(filtered);
    }

    searchPayments() {
        this.filterPayments();
    }

    changeCurrency(currency) {
        this.currentCurrency = currency;
        this.renderPayments(this.payments);
        this.renderPaymentHistory();
        this.updateFinancialOverview();
        this.showNotification(`Moneda cambiada a ${currency}`, 'info');
    }

    // ===== SISTEMA DE RESERVAS =====
    loadReservations() {
        this.reservations = [
            {
                id: 1,
                area: 'Sala de Eventos',
                areaId: 'sala-eventos',
                date: '2024-01-20',
                time: '15:00',
                duration: 3,
                status: 'confirmed',
                notes: 'Celebración de cumpleaños',
                createdAt: '2024-01-10',
                amount: 150.00,
                paymentStatus: 'paid'
            },
            {
                id: 2,
                area: 'Gimnasio',
                areaId: 'gimnasio',
                date: '2024-01-18',
                time: '19:00',
                duration: 1,
                status: 'pending',
                notes: 'Entrenamiento personal',
                createdAt: '2024-01-15',
                amount: 0,
                paymentStatus: 'free'
            },
            {
                id: 3,
                area: 'Piscina',
                areaId: 'piscina',
                date: '2024-01-25',
                time: '11:00',
                duration: 2,
                status: 'confirmed',
                notes: 'Actividad familiar',
                createdAt: '2024-01-12',
                amount: 20.00,
                paymentStatus: 'paid'
            },
            {
                id: 4,
                area: 'Terraza',
                areaId: 'terraza',
                date: '2024-02-01',
                time: '16:00',
                duration: 2,
                status: 'pending',
                notes: 'Reunión de trabajo',
                createdAt: '2024-01-20',
                amount: 60.00,
                paymentStatus: 'pending'
            }
        ];

        this.renderReservations(this.reservations, 'inicio-reservations-grid');
        this.renderReservations(this.reservations, 'reservations-grid');
        this.renderActiveReservations();
    }

    renderReservations(reservations, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = reservations.map(reservation => `
            <div class="reservation-card" data-reservation-id="${reservation.id}" data-area="${reservation.areaId}" data-status="${reservation.status}">
                <div class="reservation-header">
                    <div>
                        <div class="reservation-title">${reservation.area}</div>
                        <div class="reservation-date">${this.formatDate(reservation.date)} a las ${reservation.time}</div>
                    </div>
                    <span class="reservation-status status-${reservation.status}">
                        ${this.getReservationStatusLabel(reservation.status)}
                    </span>
                </div>
                <div class="reservation-details">
                    <div class="reservation-detail">
                        <i class="fas fa-clock"></i>
                        <span>Duración: ${reservation.duration} hora${reservation.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div class="reservation-detail">
                        <i class="fas fa-sticky-note"></i>
                        <span>${reservation.notes}</span>
                    </div>
                    ${reservation.amount > 0 ? `
                    <div class="reservation-detail">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Monto: ${this.formatCurrency(reservation.amount)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="reservation-actions">
                    ${reservation.status === 'pending' ? 
                        `<button class="btn btn-outline btn-sm" onclick="dashboard.cancelReservation(${reservation.id})">
                            Cancelar
                        </button>` : 
                        `<button class="btn btn-outline btn-sm" onclick="dashboard.viewReservationDetails(${reservation.id})">
                            Detalles
                        </button>`
                    }
                    ${reservation.paymentStatus === 'pending' ? 
                        `<button class="btn btn-primary btn-sm" onclick="dashboard.payReservation(${reservation.id})">
                            Pagar
                        </button>` :
                        `<button class="btn btn-primary btn-sm" onclick="dashboard.modifyReservation(${reservation.id})">
                            Modificar
                        </button>`
                    }
                </div>
            </div>
        `).join('');
    }

    renderActiveReservations() {
        const container = document.getElementById('active-reservations');
        if (!container) return;

        const activeReservations = this.reservations.filter(r => r.status === 'confirmed');
        
        container.innerHTML = activeReservations.map(reservation => `
            <div class="active-reservation-card">
                <div class="reservation-card-header">
                    <div>
                        <div class="reservation-card-title">${reservation.area}</div>
                        <div class="reservation-card-date">${this.formatDate(reservation.date)} ${reservation.time}</div>
                    </div>
                    <span class="reservation-card-status status-confirmed">
                        ${this.getReservationStatusLabel(reservation.status)}
                    </span>
                </div>
                <div class="reservation-card-details">
                    <div class="reservation-card-detail">
                        <i class="fas fa-clock"></i>
                        <span>${reservation.duration} hora${reservation.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div class="reservation-card-detail">
                        <i class="fas fa-users"></i>
                        <span>Máx. ${this.getAreaCapacity(reservation.areaId)} personas</span>
                    </div>
                    ${reservation.amount > 0 ? `
                    <div class="reservation-card-detail">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>${this.formatCurrency(reservation.amount)}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="reservation-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.generateQRCode(${reservation.id})">
                        <i class="fas fa-qrcode"></i> QR
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.cancelReservation(${reservation.id})">
                        Cancelar
                    </button>
                </div>
            </div>
        `).join('');
    }

    getAreaCapacity(areaId) {
        const capacities = {
            'sala-eventos': 50,
            'gimnasio': 20,
            'piscina': 15,
            'terraza': 25,
            'parqueo': 10,
            'sala-juegos': 12
        };
        return capacities[areaId] || 10;
    }

    loadReservationsCalendar() {
        this.generateCalendar(new Date().getFullYear(), new Date().getMonth());
    }

    generateCalendar(year, month) {
        const calendar = document.getElementById('reservation-calendar');
        if (!calendar) return;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Encabezados de días
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        let calendarHTML = '';

        // Añadir encabezados
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });

        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += `<div class="calendar-day other-month"></div>`;
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const hasReservation = this.hasReservationOnDate(date);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${date.toISOString().split('T')[0]}">
                    <div class="day-number">${day}</div>
                    ${hasReservation ? `<div class="calendar-event">Reserva</div>` : ''}
                </div>
            `;
        }

        calendar.innerHTML = calendarHTML;
        
        const currentMonthEl = document.getElementById('current-month');
        if (currentMonthEl) {
            currentMonthEl.textContent = `${this.getMonthName(month)} ${year}`;
        }

        // Agregar event listeners a los días
        calendar.querySelectorAll('.calendar-day:not(.header):not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                this.selectCalendarDate(day.dataset.date);
            });
        });
    }

    hasReservationOnDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.reservations.some(reservation => reservation.date === dateString);
    }

    selectCalendarDate(date) {
        this.showNotification(`Fecha seleccionada: ${this.formatDate(date)}`, 'info');
        // Aquí podrías mostrar reservas para esa fecha o abrir modal de nueva reserva
    }

    filterReservations() {
        const statusFilter = document.getElementById('reservation-status-filter').value;
        const areaFilter = document.getElementById('reservation-area-filter').value;
        const dateFilter = document.getElementById('reservation-date-filter').value;
        const searchTerm = document.getElementById('search-reservations').value.toLowerCase();

        let filtered = this.reservations;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        if (areaFilter !== 'all') {
            filtered = filtered.filter(r => r.areaId === areaFilter);
        }

        if (dateFilter !== 'all') {
            const today = new Date();
            filtered = filtered.filter(r => {
                const reservationDate = new Date(r.date);
                switch (dateFilter) {
                    case 'this-week':
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        return reservationDate >= startOfWeek && reservationDate <= endOfWeek;
                    case 'this-month':
                        return reservationDate.getMonth() === today.getMonth() && reservationDate.getFullYear() === today.getFullYear();
                    case 'next-month':
                        return reservationDate.getMonth() === today.getMonth() + 1 && reservationDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(r => 
                r.area.toLowerCase().includes(searchTerm) ||
                r.notes.toLowerCase().includes(searchTerm)
            );
        }

        this.renderReservations(filtered, 'reservations-grid');
    }

    searchReservations() {
        this.filterReservations();
    }

    cancelReservation(reservationId) {
        if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
            const reservation = this.reservations.find(r => r.id === reservationId);
            if (reservation) {
                reservation.status = 'cancelled';
                this.renderReservations(this.reservations, 'inicio-reservations-grid');
                this.renderReservations(this.reservations, 'reservations-grid');
                this.renderActiveReservations();
                this.showNotification('Reserva cancelada exitosamente', 'success');
            }
        }
    }

    viewReservationDetails(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            this.showNotification(`Detalles de reserva: ${reservation.area} - ${this.formatDate(reservation.date)} ${reservation.time}`, 'info');
        }
    }

    modifyReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            // Llenar el formulario de reserva con los datos existentes
            document.getElementById('reserve-area').value = reservation.areaId;
            document.getElementById('reserve-date').value = reservation.date;
            document.getElementById('reserve-time').value = reservation.time;
            document.getElementById('reserve-duration').value = reservation.duration;
            document.getElementById('reserve-notes').value = reservation.notes;
            
            this.openQuickReserve();
            this.showNotification('Modificando reserva existente', 'info');
        }
    }

    payReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            this.selectedArea = {
                name: reservation.area,
                date: reservation.date,
                time: reservation.time,
                duration: reservation.duration,
                amount: reservation.amount
            };
            this.openPaymentModal();
        }
    }

    // ===== SISTEMA DE ÁREAS COMUNES =====
    loadCommonAreas() {
        this.setupAreaSelection();
        this.generateTimeSlots();
        this.loadCommonAreasPayments();
    }

    setupAreaSelection() {
        document.querySelectorAll('.area-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.area-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedArea = {
                    id: card.dataset.area,
                    name: card.querySelector('h4').textContent,
                    status: card.querySelector('.area-status').textContent
                };
                this.showNotification(`Área seleccionada: ${this.selectedArea.name}`, 'info');
            });
        });
    }

    generateTimeSlots() {
        const grid = document.getElementById('time-slots-grid');
        if (!grid) return;

        let gridHTML = '';
        const timeSlots = this.generateTimeSlotsArray();
        const days = this.generateWeekDays();

        // Encabezado de días
        gridHTML += `<div class="time-slots-header">`;
        gridHTML += `<div class="time-label">Hora</div>`;
        days.forEach(day => {
            gridHTML += `<div class="day-label">
                <div class="day-name">${day.name}</div>
                <div class="day-date">${day.date}</div>
            </div>`;
        });
        gridHTML += `</div>`;

        // Slots de tiempo
        timeSlots.forEach(slot => {
            gridHTML += `
                <div class="time-slot-row">
                    <div class="time-slot-cell time-label">${slot.time}</div>
                    ${Array.from({length: 7}, (_, i) => {
                        const isAvailable = Math.random() > 0.3; // Simular disponibilidad
                        const isSelected = false;
                        return `
                            <div class="time-slot-cell ${isAvailable ? 'available' : 'booked'} ${isSelected ? 'selected' : ''}" 
                                 data-time="${slot.time}" 
                                 data-day="${i}"
                                 data-date="${days[i].fullDate}">
                                <div class="slot-time">${slot.time.split(' - ')[0]}</div>
                                <div class="slot-status">${isAvailable ? 'Disponible' : 'Ocupado'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        });

        grid.innerHTML = gridHTML;
    }

    generateTimeSlotsArray() {
        const slots = [];
        for (let hour = 8; hour <= 20; hour++) {
            slots.push({
                time: `${hour}:00 - ${hour + 1}:00`,
                hour: hour
            });
        }
        return slots;
    }

    generateWeekDays() {
        const days = [];
        const today = new Date();
        const currentDay = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - currentDay + 1); // Empezar el lunes

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            days.push({
                name: this.getDayName(date.getDay()),
                date: date.getDate(),
                month: date.getMonth() + 1,
                fullDate: date.toISOString().split('T')[0]
            });
        }

        // Actualizar el texto de la semana actual
        const currentWeekEl = document.getElementById('current-week');
        if (currentWeekEl) {
            const start = days[0];
            const end = days[6];
            currentWeekEl.textContent = `Semana ${start.date}-${end.date} ${this.getMonthName(start.month - 1)} ${startDate.getFullYear()}`;
        }

        return days;
    }

    getDayName(dayIndex) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return days[dayIndex];
    }

    selectTimeSlot(cell) {
        if (!this.selectedArea) {
            this.showNotification('Por favor selecciona un área primero', 'warning');
            return;
        }

        // Deseleccionar slots previamente seleccionados
        document.querySelectorAll('.time-slot-cell.selected').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Seleccionar nuevo slot
        cell.classList.add('selected');
        
        this.selectedTimeSlot = {
            time: cell.dataset.time,
            day: parseInt(cell.dataset.day),
            date: cell.dataset.date
        };

        const areaName = this.selectedArea.name;
        const time = this.selectedTimeSlot.time;
        const date = this.formatDate(this.selectedTimeSlot.date);
        
        this.showNotification(`Slot seleccionado: ${areaName} - ${date} ${time}`, 'info');
    }

    loadCommonAreasAvailability() {
        this.updateAreasAvailability();
        this.updateCommonAreasStats();
    }

    updateAreasAvailability() {
        // Simular actualización de disponibilidad
        document.querySelectorAll('.area-status').forEach(status => {
            const random = Math.random();
            if (random > 0.7) {
                status.textContent = 'Disponible';
                status.className = 'area-status available';
            } else if (random > 0.4) {
                status.textContent = 'Capacidad limitada';
                status.className = 'area-status limited';
            } else {
                status.textContent = 'No disponible';
                status.className = 'area-status unavailable';
            }
        });
    }

    updateCommonAreasStats() {
        const paidReservations = this.reservations.filter(r => r.paymentStatus === 'paid');
        const pendingPayments = this.reservations.filter(r => r.paymentStatus === 'pending');
        const totalPayments = paidReservations.length + pendingPayments.length;
        
        const totalPaid = paidReservations.reduce((sum, r) => sum + r.amount, 0);
        const totalPending = pendingPayments.reduce((sum, r) => sum + r.amount, 0);

        // Actualizar estadísticas
        const totalReservationsPaidEl = document.getElementById('total-reservations-paid');
        const pendingPaymentsEl = document.getElementById('pending-payments');
        const totalPaymentsEl = document.getElementById('total-payments');

        if (totalReservationsPaidEl) {
            totalReservationsPaidEl.textContent = paidReservations.length;
            totalReservationsPaidEl.nextElementSibling.nextElementSibling.textContent = this.formatCurrency(totalPaid);
        }
        if (pendingPaymentsEl) {
            pendingPaymentsEl.textContent = pendingPayments.length;
            pendingPaymentsEl.nextElementSibling.nextElementSibling.textContent = this.formatCurrency(totalPending);
        }
        if (totalPaymentsEl) {
            totalPaymentsEl.textContent = totalPayments;
            totalPaymentsEl.nextElementSibling.nextElementSibling.textContent = this.formatCurrency(totalPaid + totalPending);
        }
    }

    // ===== SISTEMA DE PAGOS PARA ÁREAS COMUNES =====
    loadCommonAreasPayments() {
        const container = document.getElementById('common-areas-payments-body');
        if (!container) return;

        const areaPayments = this.reservations.filter(r => r.amount > 0).map(reservation => ({
            id: reservation.id,
            date: reservation.createdAt,
            area: reservation.area,
            description: `Reserva ${reservation.area} - ${reservation.date} ${reservation.time}`,
            amount: reservation.amount,
            status: reservation.paymentStatus,
            reference: `RES-${reservation.id}`
        }));

        container.innerHTML = areaPayments.map(payment => `
            <div class="table-row">
                <div class="table-cell">${this.formatDate(payment.date)}</div>
                <div class="table-cell">${payment.area}</div>
                <div class="table-cell">${payment.description}</div>
                <div class="table-cell">${this.formatCurrency(payment.amount)}</div>
                <div class="table-cell">
                    <span class="status-badge ${payment.status}">
                        ${payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                </div>
                <div class="table-cell">
                    ${payment.status === 'pending' ? 
                        `<button class="btn btn-primary btn-sm" onclick="dashboard.payReservation(${payment.id})">
                            Pagar
                        </button>` :
                        `<button class="btn btn-outline btn-sm" onclick="dashboard.downloadReceipt(${payment.id})">
                            Recibo
                        </button>`
                    }
                </div>
            </div>
        `).join('');
    }

    selectAreaForPayment(areaName, price) {
        this.selectedArea = {
            name: areaName,
            amount: price
        };
        this.openPaymentModal();
    }

    openPaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (!modal || !this.selectedArea) return;

        // Actualizar información del pago
        const paymentArea = document.getElementById('payment-area');
        const paymentDate = document.getElementById('payment-date');
        const paymentTime = document.getElementById('payment-time');
        const paymentDuration = document.getElementById('payment-duration');
        const paymentTotal = document.getElementById('payment-total');
        const processPaymentBtn = document.getElementById('process-payment-btn');

        if (paymentArea) paymentArea.textContent = this.selectedArea.name;
        if (paymentDate) paymentDate.textContent = this.selectedArea.date ? this.formatDate(this.selectedArea.date) : 'Por definir';
        if (paymentTime) paymentTime.textContent = this.selectedArea.time || 'Por definir';
        if (paymentDuration) paymentDuration.textContent = this.selectedArea.duration ? `${this.selectedArea.duration} horas` : 'Por definir';
        if (paymentTotal) paymentTotal.textContent = this.formatCurrency(this.selectedArea.amount);
        if (processPaymentBtn) processPaymentBtn.textContent = `Pagar ${this.formatCurrency(this.selectedArea.amount)}`;

        // Generar referencia para transferencia
        const transferReference = document.getElementById('transfer-reference');
        if (transferReference) {
            transferReference.textContent = `RES-${Date.now()}`;
        }

        // Actualizar dirección crypto
        this.updateCryptoAddress();

        modal.classList.add('show');
    }

    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.remove('show');
            this.selectedArea = null;
            this.selectedTimeSlot = null;
        }
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        // Ocultar todos los formularios
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });

        // Mostrar formulario seleccionado
        const selectedForm = document.getElementById(`${method}-form`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }
    }

    selectCryptoMethod(crypto) {
        this.updateCryptoAddress(crypto);
    }

    updateCryptoAddress(crypto = 'bitcoin') {
        const cryptoAddress = document.getElementById('crypto-address');
        const cryptoAmount = document.getElementById('crypto-amount');
        
        if (!cryptoAddress || !cryptoAmount || !this.selectedArea) return;

        const addresses = {
            bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            ethereum: '0x742d35Cc6634C0532925a3b8D4C9db6f7f8a5c5d'
        };

        const rates = {
            bitcoin: 40000, // USD por BTC
            ethereum: 2500   // USD por ETH
        };

        const amountInUSD = this.selectedArea.amount / this.exchangeRate;
        const cryptoAmountValue = amountInUSD / rates[crypto];

        cryptoAddress.textContent = addresses[crypto];
        cryptoAmount.textContent = `${cryptoAmountValue.toFixed(6)} ${crypto.toUpperCase()}`;
    }

    copyCryptoAddress() {
        const cryptoAddress = document.getElementById('crypto-address');
        if (cryptoAddress) {
            navigator.clipboard.writeText(cryptoAddress.textContent)
                .then(() => {
                    this.showNotification('Dirección copiada al portapapeles', 'success');
                })
                .catch(() => {
                    this.showNotification('Error al copiar la dirección', 'error');
                });
        }
    }

    processAreaPayment() {
        if (!this.selectedArea) {
            this.showNotification('No hay área seleccionada para pagar', 'error');
            return;
        }

        this.showLoading('Procesando pago...');

        setTimeout(() => {
            // Simular procesamiento de pago
            const paymentSuccess = Math.random() > 0.1; // 90% de éxito

            if (paymentSuccess) {
                // Actualizar reserva si existe
                const reservation = this.reservations.find(r => 
                    r.area === this.selectedArea.name && 
                    r.paymentStatus === 'pending'
                );

                if (reservation) {
                    reservation.paymentStatus = 'paid';
                    reservation.status = 'confirmed';
                } else {
                    // Crear nueva reserva pagada
                    const newReservation = {
                        id: Date.now(),
                        area: this.selectedArea.name,
                        areaId: this.getAreaId(this.selectedArea.name),
                        date: this.selectedArea.date || new Date().toISOString().split('T')[0],
                        time: this.selectedArea.time || '14:00',
                        duration: this.selectedArea.duration || 2,
                        status: 'confirmed',
                        notes: 'Reserva pagada',
                        createdAt: new Date().toISOString().split('T')[0],
                        amount: this.selectedArea.amount,
                        paymentStatus: 'paid'
                    };
                    this.reservations.push(newReservation);
                }

                // Actualizar UI
                this.renderReservations(this.reservations, 'inicio-reservations-grid');
                this.renderReservations(this.reservations, 'reservations-grid');
                this.renderActiveReservations();
                this.loadCommonAreasPayments();
                this.updateCommonAreasStats();

                this.hideLoading();
                this.closePaymentModal();
                this.showNotification('Pago procesado exitosamente', 'success');
                
                // Mostrar QR de confirmación
                setTimeout(() => {
                    this.generateQRCode(this.reservations[this.reservations.length - 1].id);
                }, 500);
            } else {
                this.hideLoading();
                this.showNotification('Error en el procesamiento del pago. Intente nuevamente.', 'error');
            }
        }, 3000);
    }

    getAreaId(areaName) {
        const areas = {
            'Sala de Eventos': 'sala-eventos',
            'Gimnasio': 'gimnasio',
            'Piscina': 'piscina',
            'Terraza': 'terraza',
            'Parqueo Visitantes': 'parqueo',
            'Sala de Juegos': 'sala-juegos'
        };
        return areas[areaName] || areaName.toLowerCase().replace(/\s+/g, '-');
    }

    extractPrice(priceText) {
        const match = priceText.match(/\$?(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }

    generateQRCode(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (!reservation) return;

        const qrData = {
            reservationId: reservation.id,
            area: reservation.area,
            date: reservation.date,
            time: reservation.time,
            duration: reservation.duration,
            resident: this.userData.name,
            apartment: this.userData.apartment
        };

        const qrCodeString = JSON.stringify(qrData);
        
        // Actualizar modal de QR
        const qrArea = document.getElementById('qr-area');
        const qrDate = document.getElementById('qr-date');
        const qrTime = document.getElementById('qr-time');
        const qrCodeNumber = document.getElementById('qr-code-number');

        if (qrArea) qrArea.textContent = reservation.area;
        if (qrDate) qrDate.textContent = this.formatDate(reservation.date);
        if (qrTime) qrTime.textContent = `${reservation.time} (${reservation.duration} horas)`;
        if (qrCodeNumber) qrCodeNumber.textContent = `RES-${reservation.id}`;

        // Generar código QR
        const qrCodeContainer = document.getElementById('qr-code');
        if (qrCodeContainer && typeof QRCode !== 'undefined') {
            qrCodeContainer.innerHTML = '';
            new QRCode(qrCodeContainer, {
                text: qrCodeString,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        // Mostrar modal
        const qrModal = document.getElementById('qrModal');
        if (qrModal) {
            qrModal.classList.add('show');
        }
    }

    closeQRModal() {
        const modal = document.getElementById('qrModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    downloadQRCode() {
        this.showNotification('Descargando código QR...', 'info');
        // En una implementación real, aquí generarías y descargarías la imagen QR
        setTimeout(() => {
            this.showNotification('Código QR descargado exitosamente', 'success');
        }, 1000);
    }

    // ===== SISTEMA DE MANTENIMIENTO =====
    loadMaintenanceRequests() {
        this.maintenanceRequests = [
            {
                id: 1,
                title: 'Fuga en grifería de cocina',
                type: 'plomeria',
                urgency: 'media',
                description: 'Se presenta fuga constante en la llave principal de la cocina, causando goteo y aumento en el consumo de agua.',
                status: 'in-progress',
                createdAt: '2024-01-10',
                scheduledDate: '2024-01-15',
                technician: 'Carlos Mendoza',
                estimatedDuration: '2 horas'
            },
            {
                id: 2,
                title: 'Problema con enchufes del living',
                type: 'electricidad',
                urgency: 'alta',
                description: 'Los enchufes de la pared este del living no funcionan correctamente. Presentan intermitencia.',
                status: 'open',
                createdAt: '2024-01-12',
                scheduledDate: null,
                technician: null,
                estimatedDuration: null
            },
            {
                id: 3,
                title: 'Pintura descascarada en pared principal',
                type: 'pintura',
                urgency: 'baja',
                description: 'La pintura de la pared principal del living se está descascarando en varias áreas.',
                status: 'resolved',
                createdAt: '2024-01-05',
                scheduledDate: '2024-01-08',
                technician: 'María López',
                estimatedDuration: '4 horas',
                resolvedDate: '2024-01-08'
            }
        ];

        this.renderMaintenanceRequests(this.maintenanceRequests);
        this.updateMaintenanceStats();
    }

    renderMaintenanceRequests(requests) {
        const container = document.getElementById('maintenance-requests');
        if (!container) return;

        container.innerHTML = requests.map(request => `
            <div class="maintenance-request" data-request-id="${request.id}" data-status="${request.status}" data-urgency="${request.urgency}">
                <div class="request-header">
                    <div>
                        <div class="request-title">${request.title}</div>
                        <div class="request-meta">
                            <span class="request-type">${this.getMaintenanceTypeLabel(request.type)}</span>
                            <span class="request-urgency ${request.urgency}">${this.getUrgencyLabel(request.urgency)}</span>
                        </div>
                    </div>
                    <span class="request-status status-${request.status}">
                        ${this.getMaintenanceStatusLabel(request.status)}
                    </span>
                </div>
                <div class="request-details">
                    <div class="request-detail">
                        <span class="detail-label">Fecha de reporte</span>
                        <span class="detail-value">${this.formatDate(request.createdAt)}</span>
                    </div>
                    ${request.scheduledDate ? `
                    <div class="request-detail">
                        <span class="detail-label">Fecha programada</span>
                        <span class="detail-value">${this.formatDate(request.scheduledDate)}</span>
                    </div>
                    ` : ''}
                    ${request.technician ? `
                    <div class="request-detail">
                        <span class="detail-label">Técnico asignado</span>
                        <span class="detail-value">${request.technician}</span>
                    </div>
                    ` : ''}
                    ${request.estimatedDuration ? `
                    <div class="request-detail">
                        <span class="detail-label">Duración estimada</span>
                        <span class="detail-value">${request.estimatedDuration}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="request-description">
                    <p>${request.description}</p>
                </div>
                <div class="request-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.viewMaintenanceDetails(${request.id})">
                        Ver detalles
                    </button>
                    ${request.status === 'open' ? 
                        `<button class="btn btn-primary btn-sm" onclick="dashboard.scheduleMaintenance(${request.id})">
                            Programar
                        </button>` : 
                        `<button class="btn btn-outline btn-sm" onclick="dashboard.contactTechnician(${request.id})">
                            Contactar técnico
                        </button>`
                    }
                    ${request.status === 'in-progress' ? 
                        `<button class="btn btn-success btn-sm" onclick="dashboard.markAsResolved(${request.id})">
                            Marcar como resuelto
                        </button>` : ''
                    }
                </div>
            </div>
        `).join('');
    }

    updateMaintenanceStats() {
        const openTickets = this.maintenanceRequests.filter(r => r.status === 'open').length;
        const progressTickets = this.maintenanceRequests.filter(r => r.status === 'in-progress').length;
        const resolvedTickets = this.maintenanceRequests.filter(r => r.status === 'resolved').length;
        
        // Calcular rating promedio (simulado)
        const avgRating = (4.5 + Math.random() * 0.5).toFixed(1);

        const openTicketsEl = document.getElementById('open-tickets');
        const progressTicketsEl = document.getElementById('progress-tickets');
        const resolvedTicketsEl = document.getElementById('resolved-tickets');
        const avgRatingEl = document.getElementById('avg-rating');

        if (openTicketsEl) openTicketsEl.textContent = openTickets;
        if (progressTicketsEl) progressTicketsEl.textContent = progressTickets;
        if (resolvedTicketsEl) resolvedTicketsEl.textContent = resolvedTickets;
        if (avgRatingEl) avgRatingEl.textContent = avgRating;
    }

    viewMaintenanceDetails(requestId) {
        const request = this.maintenanceRequests.find(r => r.id === requestId);
        if (request) {
            const details = `
                Tipo: ${this.getMaintenanceTypeLabel(request.type)}
                Urgencia: ${this.getUrgencyLabel(request.urgency)}
                Estado: ${this.getMaintenanceStatusLabel(request.status)}
                ${request.technician ? `Técnico: ${request.technician}` : ''}
                ${request.scheduledDate ? `Programado para: ${this.formatDate(request.scheduledDate)}` : ''}
            `;
            this.showNotification(`Detalles: ${details}`, 'info');
        }
    }

    scheduleMaintenance(requestId) {
        const request = this.maintenanceRequests.find(r => r.id === requestId);
        if (request) {
            // Simular programación
            request.status = 'in-progress';
            request.scheduledDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 días desde ahora
            request.technician = 'Técnico Asignado';
            request.estimatedDuration = '2 horas';
            
            this.renderMaintenanceRequests(this.maintenanceRequests);
            this.updateMaintenanceStats();
            this.showNotification('Mantenimiento programado exitosamente', 'success');
        }
    }

    contactTechnician(requestId) {
        const request = this.maintenanceRequests.find(r => r.id === requestId);
        if (request && request.technician) {
            this.showNotification(`Contactando a ${request.technician}...`, 'info');
            // Simular contacto
            setTimeout(() => {
                this.showNotification(`Técnico ${request.technician} contactado`, 'success');
            }, 1500);
        }
    }

    markAsResolved(requestId) {
        const request = this.maintenanceRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'resolved';
            request.resolvedDate = new Date().toISOString().split('T')[0];
            
            this.renderMaintenanceRequests(this.maintenanceRequests);
            this.updateMaintenanceStats();
            this.showNotification('Mantenimiento marcado como resuelto', 'success');
        }
    }

    loadMaintenanceSchedule() {
        // Los datos del schedule ya están en el HTML
        // Aquí podrías agregar funcionalidad adicional si es necesario
    }

    filterMaintenanceSchedule() {
        const filter = document.getElementById('maintenance-schedule-filter').value;
        // Implementar filtrado del schedule si es necesario
        this.showNotification(`Filtro aplicado: ${filter}`, 'info');
    }

    // ===== SISTEMA DE EMERGENCIAS =====
    loadEmergencyContacts() {
        // Los contactos ya están en el HTML, solo necesitamos agregar funcionalidad
    }

    triggerEmergency(type) {
        let message = '';
        let contacts = [];

        switch (type) {
            case 'security':
                message = 'Emergencia de seguridad activada. Contactando a seguridad...';
                contacts = ['Seguridad Edificio: +591 1234-5678'];
                break;
            case 'medical':
                message = 'Emergencia médica activada. Llamando a servicios médicos...';
                contacts = ['Emergencias Médicas: 911'];
                break;
            case 'fire':
                message = 'Emergencia de incendio activada. Contactando a bomberos...';
                contacts = ['Bomberos: 119'];
                break;
        }

        this.showNotification(message, 'error');
        
        // Simular contacto con servicios de emergencia
        contacts.forEach(contact => {
            setTimeout(() => {
                this.showNotification(`Contactado: ${contact}`, 'info');
            }, 1000);
        });

        // Registrar la emergencia
        this.logEmergency(type);
    }

    logEmergency(type) {
        const emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
        emergencies.push({
            type: type,
            timestamp: new Date().toISOString(),
            status: 'reported'
        });
        localStorage.setItem('emergencies', JSON.stringify(emergencies));
    }

    callEmergency(number) {
        this.showNotification(`Llamando a: ${number}`, 'info');
        // En una aplicación real, esto iniciaría una llamada telefónica
        // window.location.href = `tel:${number}`;
    }

    // ===== SISTEMA DE CONSUMO =====
    loadConsumptionData() {
        this.consumptionData = {
            water: [12.5, 13.2, 14.8, 15.2, 14.5, 13.8],
            energy: [195.3, 203.7, 208.9, 210.5, 205.1, 198.7],
            gas: [9.2, 8.9, 8.7, 8.5, 8.8, 9.1],
            months: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            costs: {
                water: [45, 48, 52, 55, 50, 48],
                energy: [120, 125, 130, 135, 128, 122],
                gas: [65, 63, 60, 58, 62, 64]
            }
        };
    }

    loadConsumptionCharts() {
        this.initializeConsumptionCharts();
        this.updateConsumptionOverview();
    }

    initializeConsumptionCharts() {
        // Gráfica de evolución del consumo
        const evolutionCtx = document.getElementById('consumptionEvolutionChart');
        if (evolutionCtx) {
            new Chart(evolutionCtx, {
                type: 'line',
                data: {
                    labels: this.consumptionData.months,
                    datasets: [
                        {
                            label: 'Agua (m³)',
                            data: this.consumptionData.water,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Energía (kWh)',
                            data: this.consumptionData.energy,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Gas (m³)',
                            data: this.consumptionData.gas,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Evolución del Consumo - Últimos 6 Meses'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }

        // Gráfica de distribución
        const distributionCtx = document.getElementById('consumptionDistributionChart');
        if (distributionCtx) {
            new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Agua', 'Energía', 'Gas'],
                    datasets: [{
                        data: [45, 35, 20],
                        backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Gráfica comparativa horaria
        const hourlyCtx = document.getElementById('hourlyComparisonChart');
        if (hourlyCtx) {
            new Chart(hourlyCtx, {
                type: 'bar',
                data: {
                    labels: ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'],
                    datasets: [
                        {
                            label: 'Tu consumo',
                            data: [15, 25, 45, 60, 55, 35],
                            backgroundColor: 'rgba(99, 102, 241, 0.8)'
                        },
                        {
                            label: 'Promedio vecinos',
                            data: [12, 22, 40, 55, 50, 30],
                            backgroundColor: 'rgba(156, 163, 175, 0.8)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Comparativa Horaria de Consumo'
                        }
                    }
                }
            });
        }
    }

    updateConsumptionOverview() {
        // Actualizar datos de consumo en tiempo real
        const currentWater = this.consumptionData.water[this.consumptionData.water.length - 1];
        const currentEnergy = this.consumptionData.energy[this.consumptionData.energy.length - 1];
        const currentGas = this.consumptionData.gas[this.consumptionData.gas.length - 1];
        
        const totalCost = this.consumptionData.costs.water.reduce((a, b) => a + b, 0) +
                         this.consumptionData.costs.energy.reduce((a, b) => a + b, 0) +
                         this.consumptionData.costs.gas.reduce((a, b) => a + b, 0);

        // Aquí podrías actualizar elementos específicos del DOM
    }

    selectPeriod(btn) {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const period = btn.dataset.period;
        const dateRangeSelector = document.getElementById('date-range-selector');
        if (period === 'custom') {
            if (dateRangeSelector) dateRangeSelector.style.display = 'flex';
        } else {
            if (dateRangeSelector) dateRangeSelector.style.display = 'none';
            this.updateChartsForPeriod(period);
        }
    }

    updateChartsForPeriod(period) {
        this.showNotification(`Período actualizado: ${period}`, 'info');
        // Aquí actualizarías las gráficas según el período seleccionado
    }

    applyCustomDateRange() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (startDate && endDate) {
            this.showNotification(`Rango personalizado aplicado: ${startDate} a ${endDate}`, 'success');
            // Aquí actualizarías las gráficas con el rango personalizado
        } else {
            this.showNotification('Por favor selecciona ambas fechas', 'warning');
        }
    }

    downloadConsumptionReport() {
        this.showLoading('Generando reporte de consumo...');
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Reporte de consumo descargado exitosamente', 'success');
        }, 2000);
    }

    askAIConsumptionTips() {
        this.toggleAIAssistant();
        setTimeout(() => {
            this.addAIMessage('¿Puedes darme tips para reducir mi consumo de energía?', 'user');
            setTimeout(() => {
                this.addAIMessage('Claro, veo que tu consumo de energía es 8% mayor al promedio. Te recomiendo: 1) Usar el aire acondicionado a 24°C, 2) Apagar luces cuando no las uses, 3) Usar electrodomésticos eficientes.', 'assistant');
            }, 1000);
        }, 500);
    }

    // ===== SISTEMA DE COMUNIDAD =====
    loadCommunityFeed() {
        this.communityData = {
            feed: [
                {
                    id: 1,
                    author: 'María González',
                    avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
                    content: '¡Hola vecinos! Este sábado estaré organizando una venta de garaje en el estacionamiento. Tendremos muebles, libros y electrodomésticos en buen estado. ¡Los espero!',
                    time: '2 horas',
                    type: 'announcement',
                    likes: 12,
                    comments: 5
                },
                {
                    id: 2,
                    author: 'Administración',
                    avatar: 'https://ui-avatars.com/api/?name=Administracion&background=6366f1&color=fff',
                    content: 'Recordatorio: El próximo lunes 22 de enero se realizará el mantenimiento preventivo de los ascensores. El servicio estará interrumpido de 8:00 AM a 12:00 PM.',
                    time: '5 horas',
                    type: 'announcement',
                    likes: 8,
                    comments: 3
                },
                {
                    id: 3,
                    author: 'Carlos López',
                    avatar: 'https://ui-avatars.com/api/?name=Carlos+Lopez&background=06b6d4&color=fff',
                    content: '¿Alguien tiene recomendaciones para un buen técnico de aire acondicionado? El mío está fallando.',
                    time: '1 día',
                    type: 'help',
                    likes: 5,
                    comments: 7
                }
            ],
            events: [
                {
                    id: 1,
                    title: 'Asamblea de Residentes',
                    date: '2024-01-25',
                    time: '19:00',
                    location: 'Sala de Eventos',
                    description: 'Reunión trimestral para discutir temas importantes de la comunidad.'
                },
                {
                    id: 2,
                    title: 'Yoga en la Terraza',
                    date: '2024-01-20',
                    time: '08:00',
                    location: 'Terraza Principal',
                    description: 'Clase de yoga para todos los residentes. Traer tu propia esterilla.'
                },
                {
                    id: 3,
                    title: 'Torneo de Tenis de Mesa',
                    date: '2024-02-05',
                    time: '16:00',
                    location: 'Sala de Juegos',
                    description: 'Inscripciones abiertas para el torneo mensual de tenis de mesa.'
                }
            ],
            residents: [
                {
                    id: 1,
                    name: 'Ana Martínez',
                    apartment: '3B - Torre 1',
                    avatar: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=8b5cf6&color=fff',
                    phone: '+591 7654-3210',
                    email: 'ana.martinez@email.com'
                },
                {
                    id: 2,
                    name: 'Carlos López',
                    apartment: '7C - Torre 2',
                    avatar: 'https://ui-avatars.com/api/?name=Carlos+Lopez&background=06b6d4&color=fff',
                    phone: '+591 6543-2109',
                    email: 'carlos.lopez@email.com'
                },
                {
                    id: 3,
                    name: 'María González',
                    apartment: '2A - Torre 1',
                    avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
                    phone: '+591 5432-1098',
                    email: 'maria.gonzalez@email.com'
                }
            ]
        };

        this.renderCommunityFeed(this.communityData.feed);
    }

    renderCommunityFeed(feed) {
        const container = document.getElementById('community-feed');
        if (!container) return;

        container.innerHTML = feed.map(post => `
            <div class="feed-post" data-post-id="${post.id}" data-type="${post.type}">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
                    <div>
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${post.time}</div>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                <div class="post-actions">
                    <div class="post-action" onclick="dashboard.likePost(${post.id})">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${post.likes}</span>
                    </div>
                    <div class="post-action" onclick="dashboard.toggleComments(${post.id})">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments} comentarios</span>
                    </div>
                    <div class="post-action" onclick="dashboard.sharePost(${post.id})">
                        <i class="fas fa-share"></i>
                        <span>Compartir</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadCommunityData() {
        this.loadCommunityEvents();
        this.loadResidentsDirectory();
    }

    loadCommunityEvents() {
        const container = document.getElementById('community-events');
        if (!container) return;

        container.innerHTML = this.communityData.events.map(event => {
            const eventDate = new Date(event.date);
            return `
                <div class="event-card" data-event-id="${event.id}">
                    <div class="event-date">
                        <div class="event-day">${eventDate.getDate()}</div>
                        <div class="event-month">${this.getMonthName(eventDate.getMonth()).substring(0, 3)}</div>
                    </div>
                    <h4>${event.title}</h4>
                    <div class="event-details">
                        <div class="event-detail">
                            <i class="fas fa-clock"></i>
                            <span>${event.time}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                    </div>
                    <p>${event.description}</p>
                    <button class="btn btn-primary btn-sm" onclick="dashboard.rsvpToEvent(${event.id})">
                        Confirmar Asistencia
                    </button>
                </div>
            `;
        }).join('');
    }

    loadResidentsDirectory() {
        const container = document.getElementById('residents-grid');
        if (!container) return;

        container.innerHTML = this.communityData.residents.map(resident => `
            <div class="resident-card" data-resident-id="${resident.id}">
                <img src="${resident.avatar}" alt="${resident.name}" class="resident-avatar">
                <h4>${resident.name}</h4>
                <div class="resident-apartment">${resident.apartment}</div>
                <div class="resident-contact">
                    <a href="tel:${resident.phone}" class="contact-btn" title="Llamar" onclick="dashboard.logContact('call', ${resident.id})">
                        <i class="fas fa-phone"></i>
                    </a>
                    <a href="mailto:${resident.email}" class="contact-btn" title="Email" onclick="dashboard.logContact('email', ${resident.id})">
                        <i class="fas fa-envelope"></i>
                    </a>
                    <a href="#" class="contact-btn" title="Mensaje" onclick="dashboard.sendMessage(${resident.id})">
                        <i class="fas fa-comment"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    likePost(postId) {
        const post = this.communityData.feed.find(p => p.id === postId);
        if (post) {
            post.likes++;
            this.renderCommunityFeed(this.communityData.feed);
            this.showNotification('Post liked', 'success');
        }
    }

    toggleComments(postId) {
        this.showNotification('Funcionalidad de comentarios en desarrollo', 'info');
    }

    sharePost(postId) {
        this.showNotification('Post compartido', 'success');
    }

    rsvpToEvent(eventId) {
        const event = this.communityData.events.find(e => e.id === eventId);
        if (event) {
            this.showNotification(`Asistencia confirmada para: ${event.title}`, 'success');
        }
    }

    logContact(type, residentId) {
        const resident = this.communityData.residents.find(r => r.id === residentId);
        if (resident) {
            // Registrar el contacto (en una aplicación real, esto iría a una base de datos)
            console.log(`Contacto ${type} con ${resident.name}`);
        }
    }

    sendMessage(residentId) {
        const resident = this.communityData.residents.find(r => r.id === residentId);
        if (resident) {
            this.showNotification(`Enviando mensaje a ${resident.name}...`, 'info');
        }
    }

    filterCommunityFeed() {
        const filter = document.getElementById('feed-filter').value;
        let filtered = this.communityData.feed;
        
        if (filter !== 'all') {
            filtered = filtered.filter(post => post.type === filter);
        }
        
        this.renderCommunityFeed(filtered);
    }

    searchResidents() {
        const searchTerm = document.getElementById('search-residents').value.toLowerCase();
        const towerFilter = document.getElementById('tower-filter').value;
        
        let filtered = this.communityData.residents;
        
        if (searchTerm) {
            filtered = filtered.filter(resident => 
                resident.name.toLowerCase().includes(searchTerm) ||
                resident.apartment.toLowerCase().includes(searchTerm)
            );
        }
        
        if (towerFilter !== 'all') {
            filtered = filtered.filter(resident => resident.apartment.includes(towerFilter));
        }
        
        this.renderResidentsDirectory(filtered);
    }

    filterResidents() {
        this.searchResidents();
    }

    openNewPost() {
        this.showNotification('Funcionalidad de nueva publicación en desarrollo', 'info');
    }

    refreshCommunity() {
        this.showLoading('Actualizando comunidad...');
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Comunidad actualizada', 'success');
        }, 1000);
    }

    // ===== SISTEMA DE CONFIGURACIÓN =====
    loadSettings() {
        // Cargar configuraciones guardadas
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Aplicar configuraciones
            const emailNotifications = document.getElementById('email-notifications');
            const pushNotifications = document.getElementById('push-notifications');
            const paymentReminders = document.getElementById('payment-reminders');
            const maintenanceUpdates = document.getElementById('maintenance-updates');
            const communityEventsNotifications = document.getElementById('community-events-notifications');
            const publicProfile = document.getElementById('public-profile');
            const shareConsumption = document.getElementById('share-consumption');
            const showInDirectory = document.getElementById('show-in-directory');
            const languageSelect = document.getElementById('language-select');

            if (emailNotifications) emailNotifications.checked = settings.emailNotifications;
            if (pushNotifications) pushNotifications.checked = settings.pushNotifications;
            if (paymentReminders) paymentReminders.checked = settings.paymentReminders;
            if (maintenanceUpdates) maintenanceUpdates.checked = settings.maintenanceUpdates;
            if (communityEventsNotifications) communityEventsNotifications.checked = settings.communityEventsNotifications;
            if (publicProfile) publicProfile.checked = settings.publicProfile;
            if (shareConsumption) shareConsumption.checked = settings.shareConsumption;
            if (showInDirectory) showInDirectory.checked = settings.showInDirectory;
            if (languageSelect) languageSelect.value = settings.language;
            
            // Aplicar tema
            this.changeTheme(settings.theme, false);
        }
    }

    saveSettings() {
        const emailNotifications = document.getElementById('email-notifications');
        const pushNotifications = document.getElementById('push-notifications');
        const paymentReminders = document.getElementById('payment-reminders');
        const maintenanceUpdates = document.getElementById('maintenance-updates');
        const communityEventsNotifications = document.getElementById('community-events-notifications');
        const publicProfile = document.getElementById('public-profile');
        const shareConsumption = document.getElementById('share-consumption');
        const showInDirectory = document.getElementById('show-in-directory');
        const languageSelect = document.getElementById('language-select');
        const activeTheme = document.querySelector('.theme-option.active');

        const settings = {
            emailNotifications: emailNotifications ? emailNotifications.checked : false,
            pushNotifications: pushNotifications ? pushNotifications.checked : false,
            paymentReminders: paymentReminders ? paymentReminders.checked : false,
            maintenanceUpdates: maintenanceUpdates ? maintenanceUpdates.checked : false,
            communityEventsNotifications: communityEventsNotifications ? communityEventsNotifications.checked : false,
            publicProfile: publicProfile ? publicProfile.checked : false,
            shareConsumption: shareConsumption ? shareConsumption.checked : false,
            showInDirectory: showInDirectory ? showInDirectory.checked : false,
            language: languageSelect ? languageSelect.value : 'es',
            theme: activeTheme ? activeTheme.dataset.theme : 'dark'
        };
        
        localStorage.setItem('userSettings', JSON.stringify(settings));
        this.showNotification('Configuración guardada exitosamente', 'success');
    }

    changeTheme(theme, showNotification = true) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        const activeOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
        
        if (showNotification) {
            this.showNotification(`Tema cambiado a: ${theme}`, 'info');
        }
        
        // Aquí aplicarías los cambios de tema al CSS
        // Por simplicidad, solo mostramos una notificación
    }

    changePassword() {
        this.showNotification('Funcionalidad de cambio de contraseña en desarrollo', 'info');
    }

    enableTwoFactor() {
        this.showNotification('Funcionalidad de autenticación 2FA en desarrollo', 'info');
    }

    viewLoginHistory() {
        this.showNotification('Historial de accesos en desarrollo', 'info');
    }

    previewAvatar(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('profile-avatar-preview');
                if (preview) {
                    preview.src = e.target.result;
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // ===== ASISTENTE IA =====
    toggleAIAssistant() {
        const assistant = document.getElementById('aiAssistant');
        if (assistant) {
            assistant.classList.toggle('show');
            
            if (assistant.classList.contains('show')) {
                const aiInput = document.getElementById('ai-input');
                if (aiInput) aiInput.focus();
            }
        }
    }

    sendAIMessage() {
        const input = document.getElementById('ai-input');
        if (!input) return;

        const message = input.value.trim();
        
        if (!message) return;

        // Añadir mensaje del usuario
        this.addAIMessage(message, 'user');
        input.value = '';

        // Simular respuesta de IA
        this.showLoading('Asistente está pensando...');
        
        setTimeout(() => {
            this.hideLoading();
            const response = this.generateAIResponse(message);
            this.addAIMessage(response, 'assistant');
        }, 1000);
    }

    addAIMessage(message, type) {
        const content = document.querySelector('.ai-content');
        if (!content) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        content.appendChild(messageDiv);
        content.scrollTop = content.scrollHeight;
    }

    generateAIResponse(message) {
        const responses = {
            'consumo': 'Veo que tu consumo de energía aumentó 8% este mes. Te recomiendo revisar el uso del aire acondicionado durante las horas pico y considerar programar electrodomésticos para horarios de menor demanda.',
            'pago': 'Puedo ayudarte con tus pagos. Actualmente tienes 2 pagos pendientes por un total de $335.25. ¿Te gustaría procesar algún pago ahora?',
            'reserva': 'Para hacer una nueva reserva, haz clic en el botón "Nueva Reserva" y selecciona el área común, fecha y horario deseado. Te mostraré la disponibilidad inmediatamente.',
            'mantenimiento': 'Para reportar un problema de mantenimiento, usa el formulario de solicitud. Si es una emergencia, contacta inmediatamente al personal de seguridad.',
            'emergencia': 'En caso de emergencia, usa los botones rojos en la sección de Emergencias. Para emergencias médicas llama al 911, para seguridad al 110.',
            'comunidad': 'Puedes ver las últimas publicaciones de la comunidad en la sección correspondiente. También hay eventos programados y un directorio de residentes.',
            'default': 'Hola, soy tu asistente virtual. Puedo ayudarte con consultas sobre pagos, reservas, mantenimiento, consumo de servicios, emergencias y más. ¿En qué puedo asistirte?'
        };

        message = message.toLowerCase();
        
        if (message.includes('consumo') || message.includes('energía') || message.includes('agua') || message.includes('gas')) {
            return responses.consumo;
        } else if (message.includes('pago') || message.includes('factura') || message.includes('dinero')) {
            return responses.pago;
        } else if (message.includes('reserva') || message.includes('área común') || message.includes('sala')) {
            return responses.reserva;
        } else if (message.includes('mantenimiento') || message.includes('reparación') || message.includes('arreglo')) {
            return responses.mantenimiento;
        } else if (message.includes('emergencia') || message.includes('urgencia') || message.includes('peligro')) {
            return responses.emergencia;
        } else if (message.includes('comunidad') || message.includes('vecino') || message.includes('evento')) {
            return responses.comunidad;
        } else {
            return responses.default;
        }
    }

    askAIFinancialAdvice() {
        this.toggleAIAssistant();
        setTimeout(() => {
            this.addAIMessage('¿Puedes darme consejos para manejar mejor mis finanzas?', 'user');
            setTimeout(() => {
                this.addAIMessage('Claro, basado en tu historial: 1) Considera pagar tus deudas pendientes pronto para evitar recargos, 2) Tu ahorro mensual es bueno, podrías incrementarlo un 5%, 3) Revisa tu consumo de servicios que está por encima del promedio.', 'assistant');
            }, 1000);
        }, 500);
    }

    askAIMaintenanceHelp() {
        this.toggleAIAssistant();
        setTimeout(() => {
            this.addAIMessage('Necesito ayuda con un problema de mantenimiento', 'user');
            setTimeout(() => {
                this.addAIMessage('Puedo ayudarte. Por favor describe el problema: ¿es de plomería, electricidad, pintura u otro tipo? También dime la urgencia del problema.', 'assistant');
            }, 1000);
        }, 500);
    }

    // ===== MODALES =====
    openQuickReserve() {
        const modal = document.getElementById('quickReserveModal');
        if (modal) {
            modal.classList.add('show');
            
            // Establecer fecha mínima como hoy
            const today = new Date().toISOString().split('T')[0];
            const reserveDate = document.getElementById('reserve-date');
            if (reserveDate) reserveDate.min = today;
        }
    }

    closeQuickReserve() {
        const modal = document.getElementById('quickReserveModal');
        if (modal) {
            modal.classList.remove('show');
            const form = document.getElementById('quick-reserve-form');
            if (form) form.reset();
        }
    }

    submitQuickReserve() {
        const form = document.getElementById('quick-reserve-form');
        if (!form) return;

        const formData = new FormData(form);
        
        // Validación básica
        if (!formData.get('reserve-area') || !formData.get('reserve-date') || !formData.get('reserve-time')) {
            this.showNotification('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        this.showLoading('Procesando reserva...');

        setTimeout(() => {
            // Calcular monto basado en el área y duración
            const areaId = formData.get('reserve-area');
            const duration = parseInt(formData.get('reserve-duration'));
            const areaPricing = this.getAreaPricing(areaId);
            const amount = areaPricing * duration;

            // Crear nueva reserva
            const newReservation = {
                id: Date.now(),
                area: this.getAreaName(areaId),
                areaId: areaId,
                date: formData.get('reserve-date'),
                time: formData.get('reserve-time'),
                duration: duration,
                status: 'pending',
                notes: formData.get('reserve-notes') || 'Sin notas adicionales',
                createdAt: new Date().toISOString().split('T')[0],
                amount: amount,
                paymentStatus: amount > 0 ? 'pending' : 'free'
            };

            this.reservations.push(newReservation);
            this.renderReservations(this.reservations, 'inicio-reservations-grid');
            this.renderReservations(this.reservations, 'reservations-grid');
            this.renderActiveReservations();
            this.loadCommonAreasPayments();
            this.updateCommonAreasStats();

            this.hideLoading();
            this.closeQuickReserve();
            
            if (amount > 0) {
                this.showNotification('Reserva creada. Por favor realiza el pago para confirmar.', 'info');
                this.selectedArea = {
                    name: newReservation.area,
                    date: newReservation.date,
                    time: newReservation.time,
                    duration: newReservation.duration,
                    amount: newReservation.amount
                };
                this.openPaymentModal();
            } else {
                this.showNotification('Reserva enviada para aprobación', 'success');
            }
        }, 1500);
    }

    getAreaPricing(areaId) {
        const pricing = {
            'sala-eventos': 50,
            'gimnasio': 0,
            'piscina': 10,
            'terraza': 30,
            'parqueo': 5,
            'sala-juegos': 15
        };
        return pricing[areaId] || 0;
    }

    getAreaName(areaId) {
        const areas = {
            'sala-eventos': 'Sala de Eventos',
            'gimnasio': 'Gimnasio',
            'piscina': 'Piscina',
            'terraza': 'Terraza',
            'parqueo': 'Parqueo Visitantes',
            'sala-juegos': 'Sala de Juegos'
        };
        return areas[areaId] || areaId;
    }

    openMaintenanceRequest() {
        const modal = document.getElementById('maintenanceRequestModal');
        if (modal) modal.classList.add('show');
    }

    closeMaintenanceRequest() {
        const modal = document.getElementById('maintenanceRequestModal');
        if (modal) {
            modal.classList.remove('show');
            const form = document.getElementById('maintenance-request-form');
            if (form) form.reset();
        }
    }

    submitMaintenanceRequest() {
        const form = document.getElementById('maintenance-request-form');
        if (!form) return;

        const formData = new FormData(form);
        
        if (!formData.get('maintenance-type') || !formData.get('maintenance-description')) {
            this.showNotification('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        this.showLoading('Enviando solicitud...');

        setTimeout(() => {
            // Crear nueva solicitud
            const newRequest = {
                id: Date.now(),
                title: this.getMaintenanceTypeLabel(formData.get('maintenance-type')),
                type: formData.get('maintenance-type'),
                urgency: formData.get('maintenance-urgency'),
                description: formData.get('maintenance-description'),
                status: 'open',
                createdAt: new Date().toISOString().split('T')[0],
                scheduledDate: null,
                technician: null,
                estimatedDuration: null
            };

            this.maintenanceRequests.push(newRequest);
            this.renderMaintenanceRequests(this.maintenanceRequests);
            this.updateMaintenanceStats();

            this.hideLoading();
            this.closeMaintenanceRequest();
            this.showNotification('Solicitud de mantenimiento enviada exitosamente', 'success');
        }, 1500);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // ===== NOTIFICACIONES Y ALERTAS =====
    toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) dropdown.classList.toggle('show');
    }

    hideNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }

    toggleUserMenu() {
        const menu = document.querySelector('.user-menu');
        if (menu) menu.classList.toggle('show');
    }

    hideUserMenu() {
        const menu = document.querySelector('.user-menu');
        if (menu) menu.classList.remove('show');
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('active');
    }

    hideMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Añadir estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gray-100);
            padding: 16px;
            border-radius: 8px;
            box-shadow: var(--shadow-xl);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            max-width: 400px;
            border-left: 4px solid ${this.getNotificationColor(type)};
            animation: slideInRight 0.3s ease-out;
            color: var(--gray-800);
            border: 1px solid var(--gray-300);
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }

    showLoading(message = 'Cargando...') {
        // Crear overlay de carga
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        `;

        // Estilos para el spinner
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                border: 4px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top: 4px solid white;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .loading-content {
                text-align: center;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // ===== UTILIDADES =====
    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    formatCurrency(amount) {
        if (this.currentCurrency === 'USD') {
            amount = amount / this.exchangeRate;
        }
        
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: this.currentCurrency
        }).format(amount);
    }

    getCategoryLabel(category) {
        const categories = {
            'rent': 'Alquiler',
            'maintenance': 'Mantenimiento',
            'utilities': 'Servicios',
            'expenses': 'Expensas',
            'other': 'Otros'
        };
        return categories[category] || category;
    }

    getStatusLabel(status) {
        const statuses = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'overdue': 'Vencido',
            'upcoming': 'Próximo'
        };
        return statuses[status] || status;
    }

    getReservationStatusLabel(status) {
        const statuses = {
            'confirmed': 'Confirmada',
            'pending': 'Pendiente',
            'cancelled': 'Cancelada'
        };
        return statuses[status] || status;
    }

    getMaintenanceTypeLabel(type) {
        const types = {
            'plomeria': 'Plomería',
            'electricidad': 'Electricidad',
            'pintura': 'Pintura',
            'carpinteria': 'Carpintería',
            'limpieza': 'Limpieza',
            'otros': 'Otros'
        };
        return types[type] || type;
    }

    getUrgencyLabel(urgency) {
        const urgencies = {
            'baja': 'Baja',
            'media': 'Media',
            'alta': 'Alta',
            'emergencia': 'Emergencia'
        };
        return urgencies[urgency] || urgency;
    }

    getMaintenanceStatusLabel(status) {
        const statuses = {
            'open': 'Abierto',
            'in-progress': 'En Proceso',
            'resolved': 'Resuelto',
            'closed': 'Cerrado'
        };
        return statuses[status] || status;
    }

    getMonthName(month) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month];
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    updatePaymentCounters() {
        const pendingPayments = this.payments.filter(p => p.status === 'pending');
        const totalAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

        // Actualizar UI en la sección inicio
        const statusCards = document.querySelectorAll('.status-card');
        if (statusCards[0]) {
            const h3 = statusCards[0].querySelector('h3');
            const statusAmount = statusCards[0].querySelector('.status-amount');
            
            if (h3) h3.textContent = pendingPayments.length;
            if (statusAmount) statusAmount.textContent = this.formatCurrency(totalAmount);
        }
    }

    // ===== SERVICE WORKER Y OFFLINE SUPPORT =====
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('Error registrando Service Worker:', error);
                });
        }
    }

    // ===== ACTUALIZACIONES EN TIEMPO REAL =====
    setupRealTimeUpdates() {
        // Simular actualizaciones en tiempo real
        setInterval(() => {
            this.updateAreasAvailability();
            this.updateNotificationBadge();
        }, 30000); // Actualizar cada 30 segundos
    }

    updateNotificationBadge() {
        // Simular nuevas notificaciones
        if (Math.random() > 0.7) {
            const badge = document.querySelector('.notification-icon .badge');
            if (badge) {
                const currentCount = parseInt(badge.textContent);
                badge.textContent = currentCount + 1;
            }
        }
    }

    // ===== SISTEMA DE SALIDA =====
    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.showLoading('Cerrando sesión...');
            
            // Simular proceso de logout
            setTimeout(() => {
                localStorage.removeItem('userData');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userSettings');
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    // ===== INICIALIZACIÓN DE GRÁFICAS =====
    initializeCharts() {
        // Gráficas financieras
        this.initializeFinancialCharts();
    }

    initializeFinancialCharts() {
        // Gráfica de evolución de gastos
        const expensesCtx = document.getElementById('expensesChart');
        if (expensesCtx) {
            new Chart(expensesCtx, {
                type: 'line',
                data: {
                    labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    datasets: [{
                        label: 'Gastos Mensuales',
                        data: [450, 520, 480, 610, 550, 335],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Evolución de Gastos - Últimos 6 Meses'
                        }
                    }
                }
            });
        }

        // Gráfica de distribución de pagos
        const distributionCtx = document.getElementById('paymentsDistributionChart');
        if (distributionCtx) {
            new Chart(distributionCtx, {
                type: 'pie',
                data: {
                    labels: ['Mantenimiento', 'Servicios', 'Alquiler', 'Otros'],
                    datasets: [{
                        data: [40, 25, 30, 5],
                        backgroundColor: [
                            '#6366f1',
                            '#f59e0b',
                            '#10b981',
                            '#6b7280'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Gráfica de comparativa con vecinos
        const comparisonCtx = document.getElementById('neighborsComparisonChart');
        if (comparisonCtx) {
            new Chart(comparisonCtx, {
                type: 'bar',
                data: {
                    labels: ['Agua', 'Energía', 'Gas', 'Total'],
                    datasets: [
                        {
                            label: 'Tu consumo',
                            data: [115, 108, 95, 106],
                            backgroundColor: 'rgba(99, 102, 241, 0.8)'
                        },
                        {
                            label: 'Promedio vecinos',
                            data: [100, 100, 100, 100],
                            backgroundColor: 'rgba(156, 163, 175, 0.8)'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Comparativa con Vecinos (%)'
                        }
                    }
                }
            });
        }

        // Gráfica de proyección financiera
        const projectionCtx = document.getElementById('financialProjectionChart');
        if (projectionCtx) {
            new Chart(projectionCtx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Proyección',
                            data: [335, 320, 310, 305, 300, 295],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Gastos Actuales',
                            data: [335, null, null, null, null, null],
                            borderColor: '#6366f1',
                            borderDash: [5, 5],
                            pointBackgroundColor: '#6366f1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Proyección Financiera - Próximos 6 Meses'
                        }
                    }
                }
            });
        }
    }

    loadFinancialData() {
        // Los datos ya están cargados, solo asegurarnos de que las gráficas estén actualizadas
        this.initializeFinancialCharts();
    }
}

// Funciones globales para uso en HTML
function switchSection(sectionId) {
    if (window.dashboard) {
        window.dashboard.switchSection(sectionId);
    }
}

function openQuickReserve() {
    if (window.dashboard) {
        window.dashboard.openQuickReserve();
    }
}

function closeQuickReserve() {
    if (window.dashboard) {
        window.dashboard.closeQuickReserve();
    }
}

function submitQuickReserve() {
    if (window.dashboard) {
        window.dashboard.submitQuickReserve();
    }
}

function openMaintenanceRequest() {
    if (window.dashboard) {
        window.dashboard.openMaintenanceRequest();
    }
}

function closeMaintenanceRequest() {
    if (window.dashboard) {
        window.dashboard.closeMaintenanceRequest();
    }
}

function submitMaintenanceRequest() {
    if (window.dashboard) {
        window.dashboard.submitMaintenanceRequest();
    }
}

function toggleAIAssistant() {
    if (window.dashboard) {
        window.dashboard.toggleAIAssistant();
    }
}

function sendAIMessage() {
    if (window.dashboard) {
        window.dashboard.sendAIMessage();
    }
}

function toggleNotifications() {
    if (window.dashboard) {
        window.dashboard.toggleNotifications();
    }
}

function toggleUserMenu() {
    if (window.dashboard) {
        window.dashboard.toggleUserMenu();
    }
}

function processPayment(paymentId) {
    if (window.dashboard) {
        window.dashboard.processPayment(paymentId);
    }
}

function closeAlert(element) {
    if (element && element.closest('.alert-banner')) {
        element.closest('.alert-banner').remove();
    }
}

function changeCurrency() {
    const select = document.getElementById('currency-select');
    if (select && window.dashboard) {
        window.dashboard.changeCurrency(select.value);
    }
}

function filterPayments() {
    if (window.dashboard) {
        window.dashboard.filterPayments();
    }
}

function searchPayments() {
    if (window.dashboard) {
        window.dashboard.searchPayments();
    }
}

function filterReservations() {
    if (window.dashboard) {
        window.dashboard.filterReservations();
    }
}

function searchReservations() {
    if (window.dashboard) {
        window.dashboard.searchReservations();
    }
}

function previousMonth() {
    // Implementar navegación del calendario
    if (window.dashboard) {
        window.dashboard.showNotification('Navegación del calendario en desarrollo', 'info');
    }
}

function nextMonth() {
    // Implementar navegación del calendario
    if (window.dashboard) {
        window.dashboard.showNotification('Navegación del calendario en desarrollo', 'info');
    }
}

function previousWeek() {
    // Implementar navegación de semanas
    if (window.dashboard) {
        window.dashboard.showNotification('Navegación de semanas en desarrollo', 'info');
    }
}

function nextWeek() {
    // Implementar navegación de semanas
    if (window.dashboard) {
        window.dashboard.showNotification('Navegación de semanas en desarrollo', 'info');
    }
}

function refreshAreasComunes() {
    if (window.dashboard) {
        window.dashboard.updateAreasAvailability();
        window.dashboard.showNotification('Disponibilidad actualizada', 'success');
    }
}

function openAreaReservation() {
    if (window.dashboard) {
        window.dashboard.openQuickReserve();
    }
}

function triggerEmergency(type) {
    if (window.dashboard) {
        window.dashboard.triggerEmergency(type);
    }
}

function callEmergency(number) {
    if (window.dashboard) {
        window.dashboard.callEmergency(number);
    }
}

function askAIFinancialAdvice() {
    if (window.dashboard) {
        window.dashboard.askAIFinancialAdvice();
    }
}

function askAIMaintenanceHelp() {
    if (window.dashboard) {
        window.dashboard.askAIMaintenanceHelp();
    }
}

function refreshMaintenanceRequests() {
    if (window.dashboard) {
        window.dashboard.showNotification('Solicitudes actualizadas', 'success');
    }
}

function filterMaintenanceSchedule() {
    if (window.dashboard) {
        window.dashboard.filterMaintenanceSchedule();
    }
}

function updateCharts() {
    if (window.dashboard) {
        window.dashboard.showNotification('Gráficas actualizadas', 'success');
    }
}

function downloadConsumptionReport() {
    if (window.dashboard) {
        window.dashboard.downloadConsumptionReport();
    }
}

function askAIConsumptionTips() {
    if (window.dashboard) {
        window.dashboard.askAIConsumptionTips();
    }
}

function applyCustomDateRange() {
    if (window.dashboard) {
        window.dashboard.applyCustomDateRange();
    }
}

function openNewPost() {
    if (window.dashboard) {
        window.dashboard.openNewPost();
    }
}

function refreshCommunity() {
    if (window.dashboard) {
        window.dashboard.refreshCommunity();
    }
}

function filterCommunityFeed() {
    if (window.dashboard) {
        window.dashboard.filterCommunityFeed();
    }
}

function searchResidents() {
    if (window.dashboard) {
        window.dashboard.searchResidents();
    }
}

function filterResidents() {
    if (window.dashboard) {
        window.dashboard.filterResidents();
    }
}

function saveSettings() {
    if (window.dashboard) {
        window.dashboard.saveSettings();
    }
}

function changePassword() {
    if (window.dashboard) {
        window.dashboard.changePassword();
    }
}

function enableTwoFactor() {
    if (window.dashboard) {
        window.dashboard.enableTwoFactor();
    }
}

function viewLoginHistory() {
    if (window.dashboard) {
        window.dashboard.viewLoginHistory();
    }
}

function previewAvatar(input) {
    if (window.dashboard && input) {
        window.dashboard.previewAvatar(input);
    }
}

function viewBuildingStatus() {
    if (window.dashboard) {
        window.dashboard.showNotification('Estado del edificio: Todos los sistemas funcionando correctamente', 'info');
    }
}

function downloadFinancialReport() {
    if (window.dashboard) {
        window.dashboard.showLoading('Generando reporte financiero...');
        setTimeout(() => {
            window.dashboard.hideLoading();
            window.dashboard.showNotification('Reporte financiero descargado exitosamente', 'success');
        }, 2000);
    }
}

function showAllPayments() {
    if (window.dashboard) {
        window.dashboard.filterPayments();
        window.dashboard.showNotification('Mostrando todos los pagos', 'info');
    }
}

function openPaymentModal() {
    if (window.dashboard) {
        window.dashboard.openPaymentModal();
    }
}

function closePaymentModal() {
    if (window.dashboard) {
        window.dashboard.closePaymentModal();
    }
}

function selectAreaForPayment(area, price) {
    if (window.dashboard) {
        window.dashboard.selectAreaForPayment(area, price);
    }
}

function copyCryptoAddress() {
    if (window.dashboard) {
        window.dashboard.copyCryptoAddress();
    }
}

function processPayPalPayment() {
    if (window.dashboard) {
        window.dashboard.showNotification('Redirigiendo a PayPal...', 'info');
    }
}

function closeQRModal() {
    if (window.dashboard) {
        window.dashboard.closeQRModal();
    }
}

function downloadQRCode() {
    if (window.dashboard) {
        window.dashboard.downloadQRCode();
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new DashboardResidente();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardResidente;
}