// Dashboard del Residente - Funcionalidades Completas

// Variables globales
let currentSection = 'inicio';
let notificationsVisible = false;
let aiAssistantVisible = false;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadInitialData();
});

// Inicializar el dashboard
function initializeDashboard() {
    // Activar la sección de inicio por defecto
    switchSection('inicio');
    
    // Inicializar gráficos
    initializeCharts();
    
    // Generar calendario
    generateCalendar();
    
    // Cargar datos del usuario
    loadUserData();
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación del sidebar
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            switchSection(target);
        });
    });
    
    // Cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openLogoutModal();
    });
    
    document.getElementById('user-menu-logout').addEventListener('click', function(e) {
        e.preventDefault();
        openLogoutModal();
    });
    
    // Filtros
    document.getElementById('reservation-status-filter').addEventListener('change', filterReservations);
    document.getElementById('reservation-area-filter').addEventListener('change', filterReservations);
    document.getElementById('reservation-date-filter').addEventListener('change', filterReservations);
    
    document.getElementById('maintenance-status-filter').addEventListener('change', filterMaintenanceTickets);
    document.getElementById('maintenance-priority-filter').addEventListener('change', filterMaintenanceTickets);
    
    // Tabs de comunidad
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchCommunityTab(this.getAttribute('data-tab'));
        });
    });
    
    // Modales
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Cargar datos iniciales
function loadInitialData() {
    // Simular carga de datos
    setTimeout(() => {
        updateDashboardStats();
        loadRecentActivities();
    }, 1000);
}

// Cambiar sección
function switchSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    document.getElementById(sectionId).classList.add('active');
    
    // Actualizar menú activo
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    currentSection = sectionId;
    
    // Ejecutar acciones específicas de cada sección
    switch(sectionId) {
        case 'reservas':
            refreshCalendar();
            break;
        case 'consumo':
            updateCharts();
            break;
        case 'mantenimiento':
            refreshMaintenanceTickets();
            break;
    }
}

// Cargar datos del usuario
function loadUserData() {
    // En una implementación real, esto vendría de una API
    const userData = {
        name: 'Juan Pérez',
        apartment: 'Departamento 5A - Torre 1',
        email: 'juan.perez@email.com',
        phone: '+1 234 567 8900'
    };
    
    document.getElementById('sidebar-resident-name').textContent = userData.name;
    document.getElementById('resident-name').textContent = userData.name;
    document.getElementById('apartment-info').textContent = userData.apartment;
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
    // Simular actualización de datos
    const stats = {
        pendingPayments: 2,
        pendingAmount: 335.25,
        activeReservations: 1,
        maintenanceRequests: 1
    };
    
    // Actualizar UI
    document.querySelectorAll('.status-card h3')[0].textContent = stats.pendingPayments;
    document.querySelectorAll('.status-card .status-amount')[0].textContent = `$${stats.pendingAmount}`;
    document.querySelectorAll('.status-card h3')[1].textContent = stats.activeReservations;
    document.querySelectorAll('.status-card h3')[2].textContent = stats.maintenanceRequests;
}

// Cargar actividades recientes
function loadRecentActivities() {
    // Simular carga de actividades
    const activities = [
        { type: 'payment', message: 'Pago de mantenimiento realizado', time: 'Hace 2 horas' },
        { type: 'reservation', message: 'Reserva de sala confirmada', time: 'Hace 1 día' },
        { type: 'maintenance', message: 'Solicitud de mantenimiento enviada', time: 'Hace 2 días' }
    ];
    
    // En una implementación real, se actualizaría la UI con estas actividades
}

// Notificaciones
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    notificationsVisible = !notificationsVisible;
    
    if (notificationsVisible) {
        dropdown.classList.add('show');
    } else {
        dropdown.classList.remove('show');
    }
}

// Cerrar alerta
function closeAlert(button) {
    const alert = button.closest('.alert-banner');
    alert.style.display = 'none';
}

