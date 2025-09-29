class DashboardResidente {
    constructor() {
        this.currentSection = 'inicio';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
        this.initCharts();
        this.checkNotifications();
        this.generateCalendar();
    }

    bindEvents() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = link.getAttribute('href').substring(1);
                    this.switchSection(sectionId);
                });
            }
        });

        // Cerrar sesión
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        document.getElementById('user-menu-logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Notificaciones
        document.querySelector('.notification-icon').addEventListener('click', (e) => {
            this.toggleNotifications();
        });

        // Menú de usuario
        document.querySelector('.user-avatar').addEventListener('click', (e) => {
            this.toggleUserMenu();
        });

        // Cerrar menús al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-icon')) {
                this.closeNotifications();
            }
            if (!e.target.closest('.user-avatar')) {
                this.closeUserMenu();
            }
        });

        // Formularios modales
        document.getElementById('quickReserveForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuickReserve();
        });

        document.getElementById('maintenanceRequestForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMaintenanceRequest();
        });

        // Filtros
        document.getElementById('reservation-status-filter')?.addEventListener('change', (e) => {
            this.filterReservations();
        });

        document.getElementById('reservation-area-filter')?.addEventListener('change', (e) => {
            this.filterReservations();
        });

        document.getElementById('reservation-date-filter')?.addEventListener('change', (e) => {
            this.filterReservations();
        });

        // Selectores de período
        document.getElementById('consumption-period')?.addEventListener('change', (e) => {
            this.updateConsumptionData(e.target.value);
        });

        document.getElementById('detailed-consumption-period')?.addEventListener('change', (e) => {
            this.updateDetailedConsumption(e.target.value);
        });

        // Configuración - Tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.openTab(tabId);
            });
        });

        // Responsive menu
        this.initResponsiveMenu();
    }

    switchSection(sectionId) {
        // Ocultar sección actual
        document.querySelector('.dashboard-section.active').classList.remove('active');
        document.querySelector('.sidebar-menu a.active').classList.remove('active');

        // Mostrar nueva sección
        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`).classList.add('active');

        // Actualizar sección actual
        this.currentSection = sectionId;

        // Cargar datos específicos de la sección
        this.loadSectionData(sectionId);

        // Cerrar menús móviles
        this.closeMobileMenu();
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'finanzas':
                this.loadFinancialData();
                break;
            case 'reservas':
                this.loadReservationsData();
                break;
            case 'mantenimiento':
                this.loadMaintenanceData();
                break;
            case 'consumo':
                this.loadConsumptionData();
                break;
            case 'comunidad':
                this.loadCommunityData();
                break;
            case 'configuracion':
                this.loadSettingsData();
                break;
        }
    }

    // ========== FINANZAS ==========
    loadFinancialData() {
        // Simular carga de datos financieros
        const financialData = {
            totalPending: 335.25,
            paidThisMonth: 450.00,
            upcomingPayments: 185.50,
            paymentHistory: [
                { date: '2024-01-10', description: 'Mantenimiento Mensual', amount: 250.00, status: 'paid' },
                { date: '2024-01-05', description: 'Servicio de Agua', amount: 85.50, status: 'pending' },
                { date: '2023-12-28', description: 'Electricidad', amount: 120.75, status: 'paid' }
            ]
        };

        console.log('Datos financieros cargados:', financialData);
    }

    processPayment(button) {
        const paymentItem = button.closest('.payment-item');
        const amount = paymentItem.querySelector('.amount').textContent;
        const description = paymentItem.querySelector('h4').textContent;
        
        this.showNotification(`Procesando pago de ${amount}...`, 'info');
        
        // Simular procesamiento de pago
        setTimeout(() => {
            this.showNotification(`Pago de ${amount} procesado exitosamente`, 'success');
            paymentItem.style.opacity = '0.6';
            button.disabled = true;
            button.textContent = 'Pagado';
            button.classList.remove('btn-primary');
            button.classList.add('btn-outline');
        }, 2000);
    }

    downloadFinancialReport() {
        this.showNotification('Generando reporte financiero...', 'info');
        
        setTimeout(() => {
            this.showNotification('Reporte descargado correctamente', 'success');
        }, 1500);
    }

    showPaymentHistory() {
        this.showNotification('Mostrando historial de pagos...', 'info');
    }

    // ========== RESERVAS ==========
    loadReservationsData() {
        // Los datos ya están en el HTML, solo necesitamos inicializar el calendario
        this.generateCalendar();
    }

    generateCalendar() {
        const calendar = document.getElementById('reservation-calendar');
        if (!calendar) return;

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Actualizar mes actual
        document.getElementById('current-month').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Generar días de la semana
        calendar.innerHTML = '';
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day header';
            dayElement.textContent = day;
            calendar.appendChild(dayElement);
        });

        // Generar días del mes
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendar.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const isToday = today.getDate() === day && 
                           today.getMonth() === this.currentMonth && 
                           today.getFullYear() === this.currentYear;
            
            if (isToday) {
                dayElement.classList.add('today');
            }

            // Simular reservas (en una app real vendrían de una API)
            const hasReservation = day % 7 === 0 || day % 5 === 0;
            if (hasReservation) {
                dayElement.classList.add('has-reservation');
            }

            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                ${hasReservation ? '<div class="reservation-indicator">1 reserva</div>' : ''}
            `;

            calendar.appendChild(dayElement);
        }
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    filterReservations() {
        const statusFilter = document.getElementById('reservation-status-filter').value;
        const areaFilter = document.getElementById('reservation-area-filter').value;
        const dateFilter = document.getElementById('reservation-date-filter').value;
        
        this.showNotification(`Filtrando reservas...`, 'info');
        
        // En una app real, aquí se haría una petición a la API
        console.log('Filtros aplicados:', { statusFilter, areaFilter, dateFilter });
    }

    modifyReservation(button) {
        const reservationCard = button.closest('.reservation-card');
        const reservationName = reservationCard.querySelector('h4').textContent;
        
        this.showNotification(`Editando reserva: ${reservationName}`, 'info');
    }

    cancelReservation(button) {
        if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
            const reservationCard = button.closest('.reservation-card');
            const reservationName = reservationCard.querySelector('h4').textContent;
            
            this.showNotification(`Cancelando reserva: ${reservationName}`, 'info');
            
            setTimeout(() => {
                reservationCard.style.opacity = '0.5';
                reservationCard.querySelector('.status-badge').textContent = 'Cancelada';
                reservationCard.querySelector('.status-badge').className = 'status-badge cancelled';
                this.showNotification('Reserva cancelada exitosamente', 'success');
            }, 1000);
        }
    }

    // ========== MANTENIMIENTO ==========
    loadMaintenanceData() {
        // Los datos ya están en el HTML
        console.log('Datos de mantenimiento cargados');
    }

    openMaintenanceRequest() {
        document.getElementById('maintenanceRequestModal').classList.add('show');
    }

    closeMaintenanceRequest() {
        document.getElementById('maintenanceRequestModal').classList.remove('show');
    }

    submitMaintenanceRequest() {
        const form = document.getElementById('maintenanceRequestForm');
        const formData = new FormData(form);
        
        this.showNotification('Enviando solicitud de mantenimiento...', 'info');
        
        setTimeout(() => {
            this.showNotification('Solicitud enviada correctamente', 'success');
            this.closeMaintenanceRequest();
            form.reset();
        }, 1500);
    }

    viewRequestDetails(button) {
        const requestCard = button.closest('.request-card');
        const requestTitle = requestCard.querySelector('h4').textContent;
        
        this.showNotification(`Viendo detalles: ${requestTitle}`, 'info');
    }

    contactTechnician(button) {
        this.showNotification('Abriendo chat con el técnico...', 'info');
    }

    cancelRequest(button) {
        if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
            const requestCard = button.closest('.request-card');
            
            this.showNotification('Cancelando solicitud...', 'info');
            
            setTimeout(() => {
                requestCard.style.opacity = '0.5';
                requestCard.querySelector('.status-badge').textContent = 'Cancelada';
                this.showNotification('Solicitud cancelada exitosamente', 'success');
            }, 1000);
        }
    }

    // ========== CONSUMO ==========
    loadConsumptionData() {
        // Los gráficos se inicializan en initCharts()
        console.log('Datos de consumo cargados');
    }

    initCharts() {
        this.initConsumptionChart();
        this.initComparisonChart();
    }

    initConsumptionChart() {
        const ctx = document.getElementById('consumptionChart')?.getContext('2d');
        if (!ctx) return;

        this.consumptionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Agua (m³)',
                        data: [12, 15, 14, 16, 15, 13],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Electricidad (kWh)',
                        data: [180, 195, 210, 205, 220, 215],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Gas (m³)',
                        data: [9, 8, 9, 8, 9, 8],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Consumo Mensual de Servicios'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initComparisonChart() {
        const ctx = document.getElementById('comparisonChart')?.getContext('2d');
        if (!ctx) return;

        this.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Agua', 'Electricidad', 'Gas'],
                datasets: [
                    {
                        label: 'Mi Consumo',
                        data: [15.2, 210.5, 8.7],
                        backgroundColor: '#27ae60'
                    },
                    {
                        label: 'Promedio Vecinos',
                        data: [12.8, 195.3, 9.2],
                        backgroundColor: '#3498db'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Comparación con el Promedio'
                    }
                }
            }
        });
    }

    updateConsumptionChart() {
        if (this.consumptionChart) {
            this.consumptionChart.update();
        }
    }

    updateConsumptionData(period) {
        this.showNotification(`Actualizando datos del ${period}`, 'info');
    }

    updateDetailedConsumption(period) {
        this.showNotification(`Actualizando gráfico para ${period}`, 'info');
    }

    // ========== COMUNIDAD FUNCTIONS ==========
    filterNeighbors() {
        const searchTerm = document.querySelector('.search-input').value.toLowerCase();
        const towerFilter = document.querySelector('.filter-select').value;
        const neighborCards = document.querySelectorAll('.neighbor-card');
        
        neighborCards.forEach(card => {
            const name = card.querySelector('h5').textContent.toLowerCase();
            const tower = card.querySelector('p').textContent.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm);
            const matchesTower = towerFilter === 'all' || tower.includes(towerFilter);
            
            if (matchesSearch && matchesTower) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    contactNeighbor(button) {
        const card = button.closest('.neighbor-card');
        const name = card.querySelector('h5').textContent;
        this.showNotification(`Abriendo chat con ${name}`, 'info');
    }

    // ========== CONFIGURACIÓN FUNCTIONS ==========
    updateProfile(event) {
        event.preventDefault();
        this.showNotification('Perfil actualizado correctamente', 'success');
    }

    resetProfileForm() {
        document.getElementById('fullName').value = 'Juan Pérez';
        document.getElementById('email').value = 'juan.perez@email.com';
        document.getElementById('phone').value = '+1 234 567 8900';
        this.showNotification('Formulario restablecido', 'info');
    }

    changeProfilePhoto() {
        this.showNotification('Selecciona una nueva foto de perfil', 'info');
        // Aquí iría la lógica para subir una nueva foto
    }

    removeProfilePhoto() {
        if (confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
            document.querySelector('.current-photo').src = '/Frontend/img/avatar-default.jpg';
            this.showNotification('Foto de perfil eliminada', 'success');
        }
    }

    saveNotificationSettings() {
        this.showNotification('Preferencias de notificaciones guardadas', 'success');
    }

    resetNotificationSettings() {
        const switches = document.querySelectorAll('.notification-settings input[type="checkbox"]');
        switches.forEach(switchElement => {
            switchElement.checked = true;
        });
        this.showNotification('Preferencias restablecidas', 'info');
    }

    changePassword(event) {
        event.preventDefault();
        this.showNotification('Contraseña cambiada exitosamente', 'success');
    }

    changeLanguage(language) {
        this.showNotification(`Idioma cambiado a ${language}`, 'info');
    }

    changeTimezone(timezone) {
        this.showNotification(`Zona horaria cambiada a ${timezone}`, 'info');
    }

    changeTheme(theme) {
        this.showNotification(`Tema cambiado a ${theme}`, 'info');
    }

    changeDensity(density) {
        this.showNotification(`Densidad cambiada a ${density}`, 'info');
    }

    changeUnits(units) {
        this.showNotification(`Unidades cambiadas a ${units}`, 'info');
    }

    savePreferences() {
        this.showNotification('Preferencias guardadas correctamente', 'success');
    }

    resetPreferences() {
        document.querySelector('.preference-select').value = 'es';
        document.querySelectorAll('.preference-select')[1].value = 'gmt-5';
        document.querySelectorAll('.preference-select')[2].value = 'light';
        document.querySelectorAll('.preference-select')[3].value = 'comfortable';
        document.querySelectorAll('.preference-select')[4].value = 'metric';
        this.showNotification('Preferencias restablecidas', 'info');
    }

    // ========== FUNCIONES GENERALES ==========
    toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.toggle('show');
        this.closeUserMenu();
    }

    closeNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.remove('show');
    }

    toggleUserMenu() {
        const menu = document.querySelector('.user-menu');
        menu.classList.toggle('show');
        this.closeNotifications();
    }

    closeUserMenu() {
        const menu = document.querySelector('.user-menu');
        menu.classList.remove('show');
    }

    checkNotifications() {
        // Simular verificación de notificaciones
        setInterval(() => {
            const badge = document.querySelector('.notification-icon .badge');
            const currentCount = parseInt(badge.textContent);
            if (currentCount < 10) {
                badge.textContent = currentCount + 1;
            }
        }, 30000);
    }

    openQuickReserve() {
        document.getElementById('quickReserveModal').classList.add('show');
    }

    closeQuickReserve() {
        document.getElementById('quickReserveModal').classList.remove('show');
    }

    submitQuickReserve() {
        const form = document.getElementById('quickReserveForm');
        const formData = new FormData(form);
        
        this.showNotification('Enviando solicitud de reserva...', 'info');
        
        setTimeout(() => {
            this.showNotification('Reserva enviada correctamente', 'success');
            this.closeQuickReserve();
            form.reset();
        }, 1500);
    }

    openQuickReport() {
        this.showNotification('Funcionalidad de reporte rápido en desarrollo', 'info');
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
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
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }

    logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            this.showNotification('Cerrando sesión...', 'info');
            
            setTimeout(() => {
                window.location.href = '/Frontend/login.html';
            }, 1500);
        }
    }

    initResponsiveMenu() {
        const menuToggle = document.createElement('button');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.style.cssText = `
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 5px;
            width: 40px;
            height: 40px;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        `;

        document.body.appendChild(menuToggle);

        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('mobile-open');
        });

        const checkScreenSize = () => {
            if (window.innerWidth <= 768) {
                menuToggle.style.display = 'flex';
            } else {
                menuToggle.style.display = 'none';
                document.querySelector('.sidebar').classList.remove('mobile-open');
            }
        };

        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();
    }

    closeMobileMenu() {
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
        }
    }

    loadDashboardData() {
        this.loadResidentInfo();
    }

    loadResidentInfo() {
        const residentData = {
            name: 'Juan Pérez',
            apartment: '5A - Torre 1',
            email: 'juan.perez@email.com',
            phone: '+1 234 567 8900'
        };

        document.getElementById('resident-name').textContent = residentData.name;
        document.getElementById('apartment-info').textContent = residentData.apartment;
    }
}

