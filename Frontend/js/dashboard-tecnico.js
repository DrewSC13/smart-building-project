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
        this.showToast(`Filtro aplicado: ${filterText}`, 'info');
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
        const selectAllCheckbox = document.getElementById('selectAll');
        
        this.isSelectAll = !this.isSelectAll;
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.isSelectAll;
            const ticketId = checkbox.closest('tr').querySelector('.id-col').textContent;
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

    bulkAssign() {
        if (this.selectedTickets.size === 0) return;
        this.showToast(`${this.selectedTickets.size} tickets asignados`, 'success');
        this.clearSelections();
    }

    bulkChangePriority() {
        if (this.selectedTickets.size === 0) return;
        this.showToast(`Prioridad cambiada para ${this.selectedTickets.size} tickets`, 'success');
        this.clearSelections();
    }

    bulkChangeStatus() {
        if (this.selectedTickets.size === 0) return;
        this.showToast(`Estado cambiado para ${this.selectedTickets.size} tickets`, 'success');
        this.clearSelections();
    }

    bulkDelete() {
        if (this.selectedTickets.size === 0) return;
        if (confirm(`¿Está seguro de eliminar ${this.selectedTickets.size} tickets?`)) {
            this.tickets = this.tickets.filter(ticket => !this.selectedTickets.has(ticket.id));
            this.filteredTickets = this.filteredTickets.filter(ticket => !this.selectedTickets.has(ticket.id));
            this.showToast(`${this.selectedTickets.size} tickets eliminados`, 'success');
            this.clearSelections();
            this.updateDisplay();
        }
    }

    // GESTIÓN DE TICKETS INDIVIDUALES
    viewTicketDetails(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Actualizar contenido del modal
        document.getElementById('detailTicketId').textContent = ticket.id;
        document.getElementById('detailTicketPriority').textContent = this.getPriorityText(ticket.priority);
        document.getElementById('detailTicketPriority').className = `priority-badge priority-${ticket.priority}`;
        document.getElementById('detailTicketStatus').textContent = this.getStatusText(ticket.status);
        document.getElementById('detailTicketStatus').className = `status-badge status-${ticket.status}`;
        document.getElementById('detailTicketCategory').textContent = this.getCategoryText(ticket.category);
        document.getElementById('detailTicketDescription').textContent = ticket.description;
        document.getElementById('detailTicketLocation').textContent = ticket.location;
        document.getElementById('detailTicketTechnician').textContent = ticket.technician;
        document.getElementById('detailTicketSupervisor').textContent = ticket.supervisor;
        document.getElementById('detailTicketCreated').textContent = this.formatDateTime(ticket.createdAt);
        document.getElementById('detailTicketScheduled').textContent = this.formatDateTime(ticket.scheduledFor);
        document.getElementById('detailTicketEstimated').textContent = ticket.estimatedTime;
        
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
                <div class="history-item">
                    <div class="history-time">${this.formatDateTime(entry.timestamp)}</div>
                    <div class="history-content">
                        <div class="history-action">${entry.action}</div>
                        <div class="history-details">${entry.details} - Por: ${entry.user}</div>
                    </div>
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
        this.openModal('ticketDetailsModal');
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

            this.showToast(`Ticket ${ticketId} iniciado`, 'success');
            this.updateDisplay();
        } else {
            this.showToast(`El ticket ${ticketId} ya está en progreso`, 'warning');
        }
    }

    editTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Aquí implementarías la lógica para editar el ticket
        this.showToast(`Editando ticket: ${ticketId}`, 'info');
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

        this.showToast(`Ticket ${ticketId} movido a ${this.getStatusText(newStatus)}`, 'success');
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
            <div class="alert-item ${notification.type}">
                <div class="alert-header">
                    <div class="alert-title">${notification.title}</div>
                    <div class="alert-time">${this.formatRelativeTime(notification.time)}</div>
                </div>
                <div class="alert-message">${notification.message}</div>
                <div class="alert-actions">
                    <button class="btn outline small" onclick="dashboard.markNotificationAsRead(${notification.id})">
                        <i class="fas fa-check"></i> Marcar como leído
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
            this.showToast('Notificación marcada como leída', 'success');
        }
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-count');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="fas fa-${this.getToastIcon(type)}"></i>
                </div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // ==================== GESTIÓN DE MANTENIMIENTO ====================

    initializeMaintenance() {
        this.renderMaintenanceTabs();
        this.updateMaintenanceStats();
        this.switchMaintenanceTab('today');
    }

    switchMaintenanceTab(tab) {
        this.currentMaintenanceTab = tab;
        
        // Actualizar pestañas activas
        document.querySelectorAll('.tab-btn').forEach(tabElement => {
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
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            }
        });
    }

    renderMaintenanceContent(tab) {
        const container = document.getElementById('maintenanceContent');
        if (!container) return;

        const tasks = this.maintenanceData[tab] || [];
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No hay tareas de mantenimiento</h3>
                    <p>No se encontraron tareas de mantenimiento ${this.getMaintenanceTabText(tab)}.</p>
                </div>
            `;
        } else {
            container.innerHTML = tasks.map(task => this.createMaintenanceCard(task, tab)).join('');
        }
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
            completed: this.maintenanceData.completed?.length || 0,
            overdue: this.maintenanceData.overdue?.length || 0
        };

        // Actualizar tarjetas de estadísticas
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    startMaintenance(taskId) {
        const task = Object.values(this.maintenanceData).flat().find(t => t.id === taskId);
        if (task && task.status === 'pending') {
            task.status = 'in-progress';
            task.progress = 25;
            this.showToast(`Mantenimiento ${taskId} iniciado`, 'success');
            this.renderMaintenanceContent(this.currentMaintenanceTab);
        }
    }

    viewMaintenanceDetails(taskId) {
        const task = Object.values(this.maintenanceData).flat().find(t => t.id === taskId);
        if (task) {
            this.showToast(`Detalles de mantenimiento: ${task.title}`, 'info');
        }
    }

    rescheduleMaintenance(taskId) {
        const task = Object.values(this.maintenanceData).flat().find(t => t.id === taskId);
        if (task) {
            task.status = 'scheduled';
            task.overdueDays = 0;
            // Mover de overdue a upcoming
            this.maintenanceData.overdue = this.maintenanceData.overdue.filter(t => t.id !== taskId);
            this.maintenanceData.upcoming.push(task);
            this.showToast(`Mantenimiento ${taskId} reprogramado`, 'success');
            this.switchMaintenanceTab('upcoming');
        }
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
            <tr class="inventory-item ${statusClass}">
                <td class="select-col">
                    <input type="checkbox" onchange="dashboard.toggleInventorySelection('${item.id}', this.checked)">
                </td>
                <td class="name-col">
                    <strong>${item.name}</strong>
                    <small>${item.id}</small>
                </td>
                <td class="category-col">${this.getCategoryText(item.category)}</td>
                <td class="stock-col">
                    <div class="stock-info">
                        <span class="stock-value ${statusClass}">${item.currentStock}</span>
                        <div class="stock-bar">
                            <div class="stock-fill ${statusClass}" style="width: ${stockPercentage}%"></div>
                        </div>
                    </div>
                </td>
                <td class="min-col">${item.minStock}</td>
                <td class="location-col">${item.location}</td>
                <td class="status-col">
                    <span class="status-badge status-${item.status}">${this.getStockStatusText(item.status)}</span>
                </td>
                <td class="actions-col">
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

        // Actualizar estadísticas
        const totalElement = document.querySelector('[data-stat="total-items"]');
        const criticalElement = document.querySelector('[data-stat="critical-items"]');
        const lowElement = document.querySelector('[data-stat="low-items"]');

        if (totalElement) totalElement.textContent = totalItems;
        if (criticalElement) criticalElement.textContent = criticalItems;
        if (lowElement) lowElement.textContent = lowItems;
    }

    reorderItem(itemId) {
        const item = this.inventoryData.find(i => i.id === itemId);
        if (item) {
            item.currentStock = item.maxStock;
            item.status = 'normal';
            this.showToast(`Pedido realizado para ${item.name}`, 'success');
            this.renderInventoryTable();
            this.updateInventoryStats();
        }
    }

    editInventoryItem(itemId) {
        const item = this.inventoryData.find(i => i.id === itemId);
        if (item) {
            this.showToast(`Editando item: ${item.name}`, 'info');
        }
    }

    toggleInventorySelection(itemId, isSelected) {
        // Implementar selección de inventario si es necesario
    }

    toggleSelectAllInventory() {
        // Implementar selección total de inventario
    }

    searchInventory(query) {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) return;

        const searchTerm = query.toLowerCase().trim();
        let filteredData = this.inventoryData;

        if (searchTerm) {
            filteredData = this.inventoryData.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.id.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm) ||
                item.supplier.toLowerCase().includes(searchTerm)
            );
        }

        tableBody.innerHTML = filteredData.map(item => this.createInventoryRow(item)).join('');
    }

    filterInventory() {
        const categoryFilter = document.getElementById('inventoryCategoryFilter')?.value || 'all';
        const statusFilter = document.getElementById('inventoryStatusFilter')?.value || 'all';
        const locationFilter = document.getElementById('inventoryLocationFilter')?.value || 'all';

        let filteredData = this.inventoryData;

        if (categoryFilter !== 'all') {
            filteredData = filteredData.filter(item => item.category === categoryFilter);
        }

        if (statusFilter !== 'all') {
            filteredData = filteredData.filter(item => item.status === statusFilter);
        }

        if (locationFilter !== 'all') {
            filteredData = filteredData.filter(item => item.location.includes(locationFilter));
        }

        const tableBody = document.getElementById('inventoryTableBody');
        if (tableBody) {
            tableBody.innerHTML = filteredData.map(item => this.createInventoryRow(item)).join('');
        }
    }

    clearInventorySearch() {
        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.value = '';
            this.searchInventory('');
        }
    }

    // ==================== ANÁLITICAS ====================

    initializeAnalytics() {
        this.renderAnalyticsCharts();
        this.updateAnalyticsStats();
    }

    initializeCharts() {
        // Inicializar gráficos cuando se cargue la sección de analíticas
        if (this.currentSection === 'analitica') {
            this.renderAnalyticsCharts();
        }
    }

    renderAnalyticsCharts() {
        // Implementar gráficos con Chart.js
        this.createCategoryTrendChart();
        this.createPriorityDistributionChart();
        this.createTechnicianEfficiencyChart();
    }

    createCategoryTrendChart() {
        const ctx = document.getElementById('categoryTrendChart');
        if (!ctx) return;

        // Datos de ejemplo para el gráfico
        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'HVAC',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: '#0066cc',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Eléctrico',
                    data: [28, 48, 40, 19, 86, 27],
                    borderColor: '#00c853',
                    backgroundColor: 'rgba(0, 200, 83, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Hidráulico',
                    data: [45, 25, 60, 35, 40, 50],
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.4
                }
            ]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Tendencia de Tickets por Categoría'
                    }
                }
            }
        });
    }

    createPriorityDistributionChart() {
        const ctx = document.getElementById('priorityDistributionChart');
        if (!ctx) return;

        const data = {
            labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
            datasets: [{
                data: [12, 19, 8, 15],
                backgroundColor: [
                    '#f44336',
                    '#ff9800',
                    '#2196f3',
                    '#4caf50'
                ]
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    createTechnicianEfficiencyChart() {
        const ctx = document.getElementById('technicianEfficiencyChart');
        if (!ctx) return;

        const data = {
            labels: ['Carlos M.', 'Ana L.', 'Miguel A.', 'Laura S.'],
            datasets: [{
                label: 'Eficiencia (%)',
                data: [92, 88, 85, 90],
                backgroundColor: '#0066cc'
            }]
        };

        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateAnalyticsStats() {
        const stats = {
            efficiency: 94.7,
            ticketsResolved: 87,
            responseTime: 28,
            productivity: 78
        };

        // Actualizar tarjetas de estadísticas
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                if (key === 'efficiency' || key === 'ticketsResolved' || key === 'productivity') {
                    element.textContent = `${value}%`;
                } else if (key === 'responseTime') {
                    element.textContent = `${value} min`;
                }
            }
        });
    }

    updateAnalytics() {
        const range = document.getElementById('analyticsRange')?.value || '7d';
        this.showToast(`Rango de análisis actualizado: ${this.getAnalyticsRangeText(range)}`, 'info');
        this.renderAnalyticsCharts();
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
        
        if (todayEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <h3>No hay eventos para hoy</h3>
                    <p>No se encontraron eventos programados para el día de hoy.</p>
                </div>
            `;
        } else {
            container.innerHTML = todayEvents.map(event => this.createTimelineEvent(event)).join('');
        }
    }

    renderUpcomingAgenda() {
        const container = document.getElementById('upcomingAgenda');
        if (!container) return;

        const upcomingEvents = this.agendaData.upcoming || [];
        
        if (upcomingEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No hay eventos próximos</h3>
                    <p>No se encontraron eventos programados para los próximos días.</p>
                </div>
            `;
        } else {
            container.innerHTML = upcomingEvents.map(event => this.createUpcomingEvent(event)).join('');
        }
    }

    createTimelineEvent(event) {
        return `
            <div class="timeline-event">
                <div class="event-time">${event.time.split(' - ')[0]}</div>
                <div class="event-content">
                    <div class="event-header">
                        <h4 class="event-title">${event.title}</h4>
                        <span class="event-type">${this.getAgendaTypeText(event.type)}</span>
                    </div>
                    <div class="event-details">
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>${event.participants.join(', ')}</span>
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn primary small" onclick="dashboard.startEvent('${event.id}')">
                            <i class="fas fa-play"></i> Iniciar
                        </button>
                        <button class="btn outline small" onclick="dashboard.viewEventDetails('${event.id}')">
                            <i class="fas fa-info-circle"></i> Detalles
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createUpcomingEvent(event) {
        const eventDate = new Date(event.time.split(' ')[0]);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
        
        return `
            <div class="upcoming-event">
                <div class="event-date">
                    <div class="day">${day}</div>
                    <div class="month">${month}</div>
                </div>
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p>${event.location}</p>
                    <div class="event-time">${event.time.split(' ')[1]}</div>
                </div>
            </div>
        `;
    }

    updateAgendaStats() {
        const todayCount = this.agendaData.today?.length || 0;
        const upcomingCount = this.agendaData.upcoming?.length || 0;

        const todayElement = document.querySelector('[data-stat="today-events"]');
        if (todayElement) todayElement.textContent = todayCount;

        // Actualizar métricas rápidas
        const metrics = document.querySelectorAll('.metric-value[data-stat="today-events"]');
        metrics.forEach(metric => {
            metric.textContent = todayCount;
        });
    }

    startEvent(eventId) {
        const event = Object.values(this.agendaData).flat().find(e => e.id === eventId);
        if (event) {
            this.showToast(`Evento iniciado: ${event.title}`, 'success');
        }
    }

    viewEventDetails(eventId) {
        const event = Object.values(this.agendaData).flat().find(e => e.id === eventId);
        if (event) {
            this.showToast(`Detalles del evento: ${event.title}`, 'info');
        }
    }

    // ==================== MODALES ====================

    openNewTicketModal() {
        this.openModal('newTicketModal');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
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

    submitNewTicket() {
        const title = document.getElementById('ticketTitle')?.value;
        const category = document.getElementById('ticketCategory')?.value;
        const priority = document.getElementById('ticketPriority')?.value;
        const location = document.getElementById('ticketLocation')?.value;
        const description = document.getElementById('ticketDescription')?.value;

        if (!title || !category || !priority || !location || !description) {
            this.showToast('Por favor complete todos los campos obligatorios', 'error');
            return;
        }

        const newTicket = {
            id: `TCK-2024-${String(this.tickets.length + 1).padStart(3, '0')}`,
            title: title,
            priority: priority,
            status: 'pending',
            category: category,
            location: location,
            technician: 'Por asignar',
            supervisor: 'Sistema',
            createdAt: new Date(),
            scheduledFor: new Date(),
            estimatedTime: '1h 00m',
            description: description,
            materials: [],
            progress: 0,
            history: [
                {
                    action: 'Ticket creado manualmente',
                    user: 'Carlos Martínez',
                    timestamp: new Date(),
                    details: 'Ticket creado a través del formulario de nuevo ticket'
                }
            ]
        };

        this.tickets.unshift(newTicket);
        this.filteredTickets.unshift(newTicket);
        
        this.closeModal('newTicketModal');
        this.showToast('Nuevo ticket creado exitosamente', 'success');
        this.updateDisplay();

        // Limpiar formulario
        document.getElementById('newTicketForm').reset();
    }

    editCurrentTicket() {
        this.showToast('Editando ticket actual...', 'info');
        this.closeModal('ticketDetailsModal');
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
            'seguridad': 'Seguridad',
            'sensores': 'Sensores'
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

    getMaintenanceTabText(tab) {
        const tabs = {
            'today': 'para hoy',
            'upcoming': 'próximos',
            'overdue': 'vencidos',
            'completed': 'completados'
        };
        return tabs[tab] || tab;
    }

    getStockStatusText(status) {
        const statuses = {
            'critical': 'Crítico',
            'low': 'Bajo',
            'normal': 'Normal'
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

    getAnalyticsRangeText(range) {
        const ranges = {
            '7d': 'Últimos 7 días',
            '30d': 'Últimos 30 días',
            '90d': 'Últimos 90 días',
            'ytd': 'Este año'
        };
        return ranges[range] || range;
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
        const countElement = document.querySelector('.tickets-count');
        if (countElement) {
            countElement.textContent = `Mostrando ${totalCount} tickets`;
        }
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
            const countElement = document.querySelector(`[data-filter="${filter}"] .count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    updateDisplay() {
        this.renderCurrentView();
        this.updateTicketCounts();
        this.updateSubNavCounts();
        this.updateNotificationBadge();
    }

    clearSelections() {
        this.selectedTickets.clear();
        this.isSelectAll = false;
        
        const checkboxes = document.querySelectorAll('#ticketsTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        this.updateBulkActions();
    }

    clearSearch() {
        const searchInput = document.getElementById('ticketSearch');
        if (searchInput) {
            searchInput.value = '';
            this.handleSearch('');
        }
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
                    
                    this.showToast(`Ticket ${ticket.id} completado automáticamente`, 'success');
                }
            }
        });

        this.updateDisplay();
    }

    // ==================== MÉTODOS DE DEMOSTRACIÓN ====================

    exportTickets() {
        this.showToast('Exportando tickets...', 'info');
    }

    showBulkActions() {
        this.showToast('Mostrando acciones masivas', 'info');
    }

    syncAgenda() {
        this.showToast('Sincronizando agenda...', 'info');
    }

    previousDay() {
        this.showToast('Navegando al día anterior', 'info');
    }

    nextDay() {
        this.showToast('Navegando al día siguiente', 'info');
    }

    openNewEventModal() {
        this.showToast('Abriendo modal de nuevo evento', 'info');
    }

    openNewItemModal() {
        this.showToast('Abriendo modal de nuevo item', 'info');
    }

    exportInventory() {
        this.showToast('Exportando inventario...', 'info');
    }

    scheduleMaintenance() {
        this.showToast('Programando mantenimiento...', 'info');
    }

    generateMaintenanceReport() {
        this.showToast('Generando reporte de mantenimiento...', 'info');
    }

    previousMonth() {
        this.showToast('Navegando al mes anterior', 'info');
    }

    nextMonth() {
        this.showToast('Navegando al mes siguiente', 'info');
    }

    exportAnalytics() {
        this.showToast('Exportando datos analíticos...', 'info');
    }

    schedulePredictedMaintenance(system) {
        this.showToast(`Programando mantenimiento predictivo para ${system}`, 'info');
    }

    viewOptimizationDetails() {
        this.showToast('Mostrando detalles de optimización', 'info');
    }
}

// Inicializar el dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new DashboardTecnico();
});

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});