// Procesar pago
function processPayment(button) {
    const paymentItem = button.closest('.payment-item');
    const amount = paymentItem.querySelector('.amount').textContent;
    const description = paymentItem.querySelector('h4').textContent;
    
    // Simular procesamiento de pago
    showNotification(`Procesando pago de ${amount} por ${description}`, 'info');
    
    setTimeout(() => {
        showNotification(`Pago de ${amount} procesado exitosamente`, 'success');
        paymentItem.querySelector('.status-badge').textContent = 'Pagado';
        paymentItem.querySelector('.status-badge').className = 'status-badge paid';
        button.textContent = 'Recibo';
        button.onclick = function() { downloadReceipt(this); };
    }, 2000);
}

// Descargar recibo
function downloadReceipt(button) {
    showNotification('Descargando recibo...', 'info');
    // En una implementación real, se descargaría el PDF
    setTimeout(() => {
        showNotification('Recibo descargado exitosamente', 'success');
    }, 1000);
}

// Modificar reserva
function modifyReservation(button) {
    const reservationCard = button.closest('.reservation-card');
    const reservationName = reservationCard.querySelector('h4').textContent;
    
    showNotification(`Editando reserva: ${reservationName}`, 'info');
    openQuickReserve();
}

// Cancelar reserva
function cancelReservation(button) {
    const reservationCard = button.closest('.reservation-card');
    const reservationName = reservationCard.querySelector('h4').textContent;
    
    if (confirm(`¿Estás seguro de que deseas cancelar la reserva: ${reservationName}?`)) {
        showNotification(`Reserva ${reservationName} cancelada`, 'success');
        reservationCard.style.opacity = '0.5';
        reservationCard.querySelector('.status-badge').textContent = 'Cancelada';
        reservationCard.querySelector('.status-badge').className = 'status-badge cancelled';
        reservationCard.querySelector('.reservation-actions').innerHTML = '';
    }
}

// Ver estado del edificio
function viewBuildingStatus() {
    showNotification('Cargando estado del edificio...', 'info');
    // En una implementación real, se abriría un modal con el estado
}

// Filtrar reservas
function filterReservations() {
    const statusFilter = document.getElementById('reservation-status-filter').value;
    const areaFilter = document.getElementById('reservation-area-filter').value;
    const dateFilter = document.getElementById('reservation-date-filter').value;
    
    // Simular filtrado
    showNotification('Aplicando filtros...', 'info');
    
    // En una implementación real, se filtrarían las reservas en la UI
    setTimeout(() => {
        showNotification('Filtros aplicados', 'success');
    }, 500);
}

// Filtrar tickets de mantenimiento
function filterMaintenanceTickets() {
    const statusFilter = document.getElementById('maintenance-status-filter').value;
    const priorityFilter = document.getElementById('maintenance-priority-filter').value;
    
    // Simular filtrado
    showNotification('Aplicando filtros de mantenimiento...', 'info');
    
    // En una implementación real, se filtrarían los tickets en la UI
    setTimeout(() => {
        showNotification('Filtros de mantenimiento aplicados', 'success');
    }, 500);
}