// Funciones globales para uso en HTML
function switchSection(sectionId) {
    dashboard.switchSection(sectionId);
}

function toggleNotifications() {
    dashboard.toggleNotifications();
}

function toggleUserMenu() {
    dashboard.toggleUserMenu();
}

function openQuickReserve() {
    dashboard.openQuickReserve();
}

function closeQuickReserve() {
    dashboard.closeQuickReserve();
}

function openQuickReport() {
    dashboard.openQuickReport();
}

function openMaintenanceRequest() {
    dashboard.openMaintenanceRequest();
}

function closeMaintenanceRequest() {
    dashboard.closeMaintenanceRequest();
}

function downloadFinancialReport() {
    dashboard.downloadFinancialReport();
}

function showPaymentHistory() {
    dashboard.showPaymentHistory();
}

function viewBuildingStatus() {
    dashboard.showNotification('Estado del edificio: Todo normal', 'info');
}

function processPayment(button) {
    dashboard.processPayment(button);
}

function previousMonth() {
    dashboard.previousMonth();
}

function nextMonth() {
    dashboard.nextMonth();
}

function modifyReservation(button) {
    dashboard.modifyReservation(button);
}

function cancelReservation(button) {
    dashboard.cancelReservation(button);
}

function viewRequestDetails(button) {
    dashboard.viewRequestDetails(button);
}

function contactTechnician(button) {
    dashboard.contactTechnician(button);
}

function cancelRequest(button) {
    dashboard.cancelRequest(button);
}

function updateConsumptionChart() {
    dashboard.updateConsumptionChart();
}

function openNewPost() {
    dashboard.openNewPost();
}

function openTab(tabId) {
    dashboard.openTab(tabId);
}

function changeProfilePhoto() {
    dashboard.changeProfilePhoto();
}

function removeProfilePhoto() {
    dashboard.removeProfilePhoto();
}

function logoutOtherSessions() {
    dashboard.logoutOtherSessions();
}

function closeAlert(element) {
    element.closest('.alert-banner').style.display = 'none';
}

// Inicializar dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardResidente();
});

// Estilos CSS para animaciones
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .toast-notification {
        animation: slideInRight 0.3s ease-out;
    }

    .toast-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 15px;
    }

    .status-badge.cancelled {
        background: #ffeaea;
        color: var(--danger);
    }

    @media (max-width: 480px) {
        .toast-notification {
            min-width: 250px;
            right: 10px;
            left: 10px;
        }
    }
`;
document.head.appendChild(toastStyles);