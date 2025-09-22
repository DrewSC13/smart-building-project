document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const userNameElement = document.getElementById('user-name');
    const userRoleElement = document.getElementById('user-role');
    const currentTimeElement = document.getElementById('current-time');
    const notificationCountElement = document.getElementById('notification-count');

    // Elementos de estadísticas
    const totalAnnouncementsElement = document.getElementById('total-announcements');
    const unreadNotificationsElement = document.getElementById('unread-notifications');
    const pendingPaymentsElement = document.getElementById('pending-payments');
    const activeReservationsElement = document.getElementById('active-reservations');

    // Elementos de contenido
    const recentAnnouncementsElement = document.getElementById('recent-announcements');
    const recentNotificationsElement = document.getElementById('recent-notifications');

    // Botones
    const refreshAnnouncementsBtn = document.getElementById('refresh-announcements');
    const viewAllAnnouncementsBtn = document.getElementById('view-all-announcements');
    const markAllReadBtn = document.getElementById('mark-all-read');
    const viewAllNotificationsBtn = document.getElementById('view-all-notifications');
    const logoutBtn = document.getElementById('logout-btn');

    // Acciones rápidas
    const quickProfileBtn = document.getElementById('quick-profile');
    const quickPaymentBtn = document.getElementById('quick-payment');
    const quickReservationBtn = document.getElementById('quick-reservation');
    const quickReportBtn = document.getElementById('quick-report');

    // Modal
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const closeModal = document.querySelector('.close');

    // Estado de la aplicación
    let userData = null;
    let dashboardStats = null;

    // Funciones de utilidad
    function showMessage(title, text) {
        messageTitle.textContent = title;
        messageText.textContent = text;
        messageModal.style.display = 'flex';
    }

    function closeMessage() {
        messageModal.style.display = 'none';
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function updateCurrentTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        currentTimeElement.textContent = now.toLocaleDateString('es-ES', options);
    }

    // Funciones de API
    async function fetchDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar estadísticas');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            showMessage('Error', 'No se pudieron cargar las estadísticas del dashboard');
            return null;
        }
    }

    async function fetchUserProfile() {
        try {
            const response = await fetch('/api/profile/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar perfil de usuario');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async function markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    // Funciones de renderizado
    function renderUserInfo(user) {
        if (user) {
            userNameElement.textContent = `${user.first_name} ${user.last_name}`;
            userRoleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
    }

    function renderStats(stats) {
        if (stats) {
            totalAnnouncementsElement.textContent = stats.total_announcements;
            unreadNotificationsElement.textContent = stats.unread_notifications;
            pendingPaymentsElement.textContent = stats.pending_payments;
            activeReservationsElement.textContent = stats.active_reservations;

            // Actualizar badge de notificaciones
            notificationCountElement.textContent = stats.unread_notifications;
            if (stats.unread_notifications > 0) {
                notificationCountElement.style.display = 'inline-block';
            } else {
                notificationCountElement.style.display = 'none';
            }
        }
    }

    function renderAnnouncements(announcements) {
        if (!announcements || announcements.length === 0) {
            recentAnnouncementsElement.innerHTML = `
                <div class="no-data-message">
                    <i class='bx bx-news'></i>
                    <p>No hay anuncios recientes</p>
                </div>
            `;
            return;
        }

        const announcementsHTML = announcements.map(announcement => `
            <div class="announcement-item ${announcement.priority}-priority">
                <div class="announcement-title">
                    <span>${announcement.title}</span>
                    <span class="priority-badge ${announcement.priority}">
                        ${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                    </span>
                </div>
                <div class="announcement-meta">
                    Por: ${announcement.author_name} •
                    ${new Date(announcement.publish_date).toLocaleDateString('es-ES')}
                </div>
                <div class="announcement-content">
                    ${announcement.content}
                </div>
            </div>
        `).join('');

        recentAnnouncementsElement.innerHTML = announcementsHTML;
    }

    function renderNotifications(notifications) {
        if (!notifications || notifications.length === 0) {
            recentNotificationsElement.innerHTML = `
                <div class="no-data-message">
                    <i class='bx bx-bell'></i>
                    <p>No hay notificaciones recientes</p>
                </div>
            `;
            return;
        }

        const notificationsHTML = notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? 'read' : 'unread'}"
                 data-notification-id="${notification.id}">
                <div class="announcement-title">
                    <span>${notification.title}</span>
                    ${!notification.is_read ? '<span class="unread-dot"></span>' : ''}
                </div>
                <div class="announcement-meta">
                    ${new Date(notification.created_at).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <div class="announcement-content">
                    ${notification.message}
                </div>
                ${!notification.is_read ? `
                    <button class="btn btn-sm mark-as-read" onclick="markNotificationAsRead(${notification.id})">
                        <i class='bx bx-check'></i> Marcar como leído
                    </button>
                ` : ''}
            </div>
        `).join('');

        recentNotificationsElement.innerHTML = notificationsHTML;
    }

    // Funciones de inicialización
    async function initializeDashboard() {
        try {
            // Obtener datos del usuario desde la URL o API
            const urlParams = new URLSearchParams(window.location.search);
            const email = urlParams.get('email');
            const role = urlParams.get('role');

            if (email && role) {
                userData = {
                    email: email,
                    role: role,
                    first_name: email.split('@')[0],
                    last_name: 'Usuario'
                };
                renderUserInfo(userData);
            } else {
                // Intentar cargar desde API
                userData = await fetchUserProfile();
                if (userData) {
                    renderUserInfo(userData);
                }
            }

            // Cargar estadísticas del dashboard
            dashboardStats = await fetchDashboardStats();
            if (dashboardStats) {
                renderStats(dashboardStats);
                renderAnnouncements(dashboardStats.recent_announcements);
                renderNotifications(dashboardStats.recent_notifications);
            }

            // Iniciar reloj
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);

            showMessage('Éxito', 'Dashboard cargado correctamente');

        } catch (error) {
            console.error('Error initializing dashboard:', error);
            showMessage('Error', 'Error al inicializar el dashboard');
        }
    }

    // Event Listeners
    refreshAnnouncementsBtn.addEventListener('click', async function() {
        refreshAnnouncementsBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Actualizando...';
        dashboardStats = await fetchDashboardStats();
        if (dashboardStats) {
            renderAnnouncements(dashboardStats.recent_announcements);
            showMessage('Éxito', 'Anuncios actualizados correctamente');
        }
        refreshAnnouncementsBtn.innerHTML = '<i class="bx bx-refresh"></i> Actualizar';
    });

    viewAllAnnouncementsBtn.addEventListener('click', function() {
        showMessage('Información', 'Funcionalidad en desarrollo - Próximamente');
    });

    markAllReadBtn.addEventListener('click', async function() {
        if (dashboardStats && dashboardStats.recent_notifications) {
            const unreadNotifications = dashboardStats.recent_notifications.filter(n => !n.is_read);
            for (const notification of unreadNotifications) {
                await markNotificationAsRead(notification.id);
            }
            showMessage('Éxito', 'Todas las notificaciones marcadas como leídas');
            // Recargar dashboard
            dashboardStats = await fetchDashboardStats();
            if (dashboardStats) {
                renderNotifications(dashboardStats.recent_notifications);
                renderStats(dashboardStats);
            }
        }
    });

    viewAllNotificationsBtn.addEventListener('click', function() {
        showMessage('Información', 'Funcionalidad en desarrollo - Próximamente');
    });

    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            window.location.href = '/login.html';
        }
    });

    // Acciones rápidas
    quickProfileBtn.addEventListener('click', function() {
        window.location.href = '/profile.html';
    });

    quickPaymentBtn.addEventListener('click', function() {
        showMessage('Información', 'Módulo de pagos en desarrollo - Próximamente');
    });

    quickReservationBtn.addEventListener('click', function() {
        showMessage('Información', 'Módulo de reservas en desarrollo - Próximamente');
    });

    quickReportBtn.addEventListener('click', function() {
        showMessage('Información', 'Módulo de reportes en desarrollo - Próximamente');
    });

    // Modal events
    closeModal.addEventListener('click', closeMessage);
    window.addEventListener('click', function(e) {
        if (e.target === messageModal) {
            closeMessage();
        }
    });

    // Navegación del sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const tab = this.getAttribute('data-tab');

                // Remover clase active de todos los links
                document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
                // Agregar clase active al link clickeado
                this.classList.add('active');

                showMessage('Navegación', `Cambiando a pestaña: ${tab}`);
            }
        });
    });

    // Inicializar dashboard
    initializeDashboard();

    // Estilos adicionales dinámicos
    const style = document.createElement('style');
    style.textContent = `
        .no-data-message {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }

        .no-data-message i {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
            opacity: 0.5;
        }

        .priority-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: bold;
        }

        .priority-badge.high { background: var(--error); color: white; }
        .priority-badge.medium { background: var(--warning); color: black; }
        .priority-badge.low { background: var(--success); color: white; }
        .priority-badge.urgent { background: #ff4757; color: white; }

        .unread-dot {
            width: 8px;
            height: 8px;
            background: var(--neon);
            border-radius: 50%;
            display: inline-block;
            margin-left: 10px;
            animation: pulse 2s infinite;
        }

        .mark-as-read {
            margin-top: 10px;
            padding: 5px 10px;
            font-size: 0.8rem;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }

        .action-btn {
            background: rgba(0, 191, 255, 0.1);
            border: 1px solid rgba(0, 191, 255, 0.3);
            border-radius: 8px;
            padding: 20px;
            color: var(--text);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        .action-btn:hover {
            background: rgba(0, 191, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 191, 255, 0.3);
        }

        .action-btn i {
            font-size: 2rem;
            color: var(--accent);
        }

        .notification-badge {
            background: var(--error);
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 0.7rem;
            margin-left: auto;
        }

        .current-time {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 10px;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});
