// Dashboard Técnico - Script Principal
class DashboardTecnico {
    constructor() {
        this.currentSection = 'agenda';
        this.notifications = [];
        this.init();
    }

    init() {
        this.initializeTime();
        this.loadNotifications();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadSampleData();
    }

    initializeTime() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
            });
            const dateString = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).toUpperCase();

            const timeElement = document.getElementById('digital-time');
            const dateElement = document.getElementById('digital-date');
            
            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Sistema de notificaciones
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-center') && 
                !e.target.closest('.notifications-panel')) {
                this.hideNotifications();
            }
        });
    }

    switchSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remover activo de todos los items de navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activar item de navegación correspondiente
        const navItem = document.querySelector(`[href="#${sectionId}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentSection = sectionId;

        // Ejecutar acciones específicas de la sección
        this.onSectionChange(sectionId);
    }

    onSectionChange(sectionId) {
        switch(sectionId) {
            case 'tickets':
                this.loadTickets();
                break;
            case 'inventario':
                this.loadInventory();
                break;
            case 'preventivo':
                this.loadMaintenance();
                break;
            case 'reportes':
                this.updateCharts();
                break;
        }
    }

    loadNotifications() {
        // Simular carga de notificaciones
        this.notifications = [
            {
                id: 1,
                type: 'critical',
                title: 'ALERTA CRÍTICA: FALLA EN SISTEMA HVAC',
                message: 'Torre Norte - Nivel 12 | Temperatura crítica detectada',
                time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
                read: false
            },
            {
                id: 2,
                type: 'warning',
                title: 'MANTENIMIENTO PROGRAMADO',
                message: 'Ascensores Torre Este | Próximo en 2h 15m',
                time: new Date(Date.now() - 102 * 60 * 1000), // 1h 42m atrás
                read: false
            }
        ];

        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-count');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    toggleNotifications() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.classList.toggle('show');
            if (panel.classList.contains('show')) {
                this.markNotificationsAsRead();
            }
        }
    }

    hideNotifications() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.classList.remove('show');
        }
    }

    markNotificationsAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationBadge();
    }

    clearNotifications() {
        this.notifications = [];
        this.updateNotificationBadge();
        this.hideNotifications();
    }

    // Funciones para Tickets
    loadTickets() {
        const ticketsGrid = document.getElementById('ticketsGrid');
        if (!ticketsGrid) return;

        const tickets = [
            {
                id: 'TCK-7342',
                title: 'FALLA SISTEMA HVAC - TORRE NORTE',
                priority: 'critical',
                status: 'assigned',
                location: 'N12 - Sala Servidores',
                assignedTo: 'Carlos Martínez',
                createdAt: new Date('2024-01-17T08:00:00'),
                estimatedTime: '2h 30m'
            },
            {
                id: 'TCK-7343',
                title: 'MANTENIMIENTO ASCENSORES TORRE B',
                priority: 'high',
                status: 'scheduled',
                location: 'Torre B - Sistema Elevación',
                assignedTo: 'Carlos Martínez',
                createdAt: new Date('2024-01-17T10:30:00'),
                estimatedTime: '3h 15m'
            }
        ];

        ticketsGrid.innerHTML = tickets.map(ticket => `
            <div class="intervention-card ${ticket.priority}">
                <div class="card-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="priority ${ticket.priority}">${this.getPriorityText(ticket.priority)}</span>
                </div>
                <h4>${ticket.title}</h4>
                <div class="card-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${ticket.location}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-user-hard-hat"></i>
                        <span>Asignado: ${ticket.assignedTo}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${ticket.createdAt.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} | ${ticket.estimatedTime}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn primary" onclick="dashboard.startTicket(${ticket.id})">
                        <i class="fas fa-play"></i>
                        INICIAR
                    </button>
                    <button class="btn outline" onclick="dashboard.viewTicketDetails(${ticket.id})">
                        <i class="fas fa-info-circle"></i>
                        DETALLES
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPriorityText(priority) {
        const priorities = {
            'critical': 'CRÍTICO',
            'high': 'ALTA',
            'medium': 'MEDIA',
            'low': 'BAJA'
        };
        return priorities[priority] || 'MEDIA';
    }

    // Funciones para Inventario
    loadInventory() {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) return;

        const inventory = [
            {
                name: 'COMPRESOR HVAC TRANE 25TR',
                category: 'CLIMATIZACIÓN',
                stock: 2,
                minStock: 3,
                status: 'critical'
            },
            {
                name: 'MOTOR ASCENSOR OTIS 15HP',
                category: 'ELEVACIÓN',
                stock: 1,
                minStock: 2,
                status: 'critical'
            },
            {
                name: 'SENSOR TEMPERATURA DIGITAL',
                category: 'INSTRUMENTACIÓN',
                stock: 15,
                minStock: 20,
                status: 'low'
            }
        ];

        tableBody.innerHTML = inventory.map(item => `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>${item.stock}</td>
                <td>${item.minStock}</td>
                <td>
                    <span class="priority ${item.status}">
                        ${item.status === 'critical' ? 'CRÍTICO' : 'BAJO'}
                    </span>
                </td>
                <td>
                    <button class="btn outline small" onclick="dashboard.orderItem('${item.name}')">
                        <i class="fas fa-shopping-cart"></i>
                        SOLICITAR
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Funciones para Mantenimiento Preventivo
    loadMaintenance() {
        const maintenanceList = document.getElementById('maintenanceList');
        if (!maintenanceList) return;

        const maintenanceTasks = [
            {
                id: 'MTN-2341',
                equipment: 'SISTEMA HVAC TORRE NORTE',
                type: 'PREVENTIVO',
                scheduledDate: new Date('2024-01-18'),
                status: 'scheduled',
                duration: '4h'
            },
            {
                id: 'MTN-2342',
                equipment: 'ASCENSORES TORRE B',
                type: 'CORRECTIVO',
                scheduledDate: new Date('2024-01-17'),
                status: 'overdue',
                duration: '3h 15m'
            }
        ];

        maintenanceList.innerHTML = maintenanceTasks.map(task => `
            <div class="intervention-card ${task.status === 'overdue' ? 'critical' : 'medium'}">
                <div class="card-header">
                    <span class="ticket-id">${task.id}</span>
                    <span class="priority ${task.status === 'overdue' ? 'critical' : 'medium'}">
                        ${task.status === 'overdue' ? 'ATRASADO' : 'PROGRAMADO'}
                    </span>
                </div>
                <h4>${task.equipment}</h4>
                <div class="card-details">
                    <div class="detail-item">
                        <i class="fas fa-tools"></i>
                        <span>Tipo: ${task.type}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Programado: ${task.scheduledDate.toLocaleDateString('es-ES')}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Duración estimada: ${task.duration}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn primary" onclick="dashboard.startMaintenance('${task.id}')">
                        <i class="fas fa-play"></i>
                        INICIAR
                    </button>
                    <button class="btn outline" onclick="dashboard.viewMaintenanceDetails('${task.id}')">
                        <i class="fas fa-clipboard-list"></i>
                        CHECKLIST
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Sistema de Gráficos
    initializeCharts() {
        this.performanceChart = this.createPerformanceChart();
        this.ticketsChart = this.createTicketsChart();
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Eficiencia Operativa',
                    data: [92, 94, 91, 95, 94, 96, 94],
                    borderColor: '#00f5ff',
                    backgroundColor: 'rgba(0, 245, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 85,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8d0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b8b8d0'
                        }
                    }
                }
            }
        });
    }

    createTicketsChart() {
        const ctx = document.getElementById('ticketsChart');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completados', 'En Progreso', 'Pendientes', 'Críticos'],
                datasets: [{
                    data: [45, 8, 12, 3],
                    backgroundColor: [
                        '#00ff88',
                        '#00f5ff',
                        '#ffaa00',
                        '#ff2d75'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Actualizar datos de gráficos si es necesario
        if (this.performanceChart) {
            // Simular actualización de datos
            const newData = [93, 95, 92, 96, 95, 97, 95];
            this.performanceChart.data.datasets[0].data = newData;
            this.performanceChart.update();
        }
    }

    // Funciones de Utilidad
    loadSampleData() {
        // Cargar datos de ejemplo para demostración
        console.log('Dashboard técnico cargado correctamente');
    }

    // Funciones de Interfaz de Usuario
    openNewIntervention() {
        const modal = document.getElementById('interventionModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeInterventionModal() {
        const modal = document.getElementById('interventionModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    startIntervention(ticketId) {
        console.log(`Iniciando intervención para ticket ${ticketId}`);
        // Aquí iría la lógica para iniciar una intervención
        this.showNotification('Intervención iniciada', 'success');
    }

    prepareIntervention(ticketId) {
        console.log(`Preparando intervención para ticket ${ticketId}`);
        this.showNotification('Preparando materiales y herramientas', 'info');
    }

    // Sistema de Notificaciones Toast
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Navegación de fecha en agenda
    previousDay() {
        console.log('Navegando al día anterior');
        // Implementar lógica de navegación de fecha
    }

    nextDay() {
        console.log('Navegando al día siguiente');
        // Implementar lógica de navegación de fecha
    }

    syncAgenda() {
        this.showNotification('Sincronizando agenda...', 'info');
        // Simular sincronización
        setTimeout(() => {
            this.showNotification('Agenda sincronizada correctamente', 'success');
        }, 1500);
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardTecnico();
});

// Funciones globales para onclick handlers
function toggleNotifications() {
    if (window.dashboard) {
        window.dashboard.toggleNotifications();
    }
}

function clearNotifications() {
    if (window.dashboard) {
        window.dashboard.clearNotifications();
    }
}

function openNewIntervention() {
    if (window.dashboard) {
        window.dashboard.openNewIntervention();
    }
}

function closeInterventionModal() {
    if (window.dashboard) {
        window.dashboard.closeInterventionModal();
    }
}

function startIntervention(ticketId) {
    if (window.dashboard) {
        window.dashboard.startIntervention(ticketId);
    }
}

function prepareIntervention(ticketId) {
    if (window.dashboard) {
        window.dashboard.prepareIntervention(ticketId);
    }
}

function previousDay() {
    if (window.dashboard) {
        window.dashboard.previousDay();
    }
}

function nextDay() {
    if (window.dashboard) {
        window.dashboard.nextDay();
    }
}

function syncAgenda() {
    if (window.dashboard) {
        window.dashboard.syncAgenda();
    }
}

// Manejar envío del formulario de intervención
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('interventionForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (window.dashboard) {
                window.dashboard.showNotification('Intervención programada correctamente', 'success');
                window.dashboard.closeInterventionModal();
            }
        });
    }
});

// Estilos para notificaciones toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .notification-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: 10px;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: var(--shadow-card);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10000;
        min-width: 300px;
    }

    .notification-toast.show {
        transform: translateX(0);
    }

    .notification-toast.success {
        border-left: 4px solid var(--success);
    }

    .notification-toast.error {
        border-left: 4px solid var(--danger);
    }

    .notification-toast.warning {
        border-left: 4px solid var(--warning);
    }

    .notification-toast.info {
        border-left: 4px solid var(--info);
    }

    .toast-icon {
        font-size: 1.2rem;
    }

    .notification-toast.success .toast-icon {
        color: var(--success);
    }

    .notification-toast.error .toast-icon {
        color: var(--danger);
    }

    .notification-toast.warning .toast-icon {
        color: var(--warning);
    }

    .notification-toast.info .toast-icon {
        color: var(--info);
    }

    .toast-message {
        flex: 1;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .toast-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 1rem;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toast-close:hover {
        color: var(--text-primary);
    }
`;
document.head.appendChild(toastStyles);