// Generar calendario
function generateCalendar() {
    const calendar = document.getElementById('reservation-calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Días de la semana
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Encabezados de días
    let calendarHTML = '<div class="calendar-week">';
    weekdays.forEach(day => {
        calendarHTML += `<div class="calendar-day header">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    // Días del mes
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let dayCount = 1;
    for (let i = 0; i < 6; i++) {
        calendarHTML += '<div class="calendar-week">';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else if (dayCount > daysInMonth) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else {
                const dayClass = getDayClass(currentYear, currentMonth, dayCount);
                calendarHTML += `<div class="calendar-day ${dayClass}" onclick="selectDate(${dayCount})">${dayCount}</div>`;
                dayCount++;
            }
        }
        calendarHTML += '</div>';
        if (dayCount > daysInMonth) break;
    }
    
    calendar.innerHTML = calendarHTML;
    updateCalendarHeader(currentMonth, currentYear);
}

// Actualizar encabezado del calendario
function updateCalendarHeader(month, year) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
}

// Obtener clase CSS para un día específico
function getDayClass(year, month, day) {
    // Simular disponibilidad (en una implementación real, vendría de una API)
    const date = new Date(year, month, day);
    const today = new Date();
    
    if (date < today) {
        return 'past';
    }
    
    // Días aleatorios con reservas para demostración
    const reservedDays = [5, 12, 19, 26];
    if (reservedDays.includes(day)) {
        return 'reserved';
    }
    
    // Días aleatorios disponibles para demostración
    const availableDays = [7, 14, 21, 28];
    if (availableDays.includes(day)) {
        return 'available';
    }
    
    return '';
}

// Seleccionar fecha en el calendario
function selectDate(day) {
    const currentDate = new Date();
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    showNotification(`Fecha seleccionada: ${selectedDate.toLocaleDateString()}`, 'info');
    openQuickReserve();
}

// Mes anterior
function previousMonth() {
    // En una implementación real, se cambiaría al mes anterior
    showNotification('Cargando mes anterior...', 'info');
}

// Mes siguiente
function nextMonth() {
    // En una implementación real, se cambiaría al mes siguiente
    showNotification('Cargando mes siguiente...', 'info');
}

// Actualizar calendario
function refreshCalendar() {
    generateCalendar();
}

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de consumo
    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    const consumptionChart = new Chart(consumptionCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Agua (m³)',
                    data: [12, 15, 13, 16, 14, 15],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Electricidad (kWh)',
                    data: [180, 195, 210, 205, 220, 215],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Gas (m³)',
                    data: [9, 8, 9, 8, 9, 9],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(100, 116, 139, 0.2)'
                    },
                    ticks: {
                        color: '#f8fafc'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(100, 116, 139, 0.2)'
                    },
                    ticks: {
                        color: '#f8fafc'
                    }
                }
            }
        }
    });
    
    // Gráfico de comparación
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    const comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Agua', 'Electricidad', 'Gas'],
            datasets: [
                {
                    label: 'Tu Consumo',
                    data: [15.2, 210.5, 8.7],
                    backgroundColor: 'rgba(99, 102, 241, 0.8)'
                },
                {
                    label: 'Promedio Edificio',
                    data: [12.8, 195.3, 9.2],
                    backgroundColor: 'rgba(100, 116, 139, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(100, 116, 139, 0.2)'
                    },
                    ticks: {
                        color: '#f8fafc'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(100, 116, 139, 0.2)'
                    },
                    ticks: {
                        color: '#f8fafc'
                    }
                }
            }
        }
    });
}

// Actualizar gráficos
function updateCharts() {
    // En una implementación real, se actualizarían los datos de los gráficos
    console.log('Actualizando gráficos...');
}

// Ver detalles de solicitud de mantenimiento
function viewRequestDetails(button) {
    const ticket = button.closest('.ticket-card');
    const ticketId = ticket.querySelector('.ticket-id').textContent;
    const ticketTitle = ticket.querySelector('h4').textContent;
    
    showNotification(`Abriendo detalles del ticket ${ticketId}: ${ticketTitle}`, 'info');
    // En una implementación real, se abriría un modal con los detalles completos
}

// Contactar técnico
function contactTechnician(button) {
    const ticket = button.closest('.ticket-card');
    const technician = ticket.querySelector('.ticket-assignee strong').textContent;
    
    showNotification(`Contactando a ${technician}...`, 'info');
    // En una implementación real, se abriría un chat o se iniciaría una llamada
}

// Cancelar solicitud
function cancelRequest(button) {
    const ticket = button.closest('.ticket-card');
    const ticketId = ticket.querySelector('.ticket-id').textContent;
    
    if (confirm(`¿Estás seguro de que deseas cancelar la solicitud ${ticketId}?`)) {
        showNotification(`Solicitud ${ticketId} cancelada`, 'success');
        ticket.remove();
    }
}

// Reabrir ticket
function reopenTicket(button) {
    const ticket = button.closest('.ticket-card');
    const ticketId = ticket.querySelector('.ticket-id').textContent;
    
    showNotification(`Reabriendo ticket ${ticketId}...`, 'info');
    // En una implementación real, se cambiaría el estado del ticket
    ticket.querySelector('.status-badge').textContent = 'Abierto';
    ticket.querySelector('.status-badge').className = 'status-badge open';
    ticket.classList.remove('resolved');
    ticket.classList.add('medium');
}

// Actualizar tickets de mantenimiento
function refreshMaintenanceTickets() {
    // En una implementación real, se cargarían los tickets desde una API
    console.log('Actualizando tickets de mantenimiento...');
}

// Cambiar pestaña de comunidad
function switchCommunityTab(tabId) {
    // Actualizar tabs activos
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Mostrar panel activo
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabId}-panel`).classList.add('active');
}

// Abrir nueva publicación
function openNewPost() {
    showNotification('Abriendo editor de publicación...', 'info');
    // En una implementación real, se abriría un modal para crear una publicación
}

// Modales
function openQuickReserve() {
    document.getElementById('quick-reserve-modal').classList.add('show');
}

function openQuickReport() {
    document.getElementById('maintenance-request-modal').classList.add('show');
}

function openMaintenanceRequest() {
    document.getElementById('maintenance-request-modal').classList.add('show');
}

function openLogoutModal() {
    document.getElementById('logout-modal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Cerrar sesión
function logout() {
    showNotification('Cerrando sesión...', 'info');
    
    setTimeout(() => {
        // En una implementación real, se redirigiría al login
        alert('¡Hasta luego! Sesión cerrada exitosamente.');
        // window.location.href = '/login';
    }, 1000);
}

// Asistente Virtual IA
function toggleAIAssistant() {
    const aiChat = document.querySelector('.ai-chat-container');
    aiAssistantVisible = !aiAssistantVisible;
    
    if (aiAssistantVisible) {
        aiChat.classList.add('show');
    } else {
        aiChat.classList.remove('show');
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg-solid);
        border: 1px solid var(--border-color);
        border-left: 4px solid ${getNotificationColor(type)};
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        max-width: 400px;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Obtener icono para notificación
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

// Obtener color para notificación
function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#6366f1';
    }
}

// Descargar reporte financiero
function downloadFinancialReport() {
    showNotification('Generando reporte financiero...', 'info');
    
    setTimeout(() => {
        showNotification('Reporte financiero descargado exitosamente', 'success');
        // En una implementación real, se descargaría el archivo
    }, 2000);
}

// Cambiar contraseña
function changePassword() {
    showNotification('Abriendo formulario para cambiar contraseña...', 'info');
    // En una implementación real, se abriría un modal
}

// Activar autenticación de dos factores
function enable2FA() {
    showNotification('Configurando autenticación de dos factores...', 'info');
    // En una implementación real, se guiaría al usuario por el proceso de configuración
}

// Menú de usuario
function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.style.opacity = userMenu.style.opacity === '1' ? '0' : '1';
    userMenu.style.visibility = userMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
    userMenu.style.transform = userMenu.style.transform === 'translateY(0px)' ? 'translateY(-10px)' : 'translateY(0px)';
}

// Cerrar menús al hacer clic fuera
document.addEventListener('click', function(e) {
    // Cerrar menú de usuario
    if (!e.target.closest('.user-avatar')) {
        const userMenu = document.querySelector('.user-menu');
        userMenu.style.opacity = '0';
        userMenu.style.visibility = 'hidden';
        userMenu.style.transform = 'translateY(-10px)';
    }
    
    // Cerrar notificaciones
    if (!e.target.closest('.notification-icon') && !e.target.closest('.notifications-dropdown')) {
        const notifications = document.getElementById('notificationsDropdown');
        if (notifications) {
            notifications.classList.remove('show');
            notificationsVisible = false;
        }
    }
});

// Animación CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
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
    
    .notification-toast {
        animation: slideInRight 0.3s ease;
    }
`;
document.head.appendChild(style);