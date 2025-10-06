// Dashboard Tecnico - Sistema de Gestión de Mantenimiento Completo
class DashboardTecnico {
    constructor() {
        this.currentSection = 'tickets';
        this.currentView = 'grid';
        this.tickets = [];
        this.filteredTickets = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.notifications = [];
        this.isNotificationsOpen = false;
        this.currentMaintenanceTab = 'today';
        this.selectedTickets = new Set();
        this.isSelectAll = false;
        this.maintenanceData = {};
        this.inventoryData = [];
        this.analyticsData = {};
        this.agendaData = {};
        this.currentDate = new Date();
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadAllSampleData();
        this.initializeCharts();
        this.updateDisplay();
        this.startRealTimeUpdates();
        this.initializeDragAndDrop();
    }

    // ==================== INICIALIZACIÓN Y DATOS ====================

    initializeEventListeners() {
        // Navegación principal
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Sub-navegación de tickets
        document.querySelectorAll('.sub-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = item.getAttribute('data-filter');
                this.filterTicketsBySubNav(filter);
            });
        });

        // Búsqueda en tiempo real
        const searchInput = document.getElementById('ticketSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Cerrar modal al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.id);
            }
        });

        // Tecla Escape para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeNotificationsPanel();
            }
        });
    }

    loadAllSampleData() {
        this.loadTicketsSampleData();
        this.loadMaintenanceSampleData();
        this.loadInventorySampleData();
        this.loadAnalyticsSampleData();
        this.loadAgendaSampleData();
        this.loadNotificationsSampleData();
    }

    loadTicketsSampleData() {
        this.tickets = [
            {
                id: 'TCK-2024-001',
                title: 'Falla crítica en sistema HVAC Torre Norte',
                priority: 'critical',
                status: 'pending',
                category: 'hvac',
                location: 'Torre Norte - Nivel 12 - Sala Servidores',
                technician: 'Carlos Martínez',
                supervisor: 'Ana López',
                createdAt: new Date('2024-01-15T08:00:00'),
                scheduledFor: new Date('2024-01-15T08:30:00'),
                estimatedTime: '2h 30m',
                description: 'Temperatura crítica detectada en sala de servidores. Sistema HVAC no responde a comandos automáticos. Temperatura actual: 32°C, límite: 25°C. Requiere intervención inmediata para evitar daños en equipos.',
                materials: ['Sensor temperatura digital', 'Válvula solenoide HVAC', 'Kit herramientas especializadas', 'Refrigerante R410A'],
                progress: 0,
                history: [
                    {
                        action: 'Ticket creado automáticamente',
                        user: 'Sistema de Monitoreo',
                        timestamp: new Date('2024-01-15T08:00:00'),
                        details: 'Alerta por sensor de temperatura: 32°C detectado'
                    },
                    {
                        action: 'Asignado a técnico',
                        user: 'Ana López',
                        timestamp: new Date('2024-01-15T08:05:00'),
                        details: 'Asignado a Carlos Martínez por especialización en HVAC'
                    }
                ]
            },
            {
                id: 'TCK-2024-002',
                title: 'Mantenimiento preventivo sistema ascensores Torre B',
                priority: 'high',
                status: 'in-progress',
                category: 'mecanico',
                location: 'Torre B - Sistema Elevación - Todos niveles',
                technician: 'Miguel Ángel',
                supervisor: 'Sofía Ramírez',
                createdAt: new Date('2024-01-14T14:00:00'),
                scheduledFor: new Date('2024-01-15T10:30:00'),
                estimatedTime: '3h 15m',
                description: 'Mantenimiento programado mensual del sistema de ascensores. Incluye verificación de cables, motores, sistemas de seguridad y lubricación.',
                materials: ['Kit lubricación especial', 'Sensor de velocidad', 'Herramientas de calibración', 'Equipo de seguridad'],
                progress: 45,
                history: [
                    {
                        action: 'Ticket programado',
                        user: 'Sistema de Planificación',
                        timestamp: new Date('2024-01-14T14:00:00'),
                        details: 'Mantenimiento preventivo mensual programado'
                    },
                    {
                        action: 'Trabajo iniciado',
                        user: 'Miguel Ángel',
                        timestamp: new Date('2024-01-15T10:30:00'),
                        details: 'Iniciada verificación de sistema de seguridad y cables'
                    },
                    {
                        action: 'Progreso actualizado',
                        user: 'Miguel Ángel',
                        timestamp: new Date('2024-01-15T11:45:00'),
                        details: 'Sistema de seguridad verificado, iniciando lubricación'
                    }
                ]
            },
            {
                id: 'TCK-2024-003',
                title: 'Actualización sistema iluminación LED áreas comunes',
                priority: 'medium',
                status: 'pending',
                category: 'electrico',
                location: 'Áreas Comunes - Todos niveles - Pasillos y recepción',
                technician: 'Ana López',
                supervisor: 'Carlos Martínez',
                createdAt: new Date('2024-01-14T16:30:00'),
                scheduledFor: new Date('2024-01-16T14:00:00'),
                estimatedTime: '4h 00m',
                description: 'Actualización completa del sistema de iluminación a tecnología LED en todas las áreas comunes. Mejora de eficiencia energética.',
                materials: ['Lámparas LED 18W', 'Drivers LED', 'Cableado eléctrico', 'Herramientas instalación'],
                progress: 0,
                history: [
                    {
                        action: 'Ticket creado',
                        user: 'Planificación Mejoras',
                        timestamp: new Date('2024-01-14T16:30:00'),
                        details: 'Proyecto de eficiencia energética - Fase 2'
                    }
                ]
            },
            {
                id: 'TCK-2024-004',
                title: 'Revisión y calibración sistema seguridad perimetral',
                priority: 'high',
                status: 'waiting',
                category: 'seguridad',
                location: 'Torre Principal - Todos accesos - Perímetro',
                technician: 'Laura Sánchez',
                supervisor: 'Roberto Díaz',
                createdAt: new Date('2024-01-13T09:15:00'),
                scheduledFor: new Date('2024-01-15T09:00:00'),
                estimatedTime: '2h 00m',
                description: 'Revisión completa y calibración de cámaras de seguridad, sensores de movimiento y sistema de control de accesos perimetral.',
                materials: ['Equipo calibración cámaras', 'Software diagnóstico', 'Herramientas especializadas'],
                progress: 20,
                history: [
                    {
                        action: 'Ticket creado',
                        user: 'Guardia de seguridad',
                        timestamp: new Date('2024-01-13T09:15:00'),
                        details: 'Reporte durante simulacro de emergencia - fallas en cámaras 3 y 7'
                    },
                    {
                        action: 'Diagnóstico completado',
                        user: 'Laura Sánchez',
                        timestamp: new Date('2024-01-15T09:30:00'),
                        details: 'Cámaras requieren recalibración, sensores OK'
                    },
                    {
                        action: 'Esperando repuestos',
                        user: 'Sistema',
                        timestamp: new Date('2024-01-15T10:00:00'),
                        details: 'Lentes de repuesto en camino, ETA 3 horas'
                    }
                ]
            },
            {
                id: 'TCK-2024-005',
                title: 'Reparación urgente fuga sistema hidráulico principal',
                priority: 'critical',
                status: 'in-progress',
                category: 'hidraulico',
                location: 'Sótano 2 - Sala Bombas Principal - Tubería Norte',
                technician: 'Roberto Díaz',
                supervisor: 'Ana López',
                createdAt: new Date('2024-01-15T07:30:00'),
                scheduledFor: new Date('2024-01-15T07:45:00'),
                estimatedTime: '1h 45m',
                description: 'Fuga crítica detectada en tubería principal del sistema hidráulico. Pérdida de presión en sistema completo. Acción inmediata requerida.',
                materials: ['Válvulas de repuesto', 'Juntas especiales', 'Kit reparación tuberías', 'Equipo seguridad'],
                progress: 60,
                history: [
                    {
                        action: 'Alerta crítica automática',
                        user: 'Sistema de Monitoreo',
                        timestamp: new Date('2024-01-15T07:30:00'),
                        details: 'Caída de presión detectada: 4.2 bar → 1.8 bar'
                    },
                    {
                        action: 'Intervención inmediata',
                        user: 'Roberto Díaz',
                        timestamp: new Date('2024-01-15T07:45:00'),
                        details: 'Localizada fuga en válvula principal, iniciando reparación'
                    },
                    {
                        action: 'Reparación en progreso',
                        user: 'Roberto Díaz',
                        timestamp: new Date('2024-01-15T08:30:00'),
                        details: 'Válvula reemplazada, sellando conexiones'
                    }
                ]
            },
            {
                id: 'TCK-2024-006',
                title: 'Reemplazo sensores temperatura sala servidores',
                priority: 'medium',
                status: 'completed',
                category: 'hvac',
                location: 'Torre Sur - Nivel 8 - Sala Servidores B',
                technician: 'Carlos Martínez',
                supervisor: 'Sofía Ramírez',
                createdAt: new Date('2024-01-12T11:00:00'),
                scheduledFor: new Date('2024-01-12T14:00:00'),
                estimatedTime: '1h 30m',
                description: 'Reemplazo programado de sensores de temperatura en sala de servidores B. Mantenimiento preventivo semestral.',
                materials: ['Sensores temperatura digital', 'Cableado sensor', 'Herramientas calibración'],
                progress: 100,
                history: [
                    {
                        action: 'Ticket programado',
                        user: 'Sistema de Mantenimiento',
                        timestamp: new Date('2024-01-12T11:00:00'),
                        details: 'Mantenimiento preventivo semestral programado'
                    },
                    {
                        action: 'Trabajo completado',
                        user: 'Carlos Martínez',
                        timestamp: new Date('2024-01-12T15:15:00'),
                        details: 'Sensores reemplazados y calibrados, sistema funcionando OK'
                    },
                    {
                        action: 'Validado por supervisor',
                        user: 'Sofía Ramírez',
                        timestamp: new Date('2024-01-12T15:30:00'),
                        details: 'Trabajo verificado y aprobado, tickets cerrado'
                    }
                ]
            }
        ];

        this.filteredTickets = [...this.tickets];
    }

    loadMaintenanceSampleData() {
        this.maintenanceData = {
            today: [
                {
                    id: 'MTN-2024-001',
                    title: 'MANTENIMIENTO PREVENTIVO SISTEMA HVAC TORRE NORTE',
                    priority: 'high',
                    type: 'preventivo',
                    location: 'Torre Norte - Nivel 12 - Sala HVAC',
                    technician: 'Carlos Martínez',
                    scheduledTime: '08:30 - 12:00',
                    duration: '3h 30m',
                    progress: 0,
                    status: 'pending',
                    description: 'Mantenimiento preventivo completo del sistema HVAC. Incluye verificación de compresores, limpieza de filtros, calibración de termostatos y revisión del sistema de control automático.',
                    materials: ['Filtros HEPA', 'Kit herramientas HVAC', 'Manómetros digitales', 'Refrigerante R410A', 'Aceite compresor'],
                    checklist: [
                        'Verificar presión de gas en sistema',
                        'Limpiar y reemplazar filtros',
                        'Calibrar termostatos y sensores',
                        'Revisar sistema eléctrico de control',
                        'Verificar funcionamiento compresores',
                        'Probar sistema de emergencia'
                    ]
                }
            ],
            upcoming: [
                {
                    id: 'MTN-2024-004',
                    title: 'REVISIÓN COMPLETA SISTEMA ELÉCTRICO PRINCIPAL',
                    priority: 'high',
                    type: 'preventivo',
                    location: 'Sala Eléctrica Principal - Tableros 1-8',
                    technician: 'Laura Sánchez',
                    scheduledTime: '18/01/2024 09:00 - 12:00',
                    duration: '3h 00m',
                    progress: 0,
                    status: 'scheduled',
                    description: 'Revisión trimestral completa del sistema eléctrico principal. Incluye verificación de tableros, conexiones, disyuntores y sistema de tierra.'
                }
            ],
            overdue: [
                {
                    id: 'MTN-2024-006',
                    title: 'REPARACIÓN SISTEMA ILUMINACIÓN EMERGENCIA',
                    priority: 'critical',
                    type: 'correctivo',
                    location: 'Áreas Comunes - Todos niveles - Iluminación Emergencia',
                    technician: 'Miguel Ángel',
                    scheduledTime: '12/01/2024',
                    duration: '2h 30m',
                    progress: 0,
                    status: 'overdue',
                    overdueDays: 3,
                    description: 'Reparación del sistema de iluminación de emergencia que no se activa durante cortes de energía. Fallo detectado en simulacro.'
                }
            ],
            completed: [
                {
                    id: 'MTN-2024-007',
                    title: 'ACTUALIZACIÓN SISTEMA CONTROL ACCESOS',
                    priority: 'medium',
                    type: 'preventivo',
                    location: 'Entradas Principales - Torres A, B, C',
                    technician: 'Laura Sánchez',
                    scheduledTime: '08/01/2024',
                    duration: '3h 15m',
                    progress: 100,
                    status: 'completed',
                    description: 'Actualización completa del software y hardware del sistema de control de accesos. Mejora de seguridad y registro de accesos.',
                    completionDate: '2024-01-08',
                    completedBy: 'Laura Sánchez'
                }
            ]
        };
    }

    loadInventorySampleData() {
        this.inventoryData = [
            {
                id: 'INV-2024-001',
                name: 'Sensor Temperatura Digital HVAC',
                category: 'sensores',
                currentStock: 15,
                minStock: 20,
                maxStock: 50,
                location: 'Almacén A - Estante 12 - Bandeja 4',
                status: 'critical',
                supplier: 'TechSensors S.A.',
                lastOrder: '2024-01-10',
                unitCost: 45.50
            },
            {
                id: 'INV-2024-002',
                name: 'Fusible Tipo B 10A',
                category: 'electrico',
                currentStock: 5,
                minStock: 15,
                maxStock: 30,
                location: 'Almacén B - Estante 5 - Bandeja 2',
                status: 'critical',
                supplier: 'ElectroParts Ltda.',
                lastOrder: '2024-01-08',
                unitCost: 8.75
            },
            {
                id: 'INV-2024-003',
                name: 'Válvula Solenoide HVAC',
                category: 'hvac',
                currentStock: 8,
                minStock: 10,
                maxStock: 25,
                location: 'Almacén C - Estante 8 - Bandeja 1',
                status: 'low',
                supplier: 'ClimateControl Inc.',
                lastOrder: '2024-01-05',
                unitCost: 120.00
            }
        ];
    }

    loadAnalyticsSampleData() {
        this.analyticsData = {
            efficiency: [85, 78, 90, 82, 88, 92, 87],
            responseTimes: [35, 28, 42, 31, 25, 29, 33],
            ticketsResolved: [120, 150, 180, 140, 200, 170, 190],
            maintenanceCosts: [11500, 12450, 11800, 13200, 12700, 11900, 12500],
            categoryDistribution: [25, 20, 15, 18, 12, 10],
            technicianPerformance: [
                { name: 'Carlos Martínez', efficiency: 92, speed: 88, quality: 95 },
                { name: 'Ana López', efficiency: 88, speed: 85, quality: 92 },
                { name: 'Miguel Ángel', efficiency: 85, speed: 90, quality: 88 },
                { name: 'Laura Sánchez', efficiency: 90, speed: 82, quality: 90 }
            ]
        };
    }

    loadAgendaSampleData() {
        this.agendaData = {
            today: [
                {
                    id: 'EVT-2024-001',
                    title: 'Reunión Planificación Mantenimiento Mensual',
                    time: '09:00 - 10:30',
                    location: 'Sala Conferencias A',
                    type: 'meeting',
                    participants: ['Carlos Martínez', 'Ana López', 'Miguel Ángel']
                },
                {
                    id: 'EVT-2024-002',
                    title: 'Inspección Torre Norte - Niveles 10-15',
                    time: '11:00 - 13:00',
                    location: 'Torre Norte',
                    type: 'inspection',
                    participants: ['Carlos Martínez', 'Roberto Díaz']
                }
            ],
            upcoming: [
                {
                    id: 'EVT-2024-003',
                    title: 'Capacitación Nuevo Sistema HVAC',
                    time: '16/01/2024 14:00 - 17:00',
                    location: 'Sala Capacitación',
                    type: 'training',
                    participants: ['Todo el equipo']
                }
            ]
        };
    }

    loadNotificationsSampleData() {
        this.notifications = [
            {
                id: 1,
                type: 'critical',
                title: 'ALERTA CRÍTICA: FALLA EN SISTEMA HVAC TORRE NORTE',
                message: 'Torre Norte - Nivel 12 | Temperatura crítica detectada: 32°C',
                time: new Date(Date.now() - 5 * 60 * 1000),
                read: false
            },
            {
                id: 2,
                type: 'warning',
                title: 'MANTENIMIENTO PROGRAMADO ASCENSORES',
                message: 'Ascensores Torre Este | Próximo en 2h 15m',
                time: new Date(Date.now() - 102 * 60 * 1000),
                read: false
            }
        ];
    }

    // ==================== SISTEMA DE NAVEGACIÓN ====================

    switchSection(section) {
        // Actualizar navegación principal
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Mostrar sección seleccionada
        document.getElementById(section).classList.add('active');

        // Actualizar sub-navegación si es necesario
        this.updateSubNavigation(section);

        this.currentSection = section;
        
        // Inicializar componentes específicos de la sección
        this.initializeSectionComponents(section);
    }

    updateSubNavigation(section) {
        const subNav = document.getElementById('ticketsSubNav');
        if (section === 'tickets' && subNav) {
            subNav.style.display = 'block';
        } else if (subNav) {
            subNav.style.display = 'none';
        }
    }

    initializeSectionComponents(section) {
        switch(section) {
            case 'agenda':
                this.initializeAgenda();
                break;
            case 'tickets':
                this.initializeTickets();
                break;
            case 'inventario':
                this.initializeInventory();
                break;
            case 'mantenimiento':
                this.initializeMaintenance();
                break;
            case 'analitica':
                this.initializeAnalytics();
                break;
        }
    }

    // ==================== SECCIÓN TICKETS - COMPLETAMENTE FUNCIONAL ====================

    initializeTickets() {
        this.renderTicketsGrid();
        this.updateTicketCounts();
        this.updateSubNavCounts();
    }

    renderTicketsGrid() {
        const grid = document.getElementById('ticketsGrid');
        if (!grid) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const ticketsToShow = this.filteredTickets.slice(startIndex, endIndex);

        grid.innerHTML = ticketsToShow.map(ticket => this.createTicketCard(ticket)).join('');

        this.updatePagination();
        this.updateTicketCounts();
    }

    createTicketCard(ticket) {
        const priorityClass = ticket.priority;
        const statusClass = ticket.status;
        const statusText = this.getStatusText(ticket.status);
        
        return `
            <div class="ticket-card ${priorityClass}" onclick="dashboard.viewTicketDetails('${ticket.id}')">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-priority priority-${ticket.priority}">${this.getPriorityText(ticket.priority)}</span>
                </div>
                <h3 class="ticket-title">${ticket.title}</h3>
                <p class="ticket-description">${ticket.description}</p>
                <div class="ticket-meta">
                    <div class="meta-item">
                        <span class="meta-label">Ubicación</span>
                        <span class="meta-value">${ticket.location}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Técnico</span>
                        <span class="meta-value">${ticket.technician}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Tiempo</span>
                        <span class="meta-value">${ticket.estimatedTime}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Fecha</span>
                        <span class="meta-value">${this.formatDate(ticket.createdAt)}</span>
                    </div>
                </div>
                <div class="ticket-footer">
                    <span class="ticket-status status-${ticket.status}">${statusText}</span>
                    <div class="ticket-actions">
                        <button class="btn primary small" onclick="event.stopPropagation(); dashboard.startTicket('${ticket.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn outline small" onclick="event.stopPropagation(); dashboard.editTicket('${ticket.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredTickets = [...this.tickets];
        } else {
            this.filteredTickets = this.tickets.filter(ticket => 
                ticket.title.toLowerCase().includes(searchTerm) ||
                ticket.id.toLowerCase().includes(searchTerm) ||
                ticket.location.toLowerCase().includes(searchTerm) ||
                ticket.technician.toLowerCase().includes(searchTerm) ||
                ticket.category.toLowerCase().includes(searchTerm) ||
                ticket.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.renderTicketsGrid();
        this.updateTicketCounts();
    }

    filterTickets() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

        this.filteredTickets = this.tickets.filter(ticket => {
            const statusMatch = statusFilter === 'all' || ticket.status === statusFilter;
            const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
            const categoryMatch = categoryFilter === 'all' || ticket.category === categoryFilter;

            return statusMatch && priorityMatch && categoryMatch;
        });

        this.currentPage = 1;
        this.renderTicketsGrid();
        this.updateTicketCounts();
    }

    filterTicketsBySubNav(filter) {
        // Actualizar sub-navegación
        document.querySelectorAll('.sub-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-filter="${filter}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Aplicar filtro
        switch(filter) {
            case 'all':
                this.filteredTickets = [...this.tickets];
                break;
            case 'critical':
                this.filteredTickets = this.tickets.filter(t => t.priority === 'critical');
                break;
            case 'progress':
                this.filteredTickets = this.tickets.filter(t => t.status === 'in-progress');
                break;
            case 'pending':
                this.filteredTickets = this.tickets.filter(t => t.status === 'pending');
                break;
            case 'completed':
                this.filteredTickets = this.tickets.filter(t => t.status === 'completed');
                break;
            default:
                this.filteredTickets = [...this.tickets];
        }

        this.currentPage = 1;
        this.renderTicketsGrid();
        this.updateTicketCounts();
        
        // Mostrar notificación del filtro aplicado
        const filterText = this.getFilterText(filter);
        this.showNotification(`Filtro aplicado: ${filterText}`, 'info');
    }

    sortTickets() {
        const sortBy = document.getElementById('sortSelect')?.value || 'newest';

        this.filteredTickets.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority':
                    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'status':
                    const statusOrder = { pending: 0, 'in-progress': 1, waiting: 2, completed: 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                default:
                    return 0;
            }
        });

        this.renderTicketsGrid();
    }

    // VISTAS DE TICKETS
    changeView(view) {
        this.currentView = view;
        
        // Actualizar botones de vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Ocultar todas las vistas
        document.getElementById('gridView').style.display = 'none';
        document.getElementById('kanbanView').style.display = 'none';
        document.getElementById('listView').style.display = 'none';

        // Mostrar vista seleccionada
        switch(view) {
            case 'grid':
                document.getElementById('gridView').style.display = 'block';
                this.renderTicketsGrid();
                break;
            case 'kanban':
                document.getElementById('kanbanView').style.display = 'block';
                this.renderKanbanView();
                break;
            case 'list':
                document.getElementById('listView').style.display = 'block';
                this.renderListView();
                break;
        }
    }

    renderKanbanView() {
        const columns = {
            'pending': document.getElementById('kanbanPending'),
            'in-progress': document.getElementById('kanbanProgress'),
            'waiting': document.getElementById('kanbanWaiting'),
            'completed': document.getElementById('kanbanCompleted')
        };

        // Limpiar columnas
        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = '';
        });

        // Agrupar tickets por estado
        const ticketsByStatus = {
            'pending': this.filteredTickets.filter(t => t.status === 'pending'),
            'in-progress': this.filteredTickets.filter(t => t.status === 'in-progress'),
            'waiting': this.filteredTickets.filter(t => t.status === 'waiting'),
            'completed': this.filteredTickets.filter(t => t.status === 'completed')
        };

        // Renderizar tickets en cada columna
        Object.entries(ticketsByStatus).forEach(([status, tickets]) => {
            const column = columns[status];
            if (column) {
                column.innerHTML = tickets.map(ticket => this.createKanbanCard(ticket)).join('');
            }
        });

        // Actualizar contadores de columnas
        this.updateKanbanCounts();
    }

    createKanbanCard(ticket) {
        const priorityClass = ticket.priority;
        
        return `
            <div class="kanban-card ${priorityClass}" draggable="true" 
                 ondragstart="dashboard.dragStart(event, '${ticket.id}')">
                <div class="kanban-card-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-priority priority-${ticket.priority}">${this.getPriorityText(ticket.priority)}</span>
                </div>
                <h4 class="kanban-card-title">${ticket.title}</h4>
                <div class="kanban-card-meta">
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${ticket.location.split(' - ')[0]}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${ticket.estimatedTime}</span>
                    </div>
                </div>
                <div class="kanban-card-footer">
                    <div class="technician-info">
                        <i class="fas fa-user-hard-hat"></i>
                        <span>${ticket.technician.split(' ')[0]}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateKanbanCounts() {
        const counts = {
            'pending': this.filteredTickets.filter(t => t.status === 'pending').length,
            'in-progress': this.filteredTickets.filter(t => t.status === 'in-progress').length,
            'waiting': this.filteredTickets.filter(t => t.status === 'waiting').length,
            'completed': this.filteredTickets.filter(t => t.status === 'completed').length
        };

        Object.entries(counts).forEach(([status, count]) => {
            const countElement = document.querySelector(`[data-status="${status}"] .column-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    renderListView() {
        const tableBody = document.getElementById('ticketsTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const ticketsToShow = this.filteredTickets.slice(startIndex, endIndex);

        tableBody.innerHTML = ticketsToShow.map(ticket => this.createListRow(ticket)).join('');

        this.updatePagination();
    }

    createListRow(ticket) {
        const priorityClass = ticket.priority;
        const statusClass = ticket.status;
        const statusText = this.getStatusText(ticket.status);
        
        return `
            <tr class="ticket-row">
                <td class="select-col">
                    <input type="checkbox" onchange="dashboard.toggleTicketSelection('${ticket.id}', this.checked)">
                </td>
                <td class="id-col">${ticket.id}</td>
                <td class="title-col">${ticket.title}</td>
                <td class="priority-col">
                    <span class="priority-badge priority-${ticket.priority}">${this.getPriorityText(ticket.priority)}</span>
                </td>
                <td class="status-col">
                    <span class="status-badge status-${ticket.status}">${statusText}</span>
                </td>
                <td class="category-col">${this.getCategoryText(ticket.category)}</td>
                <td class="technician-col">${ticket.technician}</td>
                <td class="date-col">${this.formatDate(ticket.createdAt)}</td>
                <td class="actions-col">
                    <div class="table-actions">
                        <button class="btn outline small" onclick="dashboard.startTicket('${ticket.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn outline small" onclick="dashboard.editTicket('${ticket.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn outline small" onclick="dashboard.viewTicketDetails('${ticket.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // PAGINACIÓN
    updatePagination() {
        const totalPages = Math.ceil(this.filteredTickets.length / this.itemsPerPage);
        const pageInfo = document.querySelector('.page-info');
        
        if (pageInfo) {
            pageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
        }

        // Actualizar estado de botones
        const prevBtn = document.querySelector('.page-btn:nth-child(1)');
        const nextBtn = document.querySelector('.page-btn:nth-child(3)');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderCurrentView();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredTickets.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderCurrentView();
        }
    }

    renderCurrentView() {
        switch(this.currentView) {
            case 'grid':
                this.renderTicketsGrid();
                break;
            case 'kanban':
                this.renderKanbanView();
                break;
            case 'list':
                this.renderListView();
                break;
        }
    }

    // SELECCIÓN MÚLTIPLE
    toggleTicketSelection(ticketId, isSelected) {
        if (isSelected) {
            this.selectedTickets.add(ticketId);
        } else {
            this.selectedTickets.delete(ticketId);
        }
        this.updateBulkActions();
    }

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('#ticketsTableBody input[type="checkbox"]');
        const selectAllCheckbox = document.querySelector('#selectAllCheckbox');
        
        this.isSelectAll = !this.isSelectAll;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.isSelectAll;
            const ticketId = checkbox.getAttribute('onchange').split("'")[1];
            this.toggleTicketSelection(ticketId, this.isSelectAll);
        });
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.isSelectAll;
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (bulkActions && selectedCount) {
            if (this.selectedTickets.size > 0) {
                bulkActions.style.display = 'flex';
                selectedCount.textContent = this.selectedTickets.size;
            } else {
                bulkActions.style.display = 'none';
            }
        }
    }

    executeBulkAction(action) {
        if (this.selectedTickets.size === 0) return;

        switch(action) {
            case 'assign':
                this.showBulkAssignModal();
                break;
            case 'priority':
                this.showBulkPriorityModal();
                break;
            case 'status':
                this.showBulkStatusModal();
                break;
            case 'delete':
                this.showBulkDeleteModal();
                break;
        }
    }

    showBulkAssignModal() {
        const modal = document.getElementById('bulkAssignModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showBulkPriorityModal() {
        const modal = document.getElementById('bulkPriorityModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showBulkStatusModal() {
        const modal = document.getElementById('bulkStatusModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    showBulkDeleteModal() {
        const modal = document.getElementById('bulkDeleteModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // GESTIÓN DE TICKETS INDIVIDUALES
    viewTicketDetails(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const modal = document.getElementById('ticketDetailsModal');
        if (!modal) return;

        // Actualizar contenido del modal
        document.getElementById('detailTicketId').textContent = ticket.id;
        document.getElementById('detailTicketTitle').textContent = ticket.title;
        document.getElementById('detailTicketDescription').textContent = ticket.description;
        document.getElementById('detailTicketLocation').textContent = ticket.location;
        document.getElementById('detailTicketTechnician').textContent = ticket.technician;
        document.getElementById('detailTicketSupervisor').textContent = ticket.supervisor;
        document.getElementById('detailTicketCreated').textContent = this.formatDateTime(ticket.createdAt);
        document.getElementById('detailTicketScheduled').textContent = this.formatDateTime(ticket.scheduledFor);
        document.getElementById('detailTicketEstimated').textContent = ticket.estimatedTime;
        
        // Actualizar estado y prioridad
        document.getElementById('detailTicketPriority').textContent = this.getPriorityText(ticket.priority);
        document.getElementById('detailTicketPriority').className = `priority-badge priority-${ticket.priority}`;
        document.getElementById('detailTicketStatus').textContent = this.getStatusText(ticket.status);
        document.getElementById('detailTicketStatus').className = `status-badge status-${ticket.status}`;

        // Actualizar materiales
        const materialsList = document.getElementById('detailTicketMaterials');
        if (materialsList) {
            materialsList.innerHTML = ticket.materials.map(material => 
                `<li>${material}</li>`
            ).join('');
        }

        // Actualizar historial
        const historyList = document.getElementById('detailTicketHistory');
        if (historyList) {
            historyList.innerHTML = ticket.history.map(entry => `
                <div class="history-entry">
                    <div class="history-header">
                        <span class="history-action">${entry.action}</span>
                        <span class="history-time">${this.formatDateTime(entry.timestamp)}</span>
                    </div>
                    <div class="history-user">Por: ${entry.user}</div>
                    <div class="history-details">${entry.details}</div>
                </div>
            `).join('');
        }

        // Actualizar progreso
        const progressBar = document.getElementById('detailTicketProgress');
        const progressText = document.getElementById('detailTicketProgressText');
        if (progressBar && progressText) {
            progressBar.style.width = `${ticket.progress}%`;
            progressText.textContent = `${ticket.progress}% completado`;
        }

        // Mostrar modal
        modal.style.display = 'flex';
    }

    startTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        if (ticket.status === 'pending') {
            ticket.status = 'in-progress';
            ticket.progress = 10;
            
            // Agregar al historial
            ticket.history.push({
                action: 'Trabajo iniciado',
                user: 'Sistema',
                timestamp: new Date(),
                details: 'El técnico ha iniciado el trabajo en este ticket'
            });

            this.showNotification(`Ticket ${ticketId} iniciado`, 'success');
            this.updateDisplay();
        } else {
            this.showNotification(`El ticket ${ticketId} ya está en progreso`, 'warning');
        }
    }

    editTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Aquí implementarías la lógica para editar el ticket
        this.showNotification(`Editando ticket: ${ticketId}`, 'info');
    }

    // ==================== SISTEMA DE DRAG & DROP ====================

    initializeDragAndDrop() {
        const columns = document.querySelectorAll('.kanban-column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const ticketId = e.dataTransfer.getData('text/plain');
                const newStatus = column.getAttribute('data-status');
                
                this.moveTicketToStatus(ticketId, newStatus);
            });
        });
    }

    dragStart(event, ticketId) {
        event.dataTransfer.setData('text/plain', ticketId);
        event.currentTarget.classList.add('dragging');
    }

    moveTicketToStatus(ticketId, newStatus) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const oldStatus = ticket.status;
        ticket.status = newStatus;

        // Actualizar progreso basado en el nuevo estado
        switch(newStatus) {
            case 'in-progress':
                ticket.progress = Math.max(ticket.progress, 25);
                break;
            case 'waiting':
                ticket.progress = Math.max(ticket.progress, 50);
                break;
            case 'completed':
                ticket.progress = 100;
                break;
        }

        // Agregar al historial
        ticket.history.push({
            action: `Estado cambiado a ${this.getStatusText(newStatus)}`,
            user: 'Sistema',
            timestamp: new Date(),
            details: `Ticket movido de ${this.getStatusText(oldStatus)} a ${this.getStatusText(newStatus)}`
        });

        this.showNotification(`Ticket ${ticketId} movido a ${this.getStatusText(newStatus)}`, 'success');
        this.updateDisplay();
    }

    // ==================== SISTEMA DE NOTIFICACIONES ====================

    toggleNotifications() {
        const panel = document.getElementById('notificationsPanel');
        if (!panel) return;

        this.isNotificationsOpen = !this.isNotificationsOpen;
        
        if (this.isNotificationsOpen) {
            panel.style.display = 'block';
            this.renderNotifications();
        } else {
            panel.style.display = 'none';
        }
    }

    closeNotificationsPanel() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = 'none';
            this.isNotificationsOpen = false;
        }
    }

    renderNotifications() {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        container.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatRelativeTime(notification.time)}</div>
                </div>
                <div class="notification-actions">
                    <button class="btn icon small" onclick="dashboard.markNotificationAsRead(${notification.id})">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Actualizar contador de notificaciones
        this.updateNotificationBadge();
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación toast
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Agregar al contenedor de toasts
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 5000);
        }
    }

    // ==================== GESTIÓN DE MANTENIMIENTO ====================

    initializeMaintenance() {
        this.renderMaintenanceTabs();
        this.updateMaintenanceStats();
    }

    switchMaintenanceTab(tab) {
        this.currentMaintenanceTab = tab;
        
        // Actualizar pestañas activas
        document.querySelectorAll('.maintenance-tab').forEach(tabElement => {
            tabElement.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Renderizar contenido de la pestaña
        this.renderMaintenanceContent(tab);
    }

    renderMaintenanceTabs() {
        const tabs = ['today', 'upcoming', 'overdue', 'completed'];
        
        tabs.forEach(tab => {
            const count = this.maintenanceData[tab]?.length || 0;
            const badge = document.querySelector(`[data-tab="${tab}"] .tab-badge`);
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    renderMaintenanceContent(tab) {
        const container = document.getElementById('maintenanceContent');
        if (!container) return;

        const tasks = this.maintenanceData[tab] || [];
        
        container.innerHTML = tasks.map(task => this.createMaintenanceCard(task, tab)).join('');
    }

    createMaintenanceCard(task, tab) {
        const priorityClass = task.priority;
        const statusClass = task.status;
        
        return `
            <div class="maintenance-card ${priorityClass}">
                <div class="maintenance-header">
                    <div class="maintenance-info">
                        <span class="maintenance-id">${task.id}</span>
                        <span class="maintenance-type">${this.getMaintenanceTypeText(task.type)}</span>
                    </div>
                    <div class="maintenance-priority">
                        <span class="priority-badge priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                    </div>
                </div>
                <h3 class="maintenance-title">${task.title}</h3>
                <p class="maintenance-description">${task.description}</p>
                <div class="maintenance-meta">
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${task.location}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-user-hard-hat"></i>
                        <span>${task.technician}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${task.scheduledTime}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-hourglass-half"></i>
                        <span>${task.duration}</span>
                    </div>
                </div>
                ${tab === 'overdue' ? `
                    <div class="overdue-alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Vencido hace ${task.overdueDays} días</span>
                    </div>
                ` : ''}
                ${tab === 'completed' ? `
                    <div class="completion-info">
                        <i class="fas fa-check-circle"></i>
                        <span>Completado el ${task.completionDate} por ${task.completedBy}</span>
                    </div>
                ` : ''}
                <div class="maintenance-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                    <span class="progress-text">${task.progress}%</span>
                </div>
                <div class="maintenance-actions">
                    ${tab !== 'completed' ? `
                        <button class="btn primary small" onclick="dashboard.startMaintenance('${task.id}')">
                            <i class="fas fa-play"></i> Iniciar
                        </button>
                    ` : ''}
                    <button class="btn outline small" onclick="dashboard.viewMaintenanceDetails('${task.id}')">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    ${tab === 'overdue' ? `
                        <button class="btn warning small" onclick="dashboard.rescheduleMaintenance('${task.id}')">
                            <i class="fas fa-calendar-alt"></i> Reprogramar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateMaintenanceStats() {
        const stats = {
            today: this.maintenanceData.today?.length || 0,
            upcoming: this.maintenanceData.upcoming?.length || 0,
            overdue: this.maintenanceData.overdue?.length || 0,
            completed: this.maintenanceData.completed?.length || 0
        };

        // Actualizar tarjetas de estadísticas
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // ==================== INVENTARIO ====================

    initializeInventory() {
        this.renderInventoryTable();
        this.updateInventoryStats();
    }

    renderInventoryTable() {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = this.inventoryData.map(item => this.createInventoryRow(item)).join('');
    }

    createInventoryRow(item) {
        const statusClass = item.status;
        const stockPercentage = (item.currentStock / item.maxStock) * 100;
        
        return `
            <tr class="inventory-row">
                <td class="inventory-id">${item.id}</td>
                <td class="inventory-name">${item.name}</td>
                <td class="inventory-category">${this.getCategoryText(item.category)}</td>
                <td class="inventory-stock">
                    <div class="stock-info">
                        <span class="stock-current">${item.currentStock}</span>
                        <span class="stock-range">/ ${item.maxStock}</span>
                    </div>
                    <div class="stock-bar">
                        <div class="stock-fill ${statusClass}" style="width: ${stockPercentage}%"></div>
                    </div>
                </td>
                <td class="inventory-status">
                    <span class="status-badge status-${item.status}">${this.getStockStatusText(item.status)}</span>
                </td>
                <td class="inventory-location">${item.location}</td>
                <td class="inventory-supplier">${item.supplier}</td>
                <td class="inventory-cost">$${item.unitCost.toFixed(2)}</td>
                <td class="inventory-actions">
                    <div class="table-actions">
                        <button class="btn outline small" onclick="dashboard.reorderItem('${item.id}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="btn outline small" onclick="dashboard.editInventoryItem('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateInventoryStats() {
        const totalItems = this.inventoryData.length;
        const criticalItems = this.inventoryData.filter(item => item.status === 'critical').length;
        const lowItems = this.inventoryData.filter(item => item.status === 'low').length;
        const totalValue = this.inventoryData.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

        // Actualizar estadísticas
        const totalElement = document.querySelector('[data-stat="total-items"]');
        const criticalElement = document.querySelector('[data-stat="critical-items"]');
        const lowElement = document.querySelector('[data-stat="low-items"]');
        const valueElement = document.querySelector('[data-stat="total-value"]');

        if (totalElement) totalElement.textContent = totalItems;
        if (criticalElement) criticalElement.textContent = criticalItems;
        if (lowElement) lowElement.textContent = lowItems;
        if (valueElement) valueElement.textContent = `$${totalValue.toLocaleString()}`;
    }

    // ==================== ANÁLITICAS ====================

    initializeAnalytics() {
        this.renderAnalyticsCharts();
        this.updateAnalyticsStats();
    }

    initializeCharts() {
        // Los gráficos se inicializan cuando se carga la sección de analíticas
    }

    renderAnalyticsCharts() {
        // Implementar la renderización de gráficos usando Chart.js
        // Por ahora, mostramos datos de ejemplo
        this.updateAnalyticsStats();
    }

    updateAnalyticsStats() {
        const stats = {
            efficiency: 87,
            responseTime: 32,
            ticketsResolved: 156,
            maintenanceCost: 12500
        };

        // Actualizar tarjetas de estadísticas
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                if (key === 'maintenanceCost') {
                    element.textContent = `$${value.toLocaleString()}`;
                } else if (key === 'responseTime') {
                    element.textContent = `${value} min`;
                } else if (key === 'efficiency') {
                    element.textContent = `${value}%`;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    // ==================== AGENDA ====================

    initializeAgenda() {
        this.renderAgenda();
        this.updateAgendaStats();
    }

    renderAgenda() {
        this.renderTodayAgenda();
        this.renderUpcomingAgenda();
    }

    renderTodayAgenda() {
        const container = document.getElementById('todayAgenda');
        if (!container) return;

        const todayEvents = this.agendaData.today || [];
        
        container.innerHTML = todayEvents.map(event => this.createAgendaCard(event, 'today')).join('');
    }

    renderUpcomingAgenda() {
        const container = document.getElementById('upcomingAgenda');
        if (!container) return;

        const upcomingEvents = this.agendaData.upcoming || [];
        
        container.innerHTML = upcomingEvents.map(event => this.createAgendaCard(event, 'upcoming')).join('');
    }

    createAgendaCard(event, type) {
        const typeClass = event.type;
        
        return `
            <div class="agenda-card ${typeClass}">
                <div class="agenda-header">
                    <div class="agenda-type">
                        <i class="fas fa-${this.getAgendaIcon(event.type)}"></i>
                        <span>${this.getAgendaTypeText(event.type)}</span>
                    </div>
                    <div class="agenda-time">${event.time}</div>
                </div>
                <h3 class="agenda-title">${event.title}</h3>
                <div class="agenda-meta">
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${event.participants.join(', ')}</span>
                    </div>
                </div>
                <div class="agenda-actions">
                    <button class="btn outline small" onclick="dashboard.viewEventDetails('${event.id}')">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    ${type === 'today' ? `
                        <button class="btn primary small" onclick="dashboard.startEvent('${event.id}')">
                            <i class="fas fa-play"></i> Iniciar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateAgendaStats() {
        const todayCount = this.agendaData.today?.length || 0;
        const upcomingCount = this.agendaData.upcoming?.length || 0;

        const todayElement = document.querySelector('[data-stat="today-events"]');
        const upcomingElement = document.querySelector('[data-stat="upcoming-events"]');

        if (todayElement) todayElement.textContent = todayCount;
        if (upcomingElement) upcomingElement.textContent = upcomingCount;
    }

    // ==================== UTILIDADES ====================

    getPriorityText(priority) {
        const priorities = {
            'critical': 'Crítico',
            'high': 'Alto',
            'medium': 'Medio',
            'low': 'Bajo'
        };
        return priorities[priority] || priority;
    }

    getStatusText(status) {
        const statuses = {
            'pending': 'Pendiente',
            'in-progress': 'En Progreso',
            'waiting': 'En Espera',
            'completed': 'Completado'
        };
        return statuses[status] || status;
    }

    getCategoryText(category) {
        const categories = {
            'hvac': 'HVAC',
            'electrico': 'Eléctrico',
            'mecanico': 'Mecánico',
            'hidraulico': 'Hidráulico',
            'seguridad': 'Seguridad'
        };
        return categories[category] || category;
    }

    getFilterText(filter) {
        const filters = {
            'all': 'Todos los tickets',
            'critical': 'Críticos',
            'progress': 'En Progreso',
            'pending': 'Pendientes',
            'completed': 'Completados'
        };
        return filters[filter] || filter;
    }

    getMaintenanceTypeText(type) {
        const types = {
            'preventivo': 'Preventivo',
            'correctivo': 'Correctivo',
            'predictivo': 'Predictivo'
        };
        return types[type] || type;
    }

    getStockStatusText(status) {
        const statuses = {
            'critical': 'Crítico',
            'low': 'Bajo',
            'normal': 'Normal',
            'high': 'Alto'
        };
        return statuses[status] || status;
    }

    getAgendaTypeText(type) {
        const types = {
            'meeting': 'Reunión',
            'inspection': 'Inspección',
            'training': 'Capacitación',
            'maintenance': 'Mantenimiento'
        };
        return types[type] || type;
    }

    getNotificationIcon(type) {
        const icons = {
            'critical': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle',
            'success': 'check-circle'
        };
        return icons[type] || 'bell';
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getAgendaIcon(type) {
        const icons = {
            'meeting': 'users',
            'inspection': 'clipboard-check',
            'training': 'graduation-cap',
            'maintenance': 'tools'
        };
        return icons[type] || 'calendar';
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES');
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays === 1) return 'Ayer';
        return `Hace ${diffDays} días`;
    }

    updateTicketCounts() {
        const totalCount = this.filteredTickets.length;
        const criticalCount = this.filteredTickets.filter(t => t.priority === 'critical').length;
        const inProgressCount = this.filteredTickets.filter(t => t.status === 'in-progress').length;

        // Actualizar contadores en la UI
        const totalElement = document.querySelector('[data-count="total"]');
        const criticalElement = document.querySelector('[data-count="critical"]');
        const progressElement = document.querySelector('[data-count="progress"]');

        if (totalElement) totalElement.textContent = totalCount;
        if (criticalElement) criticalElement.textContent = criticalCount;
        if (progressElement) progressElement.textContent = inProgressCount;
    }

    updateSubNavCounts() {
        const counts = {
            'all': this.tickets.length,
            'critical': this.tickets.filter(t => t.priority === 'critical').length,
            'progress': this.tickets.filter(t => t.status === 'in-progress').length,
            'pending': this.tickets.filter(t => t.status === 'pending').length,
            'completed': this.tickets.filter(t => t.status === 'completed').length
        };

        Object.entries(counts).forEach(([filter, count]) => {
            const badge = document.querySelector(`[data-filter="${filter}"] .sub-nav-badge`);
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    updateDisplay() {
        this.renderCurrentView();
        this.updateTicketCounts();
        this.updateSubNavCounts();
        this.updateNotificationBadge();
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // ==================== ACTUALIZACIONES EN TIEMPO REAL ====================

    startRealTimeUpdates() {
        // Simular actualizaciones en tiempo real
        setInterval(() => {
            this.simulateRealTimeUpdates();
        }, 30000); // Cada 30 segundos
    }

    simulateRealTimeUpdates() {
        // Simular cambios en el estado de los tickets
        this.tickets.forEach(ticket => {
            if (ticket.status === 'in-progress' && ticket.progress < 100) {
                // Incrementar progreso aleatoriamente
                const increment = Math.random() * 10;
                ticket.progress = Math.min(100, ticket.progress + increment);
                
                // Si el progreso llega a 100%, marcar como completado
                if (ticket.progress >= 100) {
                    ticket.status = 'completed';
                    ticket.history.push({
                        action: 'Trabajo completado',
                        user: 'Sistema',
                        timestamp: new Date(),
                        details: 'Progreso alcanzó el 100% - Ticket completado automáticamente'
                    });
                    
                    this.showNotification(`Ticket ${ticket.id} completado automáticamente`, 'success');
                }
            }
        });

        this.updateDisplay();
    }

    // ==================== MÉTODOS DE PRUEBA Y DEMOSTRACIÓN ====================

    // Método para demostración - agregar un ticket de prueba
    addDemoTicket() {
        const newTicket = {
            id: `TCK-2024-${String(this.tickets.length + 1).padStart(3, '0')}`,
            title: 'Ticket de demostración - Revisión sistema',
            priority: 'medium',
            status: 'pending',
            category: 'electrico',
            location: 'Área de demostración - Nivel 1',
            technician: 'Técnico Demo',
            supervisor: 'Supervisor Demo',
            createdAt: new Date(),
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
            estimatedTime: '1h 30m',
            description: 'Este es un ticket de demostración para probar la funcionalidad del sistema.',
            materials: ['Herramientas básicas', 'Equipo de prueba'],
            progress: 0,
            history: [
                {
                    action: 'Ticket de demostración creado',
                    user: 'Sistema Demo',
                    timestamp: new Date(),
                    details: 'Ticket creado para propósitos de demostración'
                }
            ]
        };

        this.tickets.unshift(newTicket);
        this.filteredTickets.unshift(newTicket);
        
        this.showNotification('Ticket de demostración agregado', 'success');
        this.updateDisplay();
    }

    // Método para limpiar selecciones
    clearSelections() {
        this.selectedTickets.clear();
        this.isSelectAll = false;
        
        const checkboxes = document.querySelectorAll('#ticketsTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const selectAllCheckbox = document.querySelector('#selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        this.updateBulkActions();
    }
}

// Inicializar el dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new DashboardTecnico();
    
    // Agregar manejadores de eventos globales
    document.addEventListener('click', function(e) {
        // Cerrar notificaciones al hacer clic fuera
        if (!e.target.closest('.notifications-container') && 
            !e.target.closest('.notification-btn')) {
            window.dashboard.closeNotificationsPanel();
        }
    });
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});