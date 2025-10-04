// dashboard-residente.js
// Dashboard Inteligente del Residente - BuildingPRO - Versión Corregida

class DashboardResidente {
    constructor() {
        this.currentSection = 'inicio';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.reservations = [];
        this.maintenanceTickets = [];
        this.communityPosts = [];
        this.chatMessages = [];
        this.financialData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserData();
        this.loadInitialData();
        this.generateCalendar();
        this.initCharts();
        this.showSection('inicio');
        this.setupRealTimeUpdates();
    }

    bindEvents() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Cerrar sesión
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.openLogoutModal();
        });

        document.getElementById('user-menu-logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.openLogoutModal();
        });

        // Notificaciones
        document.querySelector('.notification-icon').addEventListener('click', this.toggleNotifications.bind(this));

        // Menú de usuario
        document.querySelector('.user-avatar').addEventListener('click', this.toggleUserMenu.bind(this));

        // Cerrar menús al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-icon')) {
                this.hideNotifications();
            }
            if (!e.target.closest('.user-avatar')) {
                this.hideUserMenu();
            }
        });

        // Asistente IA
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });

        // Chat comunitario
        document.getElementById('community-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCommunityMessage();
            }
        });

        // Filtros del foro
        document.querySelectorAll('.forum-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.filterForumPosts(tab.dataset.tab);
                document.querySelectorAll('.forum-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Fecha actual por defecto en modales
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('reserve-date').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('reserve-start').value = '18:00';
        document.getElementById('reserve-end').value = '20:00';
    }

    loadUserData() {
        const userData = {
            name: 'Juan Pérez',
            apartment: 'Departamento 5A - Torre 1',
            email: 'juan.perez@email.com',
            phone: '+34 612 345 678'
        };

        document.getElementById('resident-name').textContent = userData.name;
        document.getElementById('sidebar-resident-name').textContent = userData.name;
        document.getElementById('apartment-info').textContent = userData.apartment;
        document.getElementById('sidebar-apartment-info').textContent = userData.apartment;
        document.getElementById('user-name').value = userData.name;
        document.getElementById('user-email').value = userData.email;
        document.getElementById('user-phone').value = userData.phone;
        document.getElementById('user-apartment').value = userData.apartment;
    }

    loadInitialData() {
        // Datos de ejemplo
        this.reservations = [
            {
                id: 1,
                area: 'Sala de Eventos',
                date: '2024-01-20',
                startTime: '15:00',
                endTime: '18:00',
                people: 25,
                purpose: 'Celebración de cumpleaños',
                status: 'confirmed'
            },
            {
                id: 2,
                area: 'Gimnasio',
                date: '2024-01-22',
                startTime: '07:00',
                endTime: '08:00',
                people: 1,
                purpose: 'Entrenamiento personal',
                status: 'pending'
            }
        ];

        this.maintenanceTickets = [
            {
                id: 'MT-001',
                title: 'Fuga de agua en grifería',
                description: 'Se presenta fuga constante de agua en la grifería del baño principal.',
                category: 'fontaneria',
                priority: 'high',
                status: 'in-progress',
                date: '2024-01-15',
                assignee: 'Carlos Martínez',
                updates: [
                    { date: '2024-01-15 10:30', message: 'Solicitud recibida', technician: 'Sistema' },
                    { date: '2024-01-15 11:15', message: 'Asignado a técnico', technician: 'Administración' }
                ]
            },
            {
                id: 'MT-002',
                title: 'Problema con enchufes eléctricos',
                description: 'Los enchufes de la habitación principal no funcionan correctamente.',
                category: 'electricidad',
                priority: 'medium',
                status: 'open',
                date: '2024-01-12',
                assignee: null,
                updates: [
                    { date: '2024-01-12 09:45', message: 'Solicitud recibida', technician: 'Sistema' }
                ]
            }
        ];

        this.communityPosts = [
            {
                id: 1,
                author: 'María González',
                category: 'suggestion',
                title: 'Propuesta: Horario extendido para el gimnasio',
                content: 'Me gustaría proponer extender el horario del gimnasio hasta las 10pm entre semana.',
                date: '2024-01-14',
                likes: 8,
                comments: 12
            },
            {
                id: 2,
                author: 'Carlos Sánchez',
                category: 'question',
                title: '¿Cómo funciona el nuevo sistema de reciclaje?',
                content: 'He visto los nuevos contenedores pero no estoy seguro de cómo separar correctamente los materiales.',
                date: '2024-01-13',
                likes: 5,
                comments: 8
            }
        ];

        this.chatMessages = [
            {
                id: 1,
                sender: 'María González',
                message: 'Hola a todos, ¿alguien sabe si habrá corte de agua mañana?',
                time: '10:15 AM',
                type: 'received'
            },
            {
                id: 2,
                sender: 'Juan Pérez',
                message: 'Hola María, según el anuncio no habrá corte esta semana',
                time: '10:16 AM',
                type: 'sent'
            }
        ];

        this.updateUI();
    }

    updateUI() {
        this.updateReservationsGrid();
        this.updateMaintenanceTickets();
        this.updateCommunityPosts();
        this.updateChatMessages();
        this.updateStats();
    }

    switchSection(sectionId) {
        this.showSection(sectionId);
        
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`).classList.add('active');
    }

    showSection(sectionId) {
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            switch(sectionId) {
                case 'reservas':
                    this.generateCalendar();
                    break;
                case 'finanzas':
                    this.updateFinancialCharts();
                    break;
                case 'mantenimiento':
                    this.filterMaintenanceTickets();
                    break;
                case 'comunidad':
                    this.updateChatMessages();
                    this.updateCommunityPosts();
                    break;
            }
        }
    }

    // Sistema de Reservas
    generateCalendar() {
        const calendar = document.getElementById('reservation-calendar');
        if (!calendar) return;

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        document.getElementById('current-month').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        let calendarHTML = '';

        weekdays.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });

        for (let i = 0; i < startingDay; i++) {
            calendarHTML += `<div class="calendar-day other-month"></div>`;
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isToday = date.toDateString() === today.toDateString();
            const hasReservation = this.hasReservationOnDate(date);

            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (hasReservation) dayClass += ' has-reservation';

            calendarHTML += `
                <div class="${dayClass}" onclick="dashboard.selectDate(${day})">
                    <div class="day-number">${day}</div>
                    ${hasReservation ? '<div class="reservation-indicator">Reserva</div>' : ''}
                </div>
            `;
        }

        calendar.innerHTML = calendarHTML;
    }

    hasReservationOnDate(date) {
        return this.reservations.some(reservation => {
            const reservationDate = new Date(reservation.date);
            return reservationDate.toDateString() === date.toDateString();
        });
    }

    selectDate(day) {
        const selectedDate = new Date(this.currentYear, this.currentMonth, day);
        this.showNotification(`Fecha seleccionada: ${selectedDate.toLocaleDateString()}`, 'info');
        this.openQuickReserve();
        
        // Establecer la fecha seleccionada en el modal
        document.getElementById('reserve-date').value = selectedDate.toISOString().split('T')[0];
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

    updateReservationsGrid() {
        const grid = document.querySelector('.reservations-grid');
        if (!grid) return;

        grid.innerHTML = this.reservations.map(reservation => `
            <div class="reservation-card ${reservation.status}">
                <div class="reservation-header">
                    <h4>${reservation.area}</h4>
                    <span class="status-badge ${reservation.status}">
                        ${reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                </div>
                <div class="reservation-details">
                    <p><i class="fas fa-calendar"></i> ${new Date(reservation.date).toLocaleDateString()}</p>
                    <p><i class="fas fa-clock"></i> ${reservation.startTime} - ${reservation.endTime}</p>
                    <p><i class="fas fa-users"></i> ${reservation.people} personas</p>
                    ${reservation.purpose ? `<p><i class="fas fa-info-circle"></i> ${reservation.purpose}</p>` : ''}
                </div>
                <div class="reservation-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.modifyReservation(${reservation.id})">Modificar</button>
                    <button class="btn btn-outline btn-sm" onclick="dashboard.cancelReservation(${reservation.id})">Cancelar</button>
                </div>
            </div>
        `).join('');
    }

    // Sistema de Mantenimiento
    updateMaintenanceTickets() {
        const ticketsList = document.getElementById('tickets-list');
        if (!ticketsList) return;

        ticketsList.innerHTML = this.maintenanceTickets.map(ticket => `
            <div class="ticket-card ${ticket.priority}">
                <div class="ticket-header">
                    <div class="ticket-info">
                        <h4>${ticket.title}</h4>
                        <div class="ticket-meta">
                            <span class="ticket-id">${ticket.id}</span>
                            <span class="ticket-date">${new Date(ticket.date).toLocaleDateString()}</span>
                            <span class="ticket-category">${this.getCategoryName(ticket.category)}</span>
                        </div>
                    </div>
                    <div class="ticket-status">
                        <span class="status-badge ${ticket.status}">
                            ${this.getStatusName(ticket.status)}
                        </span>
                        <span class="priority-badge ${ticket.priority}">
                            ${this.getPriorityName(ticket.priority)} Prioridad
                        </span>
                    </div>
                </div>
                <div class="ticket-content">
                    <p>${ticket.description}</p>
                    <div class="ticket-updates">
                        <h5>Actualizaciones:</h5>
                        ${ticket.updates.map(update => `
                            <div class="update-item">
                                <span class="update-date">${update.date}</span>
                                <span class="update-message">${update.message}</span>
                                ${update.technician !== 'Sistema' ? `<span class="update-technician">por ${update.technician}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="ticket-footer">
                    <div class="ticket-assignee">
                        ${ticket.assignee ? 
                            `<i class="fas fa-user"></i> Asignado a: <strong>${ticket.assignee}</strong>` : 
                            '<i class="fas fa-clock"></i> Pendiente de asignación'
                        }
                    </div>
                    <div class="ticket-actions">
                        <button class="btn btn-outline btn-sm" onclick="dashboard.viewRequestDetails('${ticket.id}')">Detalles</button>
                        ${ticket.assignee ? `<button class="btn btn-outline btn-sm" onclick="dashboard.contactTechnician('${ticket.id}')">Contactar</button>` : ''}
                        ${ticket.status === 'open' ? `<button class="btn btn-outline btn-sm" onclick="dashboard.cancelRequest('${ticket.id}')">Cancelar</button>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        this.updateMaintenanceStats();
    }

    getCategoryName(category) {
        const categories = {
            'electricidad': 'Eléctrico',
            'fontaneria': 'Fontanería',
            'ascensor': 'Ascensor',
            'limpieza': 'Limpieza',
            'otros': 'Otro'
        };
        return categories[category] || category;
    }

    getStatusName(status) {
        const statuses = {
            'open': 'Abierto',
            'in-progress': 'En Proceso',
            'resolved': 'Resuelto'
        };
        return statuses[status] || status;
    }

    getPriorityName(priority) {
        const priorities = {
            'low': 'Baja',
            'medium': 'Media',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return priorities[priority] || priority;
    }

    updateMaintenanceStats() {
        const openTickets = this.maintenanceTickets.filter(t => t.status === 'open').length;
        const progressTickets = this.maintenanceTickets.filter(t => t.status === 'in-progress').length;
        const resolvedTickets = this.maintenanceTickets.filter(t => t.status === 'resolved').length;

        document.getElementById('open-tickets').textContent = openTickets;
        document.getElementById('progress-tickets').textContent = progressTickets;
        document.getElementById('resolved-tickets').textContent = resolvedTickets;
    }

    // Sistema de Comunidad
    updateCommunityPosts() {
        const forumPosts = document.getElementById('forum-posts');
        if (!forumPosts) return;

        forumPosts.innerHTML = this.communityPosts.map(post => `
            <div class="community-post" data-category="${post.category}">
                <div class="post-header">
                    <div class="post-author">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=6366f1&color=fff" alt="${post.author}">
                        <div>
                            <h4>${post.author}</h4>
                            <span class="post-time">${new Date(post.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <span class="post-badge ${post.category}">${this.getPostCategoryName(post.category)}</span>
                </div>
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                </div>
                <div class="post-actions">
                    <button class="post-action-btn" onclick="dashboard.likePost(${post.id})">
                        <i class="fas fa-thumbs-up"></i> Me gusta (${post.likes})
                    </button>
                    <button class="post-action-btn" onclick="dashboard.showComments(${post.id})">
                        <i class="fas fa-comment"></i> Comentar (${post.comments})
                    </button>
                    <button class="post-action-btn" onclick="dashboard.sharePost(${post.id})">
                        <i class="fas fa-share"></i> Compartir
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPostCategoryName(category) {
        const categories = {
            'suggestion': 'Sugerencia',
            'complaint': 'Queja',
            'event': 'Evento',
            'announcement': 'Anuncio',
            'question': 'Pregunta'
        };
        return categories[category] || category;
    }

    updateChatMessages() {
        const chatMessages = document.getElementById('community-chat-messages');
        if (!chatMessages) return;

        chatMessages.innerHTML = this.chatMessages.map(message => `
            <div class="chat-message ${message.type}">
                <div class="message-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender)}&background=6366f1&color=fff" alt="${message.sender}">
                </div>
                <div class="message-content">
                    ${message.type === 'received' ? `<div class="message-sender">${message.sender}</div>` : ''}
                    <div class="message-text">${message.message}</div>
                    <div class="message-time">${message.time}</div>
                </div>
            </div>
        `).join('');

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Sistema Financiero
    initCharts() {
        this.initConsumptionChart();
        this.initFinancialCharts();
    }

    initConsumptionChart() {
        const ctx = document.getElementById('consumptionChart');
        if (!ctx) return;

        const consumptionData = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'Agua (m³)',
                    data: [12, 15, 18, 14, 16, 20, 22, 19, 17, 15, 13, 11],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Electricidad (kWh)',
                    data: [180, 195, 210, 190, 205, 220, 240, 230, 215, 200, 185, 170],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Gas (m³)',
                    data: [8, 9, 10, 8, 9, 11, 12, 10, 9, 8, 7, 6],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        this.consumptionChart = new Chart(ctx, {
            type: 'line',
            data: consumptionData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#cbd5e1',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    initFinancialCharts() {
        this.initExpensesChart();
        this.initPaymentsDistributionChart();
        this.initNeighborsComparisonChart();
        this.initFinancialProjectionChart();
    }

    initExpensesChart() {
        const ctx = document.getElementById('expensesChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Gastos Mensuales',
                    data: [335, 420, 380, 450, 520, 480],
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    initPaymentsDistributionChart() {
        const ctx = document.getElementById('paymentsDistributionChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Mantenimiento', 'Agua', 'Luz', 'Gas', 'Otros'],
                datasets: [{
                    data: [45, 20, 15, 12, 8],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#cbd5e1' }
                    }
                }
            }
        });
    }

    initNeighborsComparisonChart() {
        const ctx = document.getElementById('neighborsComparisonChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Mantenimiento', 'Agua', 'Luz', 'Gas', 'Servicios'],
                datasets: [
                    {
                        label: 'Tu Consumo',
                        data: [85, 75, 90, 80, 70],
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Promedio Vecinos',
                        data: [75, 65, 80, 70, 60],
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(51, 65, 85, 0.3)' },
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        pointLabels: { color: '#94a3b8' },
                        ticks: { color: '#94a3b8', backdropColor: 'transparent' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                }
            }
        });
    }

    initFinancialProjectionChart() {
        const ctx = document.getElementById('financialProjectionChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Gastos Reales',
                        data: [335, 420, 380, 450, 520, 480],
                        borderColor: 'rgba(99, 102, 241, 1)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Proyección',
                        data: [320, 400, 420, 480, 500, 520],
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderDash: [5, 5],
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    updateFinancialCharts() {
        // Actualizar gráficas financieras si es necesario
        if (this.consumptionChart) {
            this.consumptionChart.update();
        }
    }

    updateStats() {
        // Actualizar estadísticas generales
        const pendingPayments = 2;
        const activeReservations = this.reservations.filter(r => r.status === 'confirmed').length;
        const maintenanceRequests = this.maintenanceTickets.filter(t => t.status !== 'resolved').length;

        document.querySelectorAll('.status-card h3')[0].textContent = pendingPayments;
        document.querySelectorAll('.status-card h3')[1].textContent = activeReservations;
        document.querySelectorAll('.status-card h3')[2].textContent = maintenanceRequests;
    }

    // Sistema de Notificaciones
    toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.toggle('show');
        this.hideUserMenu();
    }

    hideNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.classList.remove('show');
    }

    toggleUserMenu() {
        const menu = document.querySelector('.user-menu');
        menu.classList.toggle('show');
        this.hideNotifications();
    }

    hideUserMenu() {
        const menu = document.querySelector('.user-menu');
        menu.classList.remove('show');
    }

    // Sistema de Filtros
    filterMaintenanceTickets() {
        const statusFilter = document.getElementById('maintenance-status-filter').value;
        const priorityFilter = document.getElementById('maintenance-priority-filter').value;
        const categoryFilter = document.getElementById('maintenance-category-filter').value;
        const searchFilter = document.getElementById('search-maintenance').value.toLowerCase();

        document.querySelectorAll('.ticket-card').forEach(ticket => {
            let show = true;

            if (statusFilter !== 'all') {
                const status = ticket.classList.contains(statusFilter);
                if (!status) show = false;
            }

            if (priorityFilter !== 'all') {
                const priority = ticket.classList.contains(priorityFilter);
                if (!priority) show = false;
            }

            if (categoryFilter !== 'all') {
                const categoryElement = ticket.querySelector('.ticket-category');
                if (categoryElement) {
                    const category = categoryElement.textContent.toLowerCase();
                    if (!category.includes(categoryFilter)) show = false;
                }
            }

            if (searchFilter) {
                const title = ticket.querySelector('h4').textContent.toLowerCase();
                const description = ticket.querySelector('p').textContent.toLowerCase();
                if (!title.includes(searchFilter) && !description.includes(searchFilter)) {
                    show = false;
                }
            }

            ticket.style.display = show ? 'block' : 'none';
        });
    }

    searchMaintenanceTickets() {
        this.filterMaintenanceTickets();
    }

    filterReservations() {
        const statusFilter = document.getElementById('reservation-status-filter').value;
        const areaFilter = document.getElementById('reservation-area-filter').value;
        const dateFilter = document.getElementById('reservation-date-filter').value;
        const searchFilter = document.getElementById('search-reservations').value.toLowerCase();

        document.querySelectorAll('.reservation-card').forEach(card => {
            let show = true;

            if (statusFilter !== 'all') {
                const status = card.classList.contains(statusFilter);
                if (!status) show = false;
            }

            if (areaFilter !== 'all') {
                const areaElement = card.querySelector('h4');
                if (areaElement) {
                    const area = areaElement.textContent.toLowerCase();
                    if (!area.includes(areaFilter)) show = false;
                }
            }

            if (searchFilter) {
                const area = card.querySelector('h4').textContent.toLowerCase();
                const purpose = card.querySelector('.reservation-details p:last-child')?.textContent.toLowerCase() || '';
                if (!area.includes(searchFilter) && !purpose.includes(searchFilter)) {
                    show = false;
                }
            }

            card.style.display = show ? 'block' : 'none';
        });
    }

    searchReservations() {
        this.filterReservations();
    }

    filterForumPosts(category) {
        document.querySelectorAll('.community-post').forEach(post => {
            if (category === 'all' || post.dataset.category === category) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    // Sistema de Modales
    openQuickReserve() {
        this.showModal('quickReserveModal');
    }

    openMaintenanceRequest() {
        this.showModal('maintenanceRequestModal');
    }

    openCommunityPost() {
        this.showModal('communityPostModal');
    }

    openCommunityChat() {
        // El chat ya está visible en la sección comunidad
        this.switchSection('comunidad');
    }

    openLogoutModal() {
        this.showModal('logoutModal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    // Sistema de Formularios
    submitReservation() {
        const area = document.getElementById('reserve-area').value;
        const date = document.getElementById('reserve-date').value;
        const start = document.getElementById('reserve-start').value;
        const end = document.getElementById('reserve-end').value;
        const people = document.getElementById('reserve-people').value;
        const purpose = document.getElementById('reserve-purpose').value;

        if (!area || !date || !start || !end || !people) {
            this.showNotification('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }

        const newReservation = {
            id: Date.now(),
            area: area,
            date: date,
            startTime: start,
            endTime: end,
            people: parseInt(people),
            purpose: purpose,
            status: 'pending'
        };

        this.reservations.push(newReservation);
        this.updateReservationsGrid();
        this.generateCalendar(); // Actualizar calendario
        this.updateStats();

        this.showNotification('Reserva enviada correctamente. Espera la confirmación.', 'success');
        this.closeModal('quickReserveModal');
        
        // Resetear formulario
        document.getElementById('reservation-form').reset();
        this.setDefaultDates();
    }

    submitMaintenanceRequest() {
        const category = document.getElementById('maintenance-category').value;
        const priority = document.getElementById('maintenance-priority').value;
        const title = document.getElementById('maintenance-title').value;
        const description = document.getElementById('maintenance-description').value;

        if (!category || !title || !description) {
            this.showNotification('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }

        const newTicket = {
            id: 'MT-' + Date.now().toString().slice(-4),
            title: title,
            description: description,
            category: category,
            priority: priority,
            status: 'open',
            date: new Date().toISOString().split('T')[0],
            assignee: null,
            updates: [
                { 
                    date: new Date().toLocaleString(), 
                    message: 'Solicitud recibida', 
                    technician: 'Sistema' 
                }
            ]
        };

        this.maintenanceTickets.unshift(newTicket);
        this.updateMaintenanceTickets();
        this.updateStats();

        this.showNotification('Solicitud de mantenimiento enviada correctamente', 'success');
        this.closeModal('maintenanceRequestModal');
        
        // Resetear formulario
        document.getElementById('maintenance-form').reset();
    }

    submitCommunityPost() {
        const category = document.getElementById('post-category').value;
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const tags = document.getElementById('post-tags').value;

        if (!category || !title || !content) {
            this.showNotification('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }

        const newPost = {
            id: Date.now(),
            author: 'Juan Pérez',
            category: category,
            title: title,
            content: content,
            tags: tags,
            date: new Date().toISOString().split('T')[0],
            likes: 0,
            comments: 0
        };

        this.communityPosts.unshift(newPost);
        this.updateCommunityPosts();

        this.showNotification('Publicación compartida correctamente', 'success');
        this.closeModal('communityPostModal');
        
        // Resetear formulario
        document.getElementById('community-post-form').reset();
    }

    // Sistema de Pagos
    processPayment(button) {
        const paymentItem = button.closest('.payment-item');
        const amount = paymentItem.querySelector('.amount').textContent;
        const description = paymentItem.querySelector('h4').textContent;

        button.textContent = 'Procesando...';
        button.disabled = true;

        setTimeout(() => {
            button.textContent = 'Pagado';
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
            button.disabled = true;
            
            this.showNotification(`Pago de ${amount} procesado correctamente`, 'success');
            
            const statusBadge = paymentItem.querySelector('.status-badge');
            statusBadge.textContent = 'Pagado';
            statusBadge.className = 'status-badge paid';
            
            this.updateStats();
        }, 2000);
    }

    // Asistente IA
    toggleAIAssistant() {
        const assistant = document.getElementById('aiAssistant');
        assistant.classList.toggle('active');
    }

    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addAIMessage(message, 'user');
        input.value = '';

        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addAIMessage(response, 'assistant');
        }, 1000);
    }

    addAIMessage(message, sender) {
        const messagesContainer = document.getElementById('aiMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;

        const avatar = sender === 'user' ? 
            '<div class="message-avatar"><i class="fas fa-user"></i></div>' :
            '<div class="message-avatar"><i class="fas fa-robot"></i></div>';

        messageDiv.innerHTML = `
            ${sender === 'assistant' ? avatar : ''}
            <div class="message-content">
                <p>${message}</p>
            </div>
            ${sender === 'user' ? avatar : ''}
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Respuestas financieras
        if (lowerMessage.includes('pago') || lowerMessage.includes('finanza') || lowerMessage.includes('dinero')) {
            return this.getFinancialAIResponse(lowerMessage);
        }
        
        // Respuestas de mantenimiento
        if (lowerMessage.includes('mantenimiento') || lowerMessage.includes('reparación') || lowerMessage.includes('arreglar')) {
            return this.getMaintenanceAIResponse(lowerMessage);
        }
        
        // Respuestas de reservas
        if (lowerMessage.includes('reserva') || lowerMessage.includes('reservar') || lowerMessage.includes('calendario')) {
            return this.getReservationAIResponse(lowerMessage);
        }
        
        // Respuestas de comunidad
        if (lowerMessage.includes('comunidad') || lowerMessage.includes('vecino') || lowerMessage.includes('foro')) {
            return this.getCommunityAIResponse(lowerMessage);
        }
        
        // Respuesta por defecto
        return `¡Hola! Soy tu asistente virtual N8N. Puedo ayudarte con:
• 📊 Análisis financiero y pagos
• 📅 Gestión de reservas
• 🔧 Soporte de mantenimiento
• 💡 Consejos de ahorro
• 👥 Consultas de comunidad

¿En qué específicamente puedo asistirte?`;
    }

    getFinancialAIResponse(message) {
        const responses = [
            "Basado en tu historial, tienes 2 pagos pendientes por un total de $335.25. Te recomiendo pagarlos antes del 05 de Febrero para evitar recargos.",
            "Tu consumo eléctrico está 8% por encima del promedio del edificio. Te sugiero revisar el uso de electrodomésticos en horarios pico.",
            "He analizado tus finanzas: Este mes has ahorrado un 5% en comparación con el mes anterior. ¡Buen trabajo!",
            "Para optimizar tus gastos, considera programar pagos automáticos y revisar los consejos de ahorro en la sección de consumo."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getMaintenanceAIResponse(message) {
        const openTickets = this.maintenanceTickets.filter(t => t.status !== 'resolved').length;
        
        if (message.includes('estado') || message.includes('cómo')) {
            return `Tienes ${openTickets} tickets de mantenimiento activos. El ticket MT-001 está en proceso y será atendido por Carlos Martínez.`;
        }
        
        if (message.includes('urgente') || message.includes('rápido')) {
            return "Para problemas urgentes, marca la solicitud como 'Urgente' y contacta directamente al administrador al teléfono de emergencias.";
        }
        
        return `Puedo ayudarte con tus solicitudes de mantenimiento. Actualmente tienes ${openTickets} tickets activos. ¿Quieres crear una nueva solicitud o consultar el estado de una existente?`;
    }

    getReservationAIResponse(message) {
        const activeReservations = this.reservations.filter(r => r.status === 'confirmed').length;
        
        if (message.includes('disponible') || message.includes('libre')) {
            return "Puedes ver la disponibilidad en tiempo real en el calendario de reservas. Las áreas más solicitadas son la Sala de Eventos los fines de semana.";
        }
        
        if (message.includes('cancelar') || message.includes('modificar')) {
            return `Tienes ${activeReservations} reservas activas. Para modificar o cancelar, ve a la sección de Reservas y haz clic en los botones correspondientes.`;
        }
        
        return `Tienes ${activeReservations} reservas confirmadas. ¿Necesitas ayuda para hacer una nueva reserva o gestionar las existentes?`;
    }

    getCommunityAIResponse(message) {
        return "La comunidad está muy activa hoy. Hay 12 residentes en línea en el chat y 3 nuevas publicaciones en el foro. ¿Te gustaría participar en alguna discusión o crear una nueva publicación?";
    }

    askAIFinancialAdvice() {
        this.toggleAIAssistant();
        setTimeout(() => {
            this.addAIMessage("Necesito asesoría financiera", 'user');
            setTimeout(() => {
                const response = this.getFinancialAIResponse("asesoría financiera");
                this.addAIMessage(response, 'assistant');
            }, 500);
        }, 300);
    }

    askAIMaintenanceHelp() {
        this.toggleAIAssistant();
        setTimeout(() => {
            this.addAIMessage("Necesito ayuda con mantenimiento", 'user');
            setTimeout(() => {
                const response = this.getMaintenanceAIResponse("ayuda mantenimiento");
                this.addAIMessage(response, 'assistant');
            }, 500);
        }, 300);
    }

    askAIChatHelp() {
        this.toggleAIAssistant();
        setTimeout(() => {
            this.addAIMessage("Ayuda con el chat de la comunidad", 'user');
            setTimeout(() => {
                this.addAIMessage("Puedo ayudarte a redactar mensajes para la comunidad o explicarte cómo funciona el sistema de chat. ¿Qué necesitas específicamente?", 'assistant');
            }, 500);
        }, 300);
    }

    // Chat Comunitario
    sendCommunityMessage() {
        const input = document.getElementById('community-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        const newMessage = {
            id: Date.now(),
            sender: 'Juan Pérez',
            message: message,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'sent'
        };

        this.chatMessages.push(newMessage);
        this.updateChatMessages();
        input.value = '';

        // Simular respuesta automática
        setTimeout(() => {
            const responses = [
                "¡Interesante punto!",
                "Estoy de acuerdo con tu opinión",
                "¿Alguien más tiene experiencia con esto?",
                "Gracias por compartir esta información"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const autoMessage = {
                id: Date.now() + 1,
                sender: 'María González',
                message: randomResponse,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'received'
            };
            
            this.chatMessages.push(autoMessage);
            this.updateChatMessages();
        }, 2000);
    }

    // Sistema de Notificaciones
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
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
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
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

    // Funciones de Utilidad
    updateProfile() {
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const phone = document.getElementById('user-phone').value;
        const apartment = document.getElementById('user-apartment').value;

        this.showNotification('Perfil actualizado correctamente', 'success');
        
        document.getElementById('resident-name').textContent = name;
        document.getElementById('sidebar-resident-name').textContent = name;
        document.getElementById('apartment-info').textContent = apartment;
        document.getElementById('sidebar-apartment-info').textContent = apartment;
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            this.showNotification('Cerrando sesión...', 'info');
            
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        }
    }

    // Funciones de Interacción
    modifyReservation(reservationId) {
        const reservation = this.reservations.find(r => r.id === reservationId);
        if (reservation) {
            this.showNotification(`Editando reserva: ${reservation.area}`, 'info');
            this.openQuickReserve();
            
            // Llenar el formulario con los datos existentes
            document.getElementById('reserve-area').value = reservation.area;
            document.getElementById('reserve-date').value = reservation.date;
            document.getElementById('reserve-start').value = reservation.startTime;
            document.getElementById('reserve-end').value = reservation.endTime;
            document.getElementById('reserve-people').value = reservation.people;
            document.getElementById('reserve-purpose').value = reservation.purpose || '';
        }
    }

    cancelReservation(reservationId) {
        if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
            this.reservations = this.reservations.filter(r => r.id !== reservationId);
            this.updateReservationsGrid();
            this.generateCalendar();
            this.updateStats();
            this.showNotification('Reserva cancelada correctamente', 'success');
        }
    }

    viewRequestDetails(requestId) {
        const ticket = this.maintenanceTickets.find(t => t.id === requestId);
        if (ticket) {
            this.showNotification(`Mostrando detalles de: ${ticket.title}`, 'info');
            // Aquí se podría abrir un modal con detalles completos
            const details = `
ID: ${ticket.id}
Título: ${ticket.title}
Categoría: ${this.getCategoryName(ticket.category)}
Prioridad: ${this.getPriorityName(ticket.priority)}
Estado: ${this.getStatusName(ticket.status)}
Fecha: ${ticket.date}
${ticket.assignee ? `Técnico: ${ticket.assignee}` : 'Pendiente de asignación'}

Descripción:
${ticket.description}

Actualizaciones:
${ticket.updates.map(update => `• ${update.date}: ${update.message} ${update.technician ? `(por ${update.technician})` : ''}`).join('\n')}
            `;
            alert(details);
        }
    }

    contactTechnician(requestId) {
        const ticket = this.maintenanceTickets.find(t => t.id === requestId);
        if (ticket && ticket.assignee) {
            this.showNotification(`Contactando a ${ticket.assignee}...`, 'info');
            setTimeout(() => {
                this.showNotification(`Técnico ${ticket.assignee} notificado. Te contactará pronto.`, 'success');
            }, 1500);
        }
    }

    cancelRequest(requestId) {
        if (confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
            this.maintenanceTickets = this.maintenanceTickets.filter(t => t.id !== requestId);
            this.updateMaintenanceTickets();
            this.showNotification('Solicitud cancelada exitosamente', 'success');
        }
    }

    likePost(postId) {
        const post = this.communityPosts.find(p => p.id === postId);
        if (post) {
            post.likes++;
            this.updateCommunityPosts();
            this.showNotification('¡Post liked!', 'success');
        }
    }

    showComments(postId) {
        this.showNotification(`Cargando comentarios del post ${postId}...`, 'info');
    }

    sharePost(postId) {
        this.showNotification('Compartiendo post...', 'info');
    }

    downloadFinancialReport() {
        this.showNotification('Generando reporte financiero...', 'info');
        
        // Simular generación de reporte
        setTimeout(() => {
            this.showNotification('Reporte financiero descargado correctamente', 'success');
            
            // Crear y descargar archivo simulado
            const blob = new Blob(['Reporte Financiero - BuildingPRO\n\nEste es un reporte simulado para pruebas.'], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_financiero.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);
    }

    downloadReceipt(button) {
        const paymentItem = button.closest('.table-row');
        const date = paymentItem.querySelector('.table-cell:first-child').textContent;
        const description = paymentItem.querySelector('.table-cell:nth-child(2)').textContent;
        const amount = paymentItem.querySelector('.table-cell:nth-child(3)').textContent;
        
        this.showNotification(`Generando recibo del ${date}...`, 'info');
        
        setTimeout(() => {
            this.showNotification('Recibo descargado correctamente', 'success');
            
            // Crear y descargar recibo simulado
            const receiptContent = `
RECIBO DE PAGO - BuildingPRO
==============================

Fecha: ${date}
Descripción: ${description}
Monto: ${amount}
Estado: Pagado

Gracias por su pago puntual.
Este es un recibo simulado para pruebas.
            `;
            
            const blob = new Blob([receiptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recibo_${date.replace(/ /g, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1500);
    }

    changePassword() {
        const newPassword = prompt('Ingresa tu nueva contraseña:');
        if (newPassword) {
            this.showNotification('Contraseña cambiada correctamente', 'success');
        }
    }

    logoutDevice() {
        if (confirm('¿Cerrar sesión en este dispositivo?')) {
            this.showNotification('Sesión cerrada en este dispositivo', 'info');
        }
    }

    viewBuildingStatus() {
        this.showNotification('Mostrando estado del edificio...', 'info');
        
        const status = {
            temperatura: '22°C',
            seguridad: 'Activo',
            elevators: 'Funcionando',
            water: 'Normal',
            electricity: 'Estable',
            internet: 'Óptimo'
        };
        
        const statusMessage = `Estado del edificio:
• 🌡️ Temperatura: ${status.temperatura}
• 🛡️ Seguridad: ${status.seguridad}
• 📶 Internet: ${status.internet}
• ⚡ Electricidad: ${status.electricity}
• 💧 Agua: ${status.water}
• 🛗 Ascensores: ${status.elevators}`;
        
        alert(statusMessage);
    }

    closeAlert(button) {
        const alert = button.closest('.alert-banner');
        alert.style.animation = 'slideOutUp 0.5s ease-out';
        setTimeout(() => {
            alert.remove();
        }, 500);
    }

    attachFile() {
        this.showNotification('Funcionalidad de adjuntar archivo en desarrollo', 'info');
    }

    attachImage() {
        this.showNotification('Funcionalidad de adjuntar imagen en desarrollo', 'info');
    }

    setupRealTimeUpdates() {
        // Simular actualizaciones en tiempo real
        setInterval(() => {
            this.updateStats();
        }, 30000);

        // Simular notificaciones periódicas
        setInterval(() => {
            if (Math.random() > 0.7) {
                const notifications = [
                    'Nuevo evento en la comunidad este fin de semana',
                    'Recordatorio: Pago de mantenimiento próximo',
                    'Mantenimiento de ascensores programado',
                    'Nueva actualización disponible en el sistema'
                ];
                const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
                this.showNotification(randomNotification, 'info');
            }
        }, 60000);
    }

    updateCharts() {
        if (this.consumptionChart) {
            this.consumptionChart.update();
        }
        this.updateFinancialCharts();
    }
}

// Funciones globales para uso en HTML
const dashboard = new DashboardResidente();

// Funciones de navegación
function switchSection(sectionId) {
    dashboard.switchSection(sectionId);
}

function openQuickReserve() {
    dashboard.openQuickReserve();
}

function openMaintenanceRequest() {
    dashboard.openMaintenanceRequest();
}

function openCommunityPost() {
    dashboard.openCommunityPost();
}

function openCommunityChat() {
    dashboard.openCommunityChat();
}

function closeModal(modalId) {
    dashboard.closeModal(modalId);
}

// Funciones de interacción
function processPayment(button) {
    dashboard.processPayment(button);
}

function toggleAIAssistant() {
    dashboard.toggleAIAssistant();
}

function sendAIMessage() {
    dashboard.sendAIMessage();
}

function askAIFinancialAdvice() {
    dashboard.askAIFinancialAdvice();
}

function askAIMaintenanceHelp() {
    dashboard.askAIMaintenanceHelp();
}

function askAIChatHelp() {
    dashboard.askAIChatHelp();
}

function toggleNotifications() {
    dashboard.toggleNotifications();
}

function toggleUserMenu() {
    dashboard.toggleUserMenu();
}

// Funciones de calendario
function previousMonth() {
    dashboard.previousMonth();
}

function nextMonth() {
    dashboard.nextMonth();
}

// Funciones de formularios
function submitReservation() {
    dashboard.submitReservation();
}

function submitMaintenanceRequest() {
    dashboard.submitMaintenanceRequest();
}

function submitCommunityPost() {
    dashboard.submitCommunityPost();
}

// Funciones de filtros
function filterMaintenanceTickets() {
    dashboard.filterMaintenanceTickets();
}

function searchMaintenanceTickets() {
    dashboard.searchMaintenanceTickets();
}

function filterReservations() {
    dashboard.filterReservations();
}

function searchReservations() {
    dashboard.searchReservations();
}

function updateCharts() {
    dashboard.updateCharts();
}

// Funciones de perfil y sistema
function updateProfile() {
    dashboard.updateProfile();
}

function logout() {
    dashboard.logout();
}

function downloadFinancialReport() {
    dashboard.downloadFinancialReport();
}

function downloadReceipt(button) {
    dashboard.downloadReceipt(button);
}

function changePassword() {
    dashboard.changePassword();
}

function logoutDevice() {
    dashboard.logoutDevice();
}

function viewBuildingStatus() {
    dashboard.viewBuildingStatus();
}

function closeAlert(button) {
    dashboard.closeAlert(button);
}

// Funciones de comunidad
function sendCommunityMessage() {
    dashboard.sendCommunityMessage();
}

function attachFile() {
    dashboard.attachFile();
}

function attachImage() {
    dashboard.attachImage();
}

function likePost(postId) {
    dashboard.likePost(postId);
}

function showComments(postId) {
    dashboard.showComments(postId);
}

function sharePost(postId) {
    dashboard.sharePost(postId);
}

// Funciones de mantenimiento
function viewRequestDetails(requestId) {
    dashboard.viewRequestDetails(requestId);
}

function contactTechnician(requestId) {
    dashboard.contactTechnician(requestId);
}

function cancelRequest(requestId) {
    dashboard.cancelRequest(requestId);
}

function modifyReservation(reservationId) {
    dashboard.modifyReservation(reservationId);
}

function cancelReservation(reservationId) {
    dashboard.cancelReservation(reservationId);
}

// CSS para animaciones
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
    
    @keyframes slideOutUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
    
    .notification-toast {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);