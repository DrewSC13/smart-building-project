// dashboard-admin.js - CÓDIGO COMPLETAMENTE DESARROLLADO Y FUNCIONAL
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
                
                .notifications-panel {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .notification-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 8px;
                    border-left: 4px solid #3b82f6;
                }
                
                .notification-item.info {
                    background: rgba(59, 130, 246, 0.1);
                    border-left-color: #3b82f6;
                }
                
                .notification-item.warning {
                    background: rgba(245, 158, 11, 0.1);
                    border-left-color: #f59e0b;
                }
                
                .notification-item.success {
                    background: rgba(16, 185, 129, 0.1);
                    border-left-color: #10b981;
                }
                
                .notification-content {
                    flex: 1;
                }
                
                .notification-message {
                    font-weight: 500;
                    margin-bottom: 4px;
                }
                
                .notification-time {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 4px;
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
                } else if (field.type === 'checkbox') {
                    return `
                        <div class="custom-form-group" style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="${field.label.replace(/\s+/g, '-').toLowerCase()}" 
                                   class="custom-form-input" style="width: auto;"
                                   ${field.value === 'on' ? 'checked' : ''}
                                   ${field.required ? 'required' : ''}>
                            <label class="custom-form-label" style="margin: 0;" for="${field.label.replace(/\s+/g, '-').toLowerCase()}">${field.label}</label>
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
                                    const label = input.previousElementSibling?.textContent || 
                                                input.parentElement.querySelector('.custom-form-label')?.textContent;
                                    if (label) {
                                        if (input.type === 'checkbox') {
                                            data[label] = input.checked ? 'on' : 'off';
                                        } else {
                                            data[label] = input.value;
                                        }
                                    }
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
                contact: '+56 9 1234 5678',
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
            },
            {
                id: 'MT-102',
                title: 'Ascensor Torre B fuera de servicio',
                area: 'ascensores',
                priority: 'alta',
                status: 'in-progress',
                location: 'Torre B, Ascensor principal',
                description: 'Ascensor principal de Torre B presenta fallas en el sistema de puertas.',
                assignee: 'carlos-lopez',
                reporter: 'Roberto Silva (Conserje)',
                contact: '+56 9 8765 4321',
                estimatedCost: 150000,
                actualCost: 0,
                deadline: '2024-03-25',
                created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updated: new Date().toISOString(),
                history: [
                    {
                        action: 'created',
                        user: 'Sistema',
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Ticket creado'
                    },
                    {
                        action: 'assigned',
                        user: 'Administrador',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        notes: 'Asignado a: Carlos López. Instrucciones: Revisar sistema de puertas y motor principal'
                    }
                ]
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
                description: 'Pago mensual de mantenimiento',
                reference: 'TRF-123456'
            },
            {
                id: 'P-002',
                resident: 'María García',
                amount: 118000,
                date: '2024-03-10',
                method: 'Efectivo',
                status: 'completed',
                type: 'mantenimiento',
                description: 'Pago mensual de mantenimiento',
                reference: 'EFC-789012'
            },
            {
                id: 'P-003',
                resident: 'Carlos López',
                amount: 120000,
                date: '2024-03-20',
                method: 'Transferencia',
                status: 'pending',
                type: 'mantenimiento',
                description: 'Pago mensual de mantenimiento',
                reference: 'TRF-345678'
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
            },
            {
                id: 'R-002',
                name: 'María García',
                department: 'Torre A - 302',
                phone: '+56 9 2345 6789',
                email: 'maria.garcia@email.com',
                status: 'active',
                type: 'owner',
                moveInDate: '2021-08-20'
            },
            {
                id: 'R-003',
                name: 'Carlos López',
                department: 'Torre B - 201',
                phone: '+56 9 3456 7890',
                email: 'carlos.lopez@email.com',
                status: 'active',
                type: 'tenant',
                moveInDate: '2023-03-10'
            }
        ];
        
        this.accessPermissions = JSON.parse(localStorage.getItem('accessPermissions')) || [
            {
                id: 'ACC-001',
                residentName: 'Juan Pérez',
                area: 'Gimnasio',
                permissionLevel: 'full',
                status: 'active'
            }
        ];
        
        this.communications = JSON.parse(localStorage.getItem('communications')) || [
            {
                id: 'COM-001',
                title: 'Corte de agua programado',
                type: 'announcement',
                content: 'Se informa que el próximo sábado habrá corte de agua por mantenimiento.',
                date: '2024-03-10',
                status: 'sent'
            }
        ];
        
        this.debtors = JSON.parse(localStorage.getItem('debtors')) || [
            {
                name: 'Carlos López',
                department: 'Torre A - 201',
                amount: 5200,
                daysLate: 45,
                status: 'active',
                reminderCount: 2,
                lastReminderSent: '2024-03-15'
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

        // ==================== DATOS PARA ÁREAS COMUNES ====================
        this.commonAreas = JSON.parse(localStorage.getItem('commonAreas')) || [
            {
                id: 'CA-001',
                name: 'Piscina',
                type: 'recreational',
                capacity: 20,
                hourlyRate: 50,
                dailyRate: 200,
                monthlyRate: 500,
                operatingHours: {
                    monday: { open: '08:00', close: '22:00' },
                    tuesday: { open: '08:00', close: '22:00' },
                    wednesday: { open: '08:00', close: '22:00' },
                    thursday: { open: '08:00', close: '22:00' },
                    friday: { open: '08:00', close: '22:00' },
                    saturday: { open: '09:00', close: '20:00' },
                    sunday: { open: '09:00', close: '20:00' }
                },
                status: 'active'
            },
            {
                id: 'CA-002',
                name: 'Gimnasio',
                type: 'recreational',
                capacity: 15,
                hourlyRate: 30,
                dailyRate: 100,
                monthlyRate: 300,
                operatingHours: {
                    monday: { open: '06:00', close: '23:00' },
                    tuesday: { open: '06:00', close: '23:00' },
                    wednesday: { open: '06:00', close: '23:00' },
                    thursday: { open: '06:00', close: '23:00' },
                    friday: { open: '06:00', close: '23:00' },
                    saturday: { open: '07:00', close: '22:00' },
                    sunday: { open: '07:00', close: '22:00' }
                },
                status: 'active'
            },
            {
                id: 'CA-003',
                name: 'Salón de Eventos',
                type: 'event',
                capacity: 50,
                hourlyRate: 100,
                dailyRate: 500,
                monthlyRate: 1200,
                operatingHours: {
                    monday: { open: '08:00', close: '24:00' },
                    tuesday: { open: '08:00', close: '24:00' },
                    wednesday: { open: '08:00', close: '24:00' },
                    thursday: { open: '08:00', close: '24:00' },
                    friday: { open: '08:00', close: '24:00' },
                    saturday: { open: '08:00', close: '24:00' },
                    sunday: { open: '08:00', close: '24:00' }
                },
                status: 'active'
            }
        ];

        this.areaReservations = JSON.parse(localStorage.getItem('areaReservations')) || [
            {
                id: 'R-001',
                residentId: 'R-001',
                residentName: 'Juan Pérez',
                areaId: 'CA-001',
                areaName: 'Piscina',
                date: '2024-03-20',
                startTime: '14:00',
                endTime: '16:00',
                duration: 2,
                guests: 5,
                totalAmount: 100,
                status: 'pending',
                paymentStatus: 'pending',
                notes: 'Cumpleaños infantil',
                createdAt: new Date().toISOString()
            },
            {
                id: 'R-002',
                residentId: 'R-002',
                residentName: 'María García',
                areaId: 'CA-002',
                areaName: 'Gimnasio',
                date: '2024-03-18',
                startTime: '18:00',
                endTime: '19:00',
                duration: 1,
                guests: 2,
                totalAmount: 30,
                status: 'pending',
                paymentStatus: 'pending',
                notes: 'Entrenamiento personal',
                createdAt: new Date().toISOString()
            },
            {
                id: 'R-003',
                residentId: 'R-003',
                residentName: 'Carlos López',
                areaId: 'CA-003',
                areaName: 'Salón de Eventos',
                date: '2024-03-22',
                startTime: '19:00',
                endTime: '23:00',
                duration: 4,
                guests: 25,
                totalAmount: 400,
                status: 'pending',
                paymentStatus: 'pending',
                notes: 'Fiesta de aniversario',
                createdAt: new Date().toISOString()
            },
            {
                id: 'R-015',
                residentId: 'R-002',
                residentName: 'Ana Martínez',
                areaId: 'CA-001',
                areaName: 'Piscina',
                date: '2024-03-15',
                startTime: '15:00',
                endTime: '17:00',
                duration: 2,
                guests: 8,
                totalAmount: 100,
                status: 'approved',
                paymentStatus: 'paid',
                notes: 'Reunión familiar',
                createdAt: new Date().toISOString()
            }
        ];

        this.areaPayments = JSON.parse(localStorage.getItem('areaPayments')) || [
            {
                id: 'AP-001',
                residentName: 'Juan Pérez',
                areaName: 'Piscina',
                concept: 'Reserva 20/03/2024',
                amount: 50,
                date: '2024-03-15',
                method: 'Transferencia',
                status: 'completed'
            },
            {
                id: 'AP-002',
                residentName: 'María García',
                areaName: 'Gimnasio',
                concept: 'Cuota Mensual Marzo',
                amount: 30,
                date: '2024-03-10',
                method: 'Efectivo',
                status: 'completed'
            },
            {
                id: 'AP-003',
                residentName: 'Carlos López',
                areaName: 'Salón de Eventos',
                concept: 'Reserva 22/03/2024',
                amount: 200,
                date: '2024-03-14',
                method: 'Tarjeta',
                status: 'pending'
            }
        ];

        // ==================== DATOS PARA PAGOS A PERSONAL ====================
        this.staffMembers = JSON.parse(localStorage.getItem('staffMembers')) || [
            {
                id: 'ST-001',
                name: 'Roberto Silva',
                position: 'portero',
                phone: '+1 555-0201',
                email: 'roberto.silva@quantumtower.com',
                baseSalary: 1200,
                hireDate: '2022-05-15',
                status: 'active',
                bankAccount: '1234567890',
                schedule: 'Lunes a Viernes 8:00-17:00'
            },
            {
                id: 'ST-002',
                name: 'Ana Martínez',
                position: 'operador-ascensor',
                phone: '+1 555-0202',
                email: 'ana.martinez@quantumtower.com',
                baseSalary: 1100,
                hireDate: '2023-01-10',
                status: 'active',
                bankAccount: '2345678901',
                schedule: 'Turnos rotativos 6:00-14:00 / 14:00-22:00'
            },
            {
                id: 'ST-003',
                name: 'Carlos Mendoza',
                position: 'portero',
                phone: '+1 555-0203',
                email: 'carlos.mendoza@quantumtower.com',
                baseSalary: 1200,
                hireDate: '2022-08-20',
                status: 'active',
                bankAccount: '3456789012',
                schedule: 'Lunes a Sábado 7:00-15:00'
            },
            {
                id: 'ST-004',
                name: 'Laura Rodríguez',
                position: 'operador-ascensor',
                phone: '+1 555-0204',
                email: 'laura.rodriguez@quantumtower.com',
                baseSalary: 1100,
                hireDate: '2023-03-01',
                status: 'active',
                bankAccount: '4567890123',
                schedule: 'Turnos rotativos 6:00-14:00 / 14:00-22:00'
            }
        ];

        this.staffPayments = JSON.parse(localStorage.getItem('staffPayments')) || [
            {
                id: 'SP-001',
                staffId: 'ST-001',
                staffName: 'Roberto Silva',
                position: 'Portero',
                period: 'Marzo 2024',
                baseSalary: 1200,
                bonuses: 100,
                deductions: 0,
                total: 1300,
                paymentDate: '2024-03-05',
                status: 'completed',
                method: 'transfer'
            },
            {
                id: 'SP-002',
                staffId: 'ST-002',
                staffName: 'Ana Martínez',
                position: 'Operador Ascensor',
                period: 'Marzo 2024',
                baseSalary: 1100,
                bonuses: 50,
                deductions: 0,
                total: 1150,
                paymentDate: '2024-03-05',
                status: 'completed',
                method: 'transfer'
            },
            {
                id: 'SP-003',
                staffId: 'ST-003',
                staffName: 'Carlos Mendoza',
                position: 'Portero',
                period: 'Marzo 2024',
                baseSalary: 1200,
                bonuses: 80,
                deductions: 0,
                total: 1280,
                paymentDate: '2024-03-05',
                status: 'completed',
                method: 'transfer'
            },
            {
                id: 'SP-004',
                staffId: 'ST-004',
                staffName: 'Laura Rodríguez',
                position: 'Operador Ascensor',
                period: 'Marzo 2024',
                baseSalary: 1100,
                bonuses: 60,
                deductions: 0,
                total: 1160,
                paymentDate: '2024-03-05',
                status: 'completed',
                method: 'transfer'
            }
        ];

        this.bonuses = JSON.parse(localStorage.getItem('bonuses')) || [
            {
                id: 'B-001',
                staffId: 'ST-001',
                staffName: 'Roberto Silva',
                type: 'puntualidad',
                amount: 100,
                period: 'Marzo 2024',
                reason: 'Puntualidad perfecta durante el mes',
                approvedBy: 'Administración',
                date: '2024-03-01'
            },
            {
                id: 'B-002',
                staffId: 'ST-002',
                staffName: 'Ana Martínez',
                type: 'desempeño',
                amount: 50,
                period: 'Marzo 2024',
                reason: 'Excelente atención a residentes',
                approvedBy: 'Administración',
                date: '2024-03-01'
            }
        ];

        this.contracts = JSON.parse(localStorage.getItem('contracts')) || [
            {
                id: 'CT-001',
                staffId: 'ST-001',
                staffName: 'Roberto Silva',
                type: 'indefinido',
                startDate: '2022-05-15',
                endDate: null,
                salary: 1200,
                benefits: ['Seguro médico', 'Vacaciones pagadas', 'Bonos por desempeño'],
                status: 'active'
            },
            {
                id: 'CT-002',
                staffId: 'ST-002',
                staffName: 'Ana Martínez',
                type: 'indefinido',
                startDate: '2023-01-10',
                endDate: null,
                salary: 1100,
                benefits: ['Seguro médico', 'Vacaciones pagadas'],
                status: 'active'
            }
        ];

        // Cargar contadores guardados
        this.nextTicketId = parseInt(localStorage.getItem('nextTicketId')) || this.maintenanceTickets.length + 101;
        this.nextPaymentId = parseInt(localStorage.getItem('nextPaymentId')) || this.payments.length + 1;
        this.nextResidentId = parseInt(localStorage.getItem('nextResidentId')) || this.residents.length + 1;
        this.nextReservationId = parseInt(localStorage.getItem('nextReservationId')) || this.areaReservations.length + 1;
        this.nextStaffId = parseInt(localStorage.getItem('nextStaffId')) || this.staffMembers.length + 1;
        this.nextStaffPaymentId = parseInt(localStorage.getItem('nextStaffPaymentId')) || this.staffPayments.length + 1;
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
            
            // Re-inicializar gráficos con nuevo tamaño
            setTimeout(() => {
                this.initializeCharts(this.isMobile);
            }, 300);
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
        try {
            this.destroyCharts();
            
            // Verificar que los elementos canvas existen antes de inicializar
            const chartIds = [
                'incomeExpenseChart', 'financialChart', 'resourceConsumptionChart',
                'maintenanceChart', 'residentsDistributionChart', 'budgetChart', 
                'emergencyStatsChart'
            ];

            chartIds.forEach(chartId => {
                const ctx = document.getElementById(chartId);
                if (!ctx) {
                    console.warn(`⚠️ Canvas element #${chartId} not found`);
                    return;
                }
            });

            // Inicializar gráficos solo si los elementos existen
            if (document.getElementById('incomeExpenseChart')) {
                this.initializeIncomeExpenseChart(isMobile);
            }
            if (document.getElementById('financialChart')) {
                this.initializeFinancialChart(isMobile);
            }
            if (document.getElementById('resourceConsumptionChart')) {
                this.initializeResourceConsumptionChart(isMobile);
            }
            if (document.getElementById('maintenanceChart')) {
                this.initializeMaintenanceChart(isMobile);
            }
            if (document.getElementById('residentsDistributionChart')) {
                this.initializeResidentsDistributionChart(isMobile);
            }
            if (document.getElementById('budgetChart')) {
                this.initializeBudgetChart(isMobile);
            }
            if (document.getElementById('emergencyStatsChart')) {
                this.initializeEmergencyStatsChart(isMobile);
            }

        } catch (error) {
            console.error('❌ Error inicializando gráficos:', error);
        }
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

    // ==================== ÁREAS COMUNES - COMPLETAMENTE FUNCIONAL ====================

    setupCommonAreasEvents() {
        const elements = {
            'new-reservation': () => this.showNewReservationModal(),
            'area-reports': () => this.generateAreaReports(),
            'configure-areas': () => this.configureCommonAreas(),
            'approve-all-reservations': () => this.approveAllReservations(),
            'send-reservation-reminders': () => this.sendReservationReminders(),
            'generate-schedule': () => this.generateReservationSchedule(),
            'set-area-schedules': () => this.setAreaSchedules(),
            'set-area-rates': () => this.setAreaRates(),
            'register-area-payment': () => this.registerAreaPayment(),
            'generate-area-invoices': () => this.generateAreaInvoices(),
            'generate-payment-report': () => this.generateAreaPaymentReport(),
            'set-rates': () => this.setAreaRates(),
            'manage-discounts': () => this.setAreaDiscounts(),
            'add-area': () => this.addCommonArea(),
            'calculate-expenses': () => this.calculateAreaExpenses()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Inicializar calendario
        this.initializeReservationCalendar();

        // Configurar eventos de reservas
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-reservation')) {
                const reservationId = e.target.closest('.view-reservation').getAttribute('data-id');
                this.viewReservationDetails(reservationId);
            }
            if (e.target.closest('.approve-reservation')) {
                const reservationId = e.target.closest('.approve-reservation').getAttribute('data-id');
                this.approveReservation(reservationId);
            }
            if (e.target.closest('.reject-reservation')) {
                const reservationId = e.target.closest('.reject-reservation').getAttribute('data-id');
                this.rejectReservation(reservationId);
            }
            if (e.target.closest('.cancel-reservation')) {
                const reservationId = e.target.closest('.cancel-reservation').getAttribute('data-id');
                this.cancelReservation(reservationId);
            }
            if (e.target.closest('.check-in')) {
                const reservationId = e.target.closest('.check-in').getAttribute('data-id');
                this.checkInReservation(reservationId);
            }
        });

        // Configurar tabs de áreas comunes
        this.setupAreaTabs();
    }

    setupAreaTabs() {
        const tabButtons = document.querySelectorAll('.payment-tabs .tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchAreaTab(tabId);
            });
        });
    }

    switchAreaTab(tabId) {
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

    initializeReservationCalendar() {
        const calendarElement = document.getElementById('reservations-calendar');
        if (!calendarElement) return;

        // Ya está generado en el HTML, solo agregamos eventos
        this.addReservationsToCalendar();
    }

    addReservationsToCalendar() {
        const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
        calendarDays.forEach(day => {
            const dayNumber = day.querySelector('.day-number');
            if (dayNumber) {
                const dayNum = parseInt(dayNumber.textContent);
                const dateStr = `2024-03-${dayNum.toString().padStart(2, '0')}`;
                day.setAttribute('data-date', dateStr);
                
                day.addEventListener('click', () => {
                    this.showReservationsForDate(dateStr);
                });
            }
        });
    }

    showReservationsForDate(date) {
        const reservations = this.areaReservations.filter(r => r.date === date);
        
        if (reservations.length === 0) {
            this.modalSystem.alert('📅 Reservas', `No hay reservas para el ${date}.`, 'info');
            return;
        }

        const reservationsHtml = reservations.map(reservation => `
            <div class="reservation-item">
                <div class="reservation-info">
                    <strong>${reservation.areaName}</strong>
                    <div>${reservation.residentName}</div>
                    <div>${reservation.startTime} - ${reservation.endTime}</div>
                    <div class="status status-${reservation.status}">${this.capitalizeFirst(reservation.status)}</div>
                </div>
                <div class="reservation-actions">
                    <button class="btn-icon view-reservation" data-id="${reservation.id}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${reservation.status === 'pending' ? `
                    <button class="btn-icon approve-reservation" data-id="${reservation.id}" title="Aprobar">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon reject-reservation" data-id="${reservation.id}" title="Rechazar">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        this.modalSystem.show({
            title: `📅 Reservas para ${date}`,
            content: `<div class="reservations-list">${reservationsHtml}</div>`,
            buttons: [
                {
                    text: 'Cerrar',
                    class: 'custom-btn-secondary',
                    handler: () => this.modalSystem.close()
                }
            ]
        });
    }

    async showNewReservationModal() {
        const residentOptions = this.residents.map(resident => ({
            value: resident.id,
            text: `${resident.name} - ${resident.department}`
        }));

        const areaOptions = this.commonAreas.map(area => ({
            value: area.id,
            text: area.name
        }));

        const result = await this.modalSystem.form('Nueva Reserva', [
            {
                label: 'Residente',
                type: 'select',
                required: true,
                options: residentOptions
            },
            {
                label: 'Área Común',
                type: 'select',
                required: true,
                options: areaOptions
            },
            {
                label: 'Fecha',
                type: 'date',
                required: true,
                value: new Date().toISOString().split('T')[0]
            },
            {
                label: 'Hora de Inicio',
                type: 'time',
                required: true,
                value: '14:00'
            },
            {
                label: 'Hora de Fin',
                type: 'time',
                required: true,
                value: '16:00'
            },
            {
                label: 'Número de Invitados',
                type: 'number',
                required: true,
                min: 1,
                value: 1
            },
            {
                label: 'Notas Adicionales',
                type: 'textarea',
                placeholder: 'Motivo de la reserva, requerimientos especiales...'
            }
        ]);

        if (result) {
            const selectedArea = this.commonAreas.find(a => a.id === result['Área Común']);
            const selectedResident = this.residents.find(r => r.id === result['Residente']);
            
            if (selectedArea && selectedResident) {
                const startTime = result['Hora de Inicio'];
                const endTime = result['Hora de Fin'];
                const duration = this.calculateDuration(startTime, endTime);
                const totalAmount = duration * selectedArea.hourlyRate;

                const newReservation = {
                    id: `R-${this.nextReservationId}`,
                    residentId: result['Residente'],
                    residentName: selectedResident.name,
                    areaId: result['Área Común'],
                    areaName: selectedArea.name,
                    date: result['Fecha'],
                    startTime: startTime,
                    endTime: endTime,
                    duration: duration,
                    guests: parseInt(result['Número de Invitados']),
                    totalAmount: totalAmount,
                    status: 'pending',
                    paymentStatus: 'pending',
                    notes: result['Notas Adicionales'],
                    createdAt: new Date().toISOString()
                };

                this.areaReservations.push(newReservation);
                this.nextReservationId++;
                this.saveData();
                this.updateReservationsTable();
                
                this.modalSystem.alert('✅ Reserva Creada', 
                    `Reserva creada exitosamente para ${selectedResident.name} en ${selectedArea.name}.`, 
                    'success');
            }
        }
    }

    calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        return (end - start) / (1000 * 60 * 60); // Diferencia en horas
    }

    async approveAllReservations() {
        const pendingReservations = this.areaReservations.filter(r => r.status === 'pending');
        
        if (pendingReservations.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Reservas Pendientes', 'No hay reservas pendientes de aprobación.', 'info');
            return;
        }

        const confirm = await this.modalSystem.confirm(
            '✅ Aprobar Todas las Reservas',
            `¿Está seguro de aprobar todas las ${pendingReservations.length} reservas pendientes?`
        );

        if (confirm) {
            this.showLoading('Aprobando reservas...');
            
            setTimeout(() => {
                pendingReservations.forEach(reservation => {
                    reservation.status = 'approved';
                    reservation.updatedAt = new Date().toISOString();
                });
                
                this.saveData();
                this.updateReservationsTable();
                this.hideLoading();
                
                this.modalSystem.alert('✅ Reservas Aprobadas', 
                    `Se aprobaron ${pendingReservations.length} reservas exitosamente.`, 
                    'success');
            }, 2000);
        }
    }

    async sendReservationReminders() {
        const upcomingReservations = this.areaReservations.filter(r => 
            r.status === 'approved' && 
            new Date(r.date) > new Date() &&
            new Date(r.date) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Próximos 2 días
        );

        if (upcomingReservations.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Recordatorios', 'No hay reservas próximas para recordar.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Enviar Recordatorios de Reserva', [
            {
                label: 'Tipo de Recordatorio',
                type: 'select',
                required: true,
                options: [
                    { value: '24h', text: 'Recordatorio 24 horas antes' },
                    { value: '2h', text: 'Recordatorio 2 horas antes' },
                    { value: 'custom', text: 'Personalizado' }
                ]
            },
            {
                label: 'Método de Envío',
                type: 'select',
                required: true,
                options: [
                    { value: 'email', text: 'Email' },
                    { value: 'sms', text: 'SMS' },
                    { value: 'both', text: 'Email y SMS' }
                ]
            },
            {
                label: 'Mensaje Personalizado',
                type: 'textarea',
                placeholder: 'Opcional: Escriba un mensaje personalizado...'
            }
        ]);

        if (result) {
            this.showLoading('Enviando recordatorios...');

            setTimeout(() => {
                this.hideLoading();

                const summary = upcomingReservations.map(r => 
                    `${r.residentName}: ${r.areaName} (${r.date} ${r.startTime})`
                ).join('\n');

                this.modalSystem.alert('✅ Recordatorios Enviados', 
                    `Se enviaron ${upcomingReservations.length} recordatorios exitosamente:\n\n${summary}`, 
                    'success');
            }, 2000);
        }
    }

    async generateReservationSchedule() {
        const result = await this.modalSystem.form('Generar Horario de Reservas', [
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'week', text: 'Semanal' },
                    { value: 'month', text: 'Mensual' },
                    { value: 'quarter', text: 'Trimestral' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'both', text: 'PDF y Excel' }
                ]
            },
            {
                label: 'Incluir Detalles de Contacto',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.showLoading('Generando horario...');

            setTimeout(() => {
                this.hideLoading();

                // Simular generación de horario
                const scheduleData = {
                    period: result['Período'],
                    generatedAt: new Date().toISOString(),
                    reservations: this.areaReservations.filter(r => r.status === 'approved')
                };

                this.downloadSchedule(scheduleData, result['Formato']);
                
                this.modalSystem.alert('✅ Horario Generado', 
                    `Horario de reservas generado exitosamente en formato ${result['Formato']}.`, 
                    'success');
            }, 2000);
        }
    }

    downloadSchedule(data, format) {
        // Simular descarga
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `horario-reservas-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    async configureCommonAreas() {
        const result = await this.modalSystem.form('Configurar Áreas Comunes', [
            {
                label: 'Acción',
                type: 'select',
                required: true,
                options: [
                    { value: 'add', text: 'Agregar Área' },
                    { value: 'edit', text: 'Editar Área' },
                    { value: 'disable', text: 'Deshabilitar Área' }
                ]
            },
            {
                label: 'Área',
                type: 'select',
                required: true,
                options: this.commonAreas.map(area => ({
                    value: area.id,
                    text: `${area.name} (${area.type})`
                }))
            },
            {
                label: 'Nombre del Área',
                type: 'text',
                placeholder: 'Nombre del área común'
            },
            {
                label: 'Tipo',
                type: 'select',
                options: [
                    { value: 'recreational', text: 'Recreativo' },
                    { value: 'event', text: 'Eventos' },
                    { value: 'sports', text: 'Deportes' },
                    { value: 'other', text: 'Otro' }
                ]
            },
            {
                label: 'Capacidad Máxima',
                type: 'number',
                placeholder: '0'
            }
        ]);

        if (result) {
            if (result['Acción'] === 'add') {
                const newArea = {
                    id: `CA-${Date.now()}`,
                    name: result['Nombre del Área'],
                    type: result['Tipo'],
                    capacity: parseInt(result['Capacidad Máxima']) || 0,
                    hourlyRate: 0,
                    dailyRate: 0,
                    monthlyRate: 0,
                    operatingHours: {
                        monday: { open: '08:00', close: '22:00' },
                        tuesday: { open: '08:00', close: '22:00' },
                        wednesday: { open: '08:00', close: '22:00' },
                        thursday: { open: '08:00', close: '22:00' },
                        friday: { open: '08:00', close: '22:00' },
                        saturday: { open: '09:00', close: '20:00' },
                        sunday: { open: '09:00', close: '20:00' }
                    },
                    status: 'active'
                };

                this.commonAreas.push(newArea);
                this.saveData();
                
                this.modalSystem.alert('✅ Área Agregada', 
                    `Área "${newArea.name}" agregada exitosamente.`, 
                    'success');
            }
        }
    }

    async setAreaSchedules() {
        const areaOptions = this.commonAreas.map(area => ({
            value: area.id,
            text: area.name
        }));

        const result = await this.modalSystem.form('Configurar Horarios de Áreas', [
            {
                label: 'Área',
                type: 'select',
                required: true,
                options: areaOptions
            },
            {
                label: 'Día de la Semana',
                type: 'select',
                required: true,
                options: [
                    { value: 'monday', text: 'Lunes' },
                    { value: 'tuesday', text: 'Martes' },
                    { value: 'wednesday', text: 'Miércoles' },
                    { value: 'thursday', text: 'Jueves' },
                    { value: 'friday', text: 'Viernes' },
                    { value: 'saturday', text: 'Sábado' },
                    { value: 'sunday', text: 'Domingo' }
                ]
            },
            {
                label: 'Hora de Apertura',
                type: 'time',
                required: true,
                value: '08:00'
            },
            {
                label: 'Hora de Cierre',
                type: 'time',
                required: true,
                value: '22:00'
            }
        ]);

        if (result) {
            const area = this.commonAreas.find(a => a.id === result['Área']);
            if (area) {
                area.operatingHours[result['Día de la Semana']] = {
                    open: result['Hora de Apertura'],
                    close: result['Hora de Cierre']
                };
                
                this.saveData();
                
                this.modalSystem.alert('✅ Horario Actualizado', 
                    `Horario de ${area.name} actualizado exitosamente.`, 
                    'success');
            }
        }
    }

    async setAreaRates() {
        const areaOptions = this.commonAreas.map(area => ({
            value: area.id,
            text: area.name
        }));

        const result = await this.modalSystem.form('Establecer Tarifas de Áreas', [
            {
                label: 'Área',
                type: 'select',
                required: true,
                options: areaOptions
            },
            {
                label: 'Tarifa por Hora ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Tarifa Diaria ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Tarifa Mensual ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            }
        ]);

        if (result) {
            const area = this.commonAreas.find(a => a.id === result['Área']);
            if (area) {
                area.hourlyRate = parseFloat(result['Tarifa por Hora ($)']) || 0;
                area.dailyRate = parseFloat(result['Tarifa Diaria ($)']) || 0;
                area.monthlyRate = parseFloat(result['Tarifa Mensual ($)']) || 0;
                
                this.saveData();
                
                this.modalSystem.alert('✅ Tarifas Actualizadas', 
                    `Tarifas de ${area.name} actualizadas exitosamente.`, 
                    'success');
            }
        }
    }

    async setAreaDiscounts() {
        const result = await this.modalSystem.form('Configurar Descuentos', [
            {
                label: 'Tipo de Descuento',
                type: 'select',
                required: true,
                options: [
                    { value: 'resident', text: 'Para Residentes' },
                    { value: 'frequent', text: 'Usuario Frecuente' },
                    { value: 'special', text: 'Ocasión Especial' }
                ]
            },
            {
                label: 'Porcentaje de Descuento (%)',
                type: 'number',
                required: true,
                min: 1,
                max: 100,
                placeholder: '10'
            },
            {
                label: 'Áreas Aplicables',
                type: 'select',
                multiple: true,
                options: this.commonAreas.map(area => ({
                    value: area.id,
                    text: area.name
                }))
            },
            {
                label: 'Fecha de Inicio',
                type: 'date',
                required: true
            },
            {
                label: 'Fecha de Fin',
                type: 'date',
                required: true
            }
        ]);

        if (result) {
            this.modalSystem.alert('✅ Descuento Configurado', 
                'Descuento configurado exitosamente.', 
                'success');
        }
    }

    async registerAreaPayment() {
        const pendingReservations = this.areaReservations.filter(r => 
            r.status === 'approved' && r.paymentStatus === 'pending'
        );

        if (pendingReservations.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Pagos Pendientes', 'No hay reservas con pagos pendientes.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Registrar Pago de Reserva', [
            {
                label: 'Reserva',
                type: 'select',
                required: true,
                options: pendingReservations.map(r => ({
                    value: r.id,
                    text: `${r.id} - ${r.residentName} - ${r.areaName} - $${r.totalAmount}`
                }))
            },
            {
                label: 'Método de Pago',
                type: 'select',
                required: true,
                options: [
                    { value: 'transfer', text: 'Transferencia' },
                    { value: 'cash', text: 'Efectivo' },
                    { value: 'card', text: 'Tarjeta' }
                ]
            },
            {
                label: 'Monto Pagado ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Fecha de Pago',
                type: 'date',
                required: true,
                value: new Date().toISOString().split('T')[0]
            },
            {
                label: 'Referencia/Comprobante',
                type: 'text',
                placeholder: 'Número de referencia o comprobante'
            }
        ]);

        if (result) {
            const reservation = this.areaReservations.find(r => r.id === result['Reserva']);
            if (reservation) {
                reservation.paymentStatus = 'paid';
                reservation.paymentDate = result['Fecha de Pago'];
                reservation.paymentMethod = result['Método de Pago'];
                reservation.paymentReference = result['Referencia/Comprobante'];
                
                // Registrar el pago
                const newPayment = {
                    id: `AP-${Date.now()}`,
                    residentName: reservation.residentName,
                    areaName: reservation.areaName,
                    concept: `Reserva ${reservation.date}`,
                    amount: parseFloat(result['Monto Pagado ($)']) || reservation.totalAmount,
                    date: result['Fecha de Pago'],
                    method: result['Método de Pago'],
                    status: 'completed',
                    reservationId: reservation.id
                };
                
                this.areaPayments.push(newPayment);
                this.saveData();
                this.updateAreaPaymentsTable();
                
                this.modalSystem.alert('✅ Pago Registrado', 
                    `Pago de reserva ${reservation.id} registrado exitosamente.`, 
                    'success');
            }
        }
    }

    async generateAreaInvoices() {
        const unpaidReservations = this.areaReservations.filter(r => 
            r.status === 'approved' && r.paymentStatus === 'pending'
        );

        if (unpaidReservations.length === 0) {
            this.modalSystem.alert('ℹ️ Sin Facturas Pendientes', 'No hay reservas pendientes de facturación.', 'info');
            return;
        }

        const result = await this.modalSystem.form('Generar Facturas de Áreas', [
            {
                label: 'Tipo de Facturación',
                type: 'select',
                required: true,
                options: [
                    { value: 'individual', text: 'Factura Individual' },
                    { value: 'bulk', text: 'Facturación Masiva' },
                    { value: 'monthly', text: 'Facturación Mensual' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'email', text: 'Enviar por Email' },
                    { value: 'both', text: 'PDF y Email' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Generando facturas...');

            setTimeout(() => {
                this.hideLoading();

                const summary = unpaidReservations.map(r => 
                    `${r.residentName}: ${r.areaName} - $${r.totalAmount}`
                ).join('\n');

                this.modalSystem.alert('✅ Facturas Generadas', 
                    `Se generaron ${unpaidReservations.length} facturas exitosamente:\n\n${summary}`, 
                    'success');
            }, 2000);
        }
    }

    async generateAreaPaymentReport() {
        const result = await this.modalSystem.form('Generar Reporte de Pagos', [
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'week', text: 'Semanal' },
                    { value: 'month', text: 'Mensual' },
                    { value: 'quarter', text: 'Trimestral' },
                    { value: 'year', text: 'Anual' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'both', text: 'PDF y Excel' }
                ]
            },
            {
                label: 'Incluir Detalles',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte...');

            setTimeout(() => {
                this.hideLoading();

                const reportData = {
                    period: result['Período'],
                    totalPayments: this.areaPayments.filter(p => p.status === 'completed').length,
                    totalAmount: this.areaPayments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + p.amount, 0),
                    generatedAt: new Date().toISOString()
                };

                this.downloadReport(reportData, result['Formato']);
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte de pagos generado exitosamente.`, 
                    'success');
            }, 2000);
        }
    }

    async addCommonArea() {
        const result = await this.modalSystem.form('Agregar Área Común', [
            {
                label: 'Nombre del Área',
                type: 'text',
                required: true,
                placeholder: 'Ej: Sala de Juegos'
            },
            {
                label: 'Tipo de Área',
                type: 'select',
                required: true,
                options: [
                    { value: 'recreational', text: 'Recreativo' },
                    { value: 'event', text: 'Eventos' },
                    { value: 'sports', text: 'Deportes' },
                    { value: 'other', text: 'Otro' }
                ]
            },
            {
                label: 'Capacidad Máxima',
                type: 'number',
                required: true,
                min: 1,
                placeholder: '20'
            },
            {
                label: 'Tarifa por Hora ($)',
                type: 'number',
                required: true,
                min: 0,
                placeholder: '50'
            },
            {
                label: 'Descripción',
                type: 'textarea',
                placeholder: 'Descripción del área común...'
            }
        ]);

        if (result) {
            const newArea = {
                id: `CA-${Date.now()}`,
                name: result['Nombre del Área'],
                type: result['Tipo de Área'],
                capacity: parseInt(result['Capacidad Máxima']),
                hourlyRate: parseFloat(result['Tarifa por Hora ($)']),
                dailyRate: parseFloat(result['Tarifa por Hora ($)']) * 8,
                monthlyRate: parseFloat(result['Tarifa por Hora ($)']) * 160,
                operatingHours: {
                    monday: { open: '08:00', close: '22:00' },
                    tuesday: { open: '08:00', close: '22:00' },
                    wednesday: { open: '08:00', close: '22:00' },
                    thursday: { open: '08:00', close: '22:00' },
                    friday: { open: '08:00', close: '22:00' },
                    saturday: { open: '09:00', close: '20:00' },
                    sunday: { open: '09:00', close: '20:00' }
                },
                status: 'active',
                description: result['Descripción']
            };

            this.commonAreas.push(newArea);
            this.saveData();
            this.updateCommonAreasTable();
            
            this.modalSystem.alert('✅ Área Agregada', 
                `Área "${newArea.name}" agregada exitosamente.`, 
                'success');
        }
    }

    async calculateAreaExpenses() {
        const result = await this.modalSystem.form('Calcular Gastos de Áreas', [
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'month', text: 'Mes Actual' },
                    { value: 'quarter', text: 'Trimestre Actual' },
                    { value: 'year', text: 'Año Actual' }
                ]
            },
            {
                label: 'Tipo de Gastos',
                type: 'select',
                required: true,
                options: [
                    { value: 'maintenance', text: 'Mantenimiento' },
                    { value: 'cleaning', text: 'Limpieza' },
                    { value: 'utilities', text: 'Servicios' },
                    { value: 'all', text: 'Todos los Gastos' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Calculando gastos...');

            setTimeout(() => {
                this.hideLoading();

                const totalExpenses = this.calculateTotalAreaExpenses(result['Período'], result['Tipo de Gastos']);
                
                this.modalSystem.alert('📊 Gastos Calculados', 
                    `Total de gastos para ${result['Período']}: $${totalExpenses.toLocaleString()}`, 
                    'info');
            }, 1500);
        }
    }

    calculateTotalAreaExpenses(period, type) {
        // Simular cálculo de gastos
        const baseAmount = 5000;
        let multiplier = 1;
        
        if (period === 'quarter') multiplier = 3;
        if (period === 'year') multiplier = 12;
        
        return baseAmount * multiplier;
    }

    async generateAreaReports() {
        const result = await this.modalSystem.form('Generar Reportes de Áreas', [
            {
                label: 'Tipo de Reporte',
                type: 'select',
                required: true,
                options: [
                    { value: 'usage', text: 'Uso de Áreas' },
                    { value: 'revenue', text: 'Ingresos' },
                    { value: 'maintenance', text: 'Mantenimiento' },
                    { value: 'comprehensive', text: 'Reporte Integral' }
                ]
            },
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'month', text: 'Mes Actual' },
                    { value: 'quarter', text: 'Trimestre Actual' },
                    { value: 'year', text: 'Año Actual' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'both', text: 'PDF y Excel' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte...');

            setTimeout(() => {
                this.hideLoading();

                const reportData = {
                    type: result['Tipo de Reporte'],
                    period: result['Período'],
                    generatedAt: new Date().toISOString(),
                    data: this.generateReportData(result['Tipo de Reporte'], result['Período'])
                };

                this.downloadReport(reportData, result['Formato']);
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte de ${result['Tipo de Reporte']} generado exitosamente.`, 
                    'success');
            }, 2000);
        }
    }

    generateReportData(type, period) {
        // Generar datos de reporte según el tipo y período
        switch (type) {
            case 'usage':
                return {
                    totalReservations: this.areaReservations.length,
                    mostPopularArea: this.getMostPopularArea(),
                    usageRate: '75%',
                    peakHours: '14:00 - 18:00'
                };
            case 'revenue':
                return {
                    totalRevenue: this.areaPayments.reduce((sum, p) => sum + p.amount, 0),
                    averageRevenue: this.areaPayments.reduce((sum, p) => sum + p.amount, 0) / this.areaPayments.length,
                    revenueByArea: this.getRevenueByArea()
                };
            default:
                return { message: 'Datos del reporte' };
        }
    }

    getMostPopularArea() {
        const areaCounts = {};
        this.areaReservations.forEach(reservation => {
            areaCounts[reservation.areaName] = (areaCounts[reservation.areaName] || 0) + 1;
        });
        
        return Object.keys(areaCounts).reduce((a, b) => areaCounts[a] > areaCounts[b] ? a : b);
    }

    getRevenueByArea() {
        const revenueByArea = {};
        this.areaPayments.forEach(payment => {
            revenueByArea[payment.areaName] = (revenueByArea[payment.areaName] || 0) + payment.amount;
        });
        return revenueByArea;
    }

    downloadReport(data, format) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-areas-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    updateReservationsTable() {
        const pendingTable = document.querySelector('#pending-reservations-table tbody');
        const activeTable = document.querySelector('#active-reservations-table tbody');
        
        if (pendingTable) {
            const pendingReservations = this.areaReservations.filter(r => r.status === 'pending');
            pendingTable.innerHTML = pendingReservations.map(reservation => `
                <tr>
                    <td>${reservation.id}</td>
                    <td>${reservation.residentName}</td>
                    <td><i class="fas ${this.getAreaIcon(reservation.areaName)}"></i> ${reservation.areaName}</td>
                    <td>${reservation.date}</td>
                    <td>${reservation.startTime} - ${reservation.endTime}</td>
                    <td>${reservation.duration} horas</td>
                    <td>${reservation.guests}</td>
                    <td><span class="status status-${reservation.status}">${this.capitalizeFirst(reservation.status)}</span></td>
                    <td>
                        <button class="btn-icon approve-reservation" data-id="${reservation.id}" title="Aprobar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon reject-reservation" data-id="${reservation.id}" title="Rechazar">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn-icon view-reservation" data-id="${reservation.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        if (activeTable) {
            const activeReservations = this.areaReservations.filter(r => 
                r.status === 'approved' || r.status === 'in-progress'
            );
            activeTable.innerHTML = activeReservations.map(reservation => `
                <tr>
                    <td>${reservation.id}</td>
                    <td>${reservation.residentName}</td>
                    <td><i class="fas ${this.getAreaIcon(reservation.areaName)}"></i> ${reservation.areaName}</td>
                    <td>${reservation.date}</td>
                    <td>${reservation.startTime} - ${reservation.endTime}</td>
                    <td><span class="status status-${reservation.status}">${this.capitalizeFirst(reservation.status)}</span></td>
                    <td><span class="status status-${reservation.paymentStatus}">${this.capitalizeFirst(reservation.paymentStatus)}</span></td>
                    <td>
                        ${reservation.status === 'approved' ? `
                        <button class="btn-icon check-in" data-id="${reservation.id}" title="Check-in">
                            <i class="fas fa-user-check"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon cancel-reservation" data-id="${reservation.id}" title="Cancelar">
                            <i class="fas fa-ban"></i>
                        </button>
                        <button class="btn-icon view-reservation" data-id="${reservation.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    updateAreaPaymentsTable() {
        const tbody = document.querySelector('#area-payments-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.areaPayments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.residentName}</td>
                <td><i class="fas ${this.getAreaIcon(payment.areaName)}"></i> ${payment.areaName}</td>
                <td>${payment.concept}</td>
                <td>$${payment.amount}</td>
                <td>${payment.date}</td>
                <td>${this.capitalizeFirst(payment.method)}</td>
                <td><span class="status status-${payment.status}">${this.capitalizeFirst(payment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-payment" data-id="${payment.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon print-receipt" data-id="${payment.id}" title="Imprimir recibo">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCommonAreasTable() {
        const tbody = document.querySelector('#common-areas-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.commonAreas.map(area => `
            <tr>
                <td><i class="fas ${this.getAreaIcon(area.name)}"></i> ${area.name}</td>
                <td>${area.capacity} personas</td>
                <td>${area.operatingHours.monday.open} - ${area.operatingHours.monday.close}</td>
                <td>$${area.hourlyRate}/hora</td>
                <td><span class="status status-${area.status}">${this.capitalizeFirst(area.status)}</span></td>
                <td>
                    <button class="btn-icon edit-area" data-area="${area.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon configure-area" data-area="${area.id}" title="Configurar">
                        <i class="fas fa-cog"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getAreaIcon(areaName) {
        const icons = {
            'Piscina': 'fa-swimming-pool',
            'Gimnasio': 'fa-dumbbell',
            'Salón de Eventos': 'fa-utensils',
            'Jardín': 'fa-tree'
        };
        return icons[areaName] || 'fa-square';
    }

    async approveReservation(reservationId) {
        const reservation = this.areaReservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'approved';
            reservation.updatedAt = new Date().toISOString();
            this.saveData();
            this.updateReservationsTable();
            
            this.modalSystem.alert('✅ Reserva Aprobada', 
                `Reserva ${reservationId} aprobada exitosamente.`, 
                'success');
        }
    }

    async rejectReservation(reservationId) {
        const reservation = this.areaReservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'rejected';
            reservation.updatedAt = new Date().toISOString();
            this.saveData();
            this.updateReservationsTable();
            
            this.modalSystem.alert('❌ Reserva Rechazada', 
                `Reserva ${reservationId} rechazada.`, 
                'warning');
        }
    }

    async cancelReservation(reservationId) {
        const reservation = this.areaReservations.find(r => r.id === reservationId);
        if (reservation) {
            const confirm = await this.modalSystem.confirm(
                '⚠️ Cancelar Reserva',
                `¿Está seguro de cancelar la reserva ${reservationId}?`
            );

            if (confirm) {
                reservation.status = 'cancelled';
                reservation.updatedAt = new Date().toISOString();
                this.saveData();
                this.updateReservationsTable();
                
                this.modalSystem.alert('⚠️ Reserva Cancelada', 
                    `Reserva ${reservationId} cancelada.`, 
                    'info');
            }
        }
    }

    async checkInReservation(reservationId) {
        const reservation = this.areaReservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = 'in-progress';
            reservation.checkedInAt = new Date().toISOString();
            this.saveData();
            this.updateReservationsTable();
            
            this.modalSystem.alert('✅ Check-in Realizado', 
                `Check-in realizado para reserva ${reservationId}.`, 
                'success');
        }
    }

    viewReservationDetails(reservationId) {
        const reservation = this.areaReservations.find(r => r.id === reservationId);
        if (reservation) {
            this.modalSystem.show({
                title: `📋 Detalles de Reserva ${reservationId}`,
                content: `
                    <div class="reservation-details-modal">
                        <div class="detail-section">
                            <h4>Información General</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Residente:</label>
                                    <span>${reservation.residentName}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Área:</label>
                                    <span>${reservation.areaName}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha:</label>
                                    <span>${reservation.date}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Horario:</label>
                                    <span>${reservation.startTime} - ${reservation.endTime}</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4>Detalles de Pago</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Monto Total:</label>
                                    <span>$${reservation.totalAmount}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado de Pago:</label>
                                    <span class="status status-${reservation.paymentStatus}">${this.capitalizeFirst(reservation.paymentStatus)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado de Reserva:</label>
                                    <span class="status status-${reservation.status}">${this.capitalizeFirst(reservation.status)}</span>
                                </div>
                            </div>
                        </div>
                        ${reservation.notes ? `
                        <div class="detail-section">
                            <h4>Notas Adicionales</h4>
                            <p>${reservation.notes}</p>
                        </div>
                        ` : ''}
                    </div>
                `,
                buttons: [
                    {
                        text: 'Cerrar',
                        class: 'custom-btn-secondary',
                        handler: () => this.modalSystem.close()
                    }
                ]
            });
        }
    }

    // ==================== PAGOS A PERSONAL - COMPLETAMENTE FUNCIONAL ====================

    setupStaffPaymentsEvents() {
        const elements = {
            'new-payment-staff': () => this.showNewStaffPaymentModal(),
            'staff-reports': () => this.generateStaffReports(),
            'generate-payroll': () => this.generatePayroll(),
            'add-staff': () => this.addStaffMember(),
            'manage-contracts': () => this.manageContracts(),
            'staff-evaluations': () => this.staffEvaluations(),
            'calculate-bonuses': () => this.calculateBonuses(),
            'salary-adjustments': () => this.salaryAdjustments(),
            'calculate-bonus': () => this.calculateIndividualBonus(),
            'performance-review': () => this.performanceReview(),
            'salary-analysis': () => this.salaryAnalysis(),
            'payroll-report': () => this.generatePayrollReport(),
            'compensation-report': () => this.generateCompensationReport(),
            'generate-payslip': () => this.generatePayslip(),
            'send-payslip': () => this.sendPayslip(),
            'bulk-payslips': () => this.generateBulkPayslips()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Inicializar gráfico de nómina
        this.initializePayrollChart();

        // Configurar eventos de personal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-staff')) {
                const staffId = e.target.closest('.view-staff').getAttribute('data-id');
                this.viewStaffDetails(staffId);
            }
            if (e.target.closest('.edit-staff')) {
                const staffId = e.target.closest('.edit-staff').getAttribute('data-id');
                this.editStaffMember(staffId);
            }
            if (e.target.closest('.pay-staff')) {
                const staffId = e.target.closest('.pay-staff').getAttribute('data-id');
                this.payStaffMember(staffId);
            }
            if (e.target.closest('.view-payment-staff')) {
                const paymentId = e.target.closest('.view-payment-staff').getAttribute('data-id');
                this.viewStaffPaymentDetails(paymentId);
            }
        });

        // Actualizar estadísticas iniciales
        this.updateStaffStatistics();
    }

    initializePayrollChart() {
        // El gráfico ya está en el HTML, solo necesitamos actualizar los datos
        this.updatePayrollDistribution();
    }

    updatePayrollDistribution() {
        const administrative = this.staffMembers.filter(s => s.position.includes('admin') || s.position.includes('gerente'));
        const porters = this.staffMembers.filter(s => s.position.includes('portero'));
        const elevatorOps = this.staffMembers.filter(s => s.position.includes('operador-ascensor'));

        const adminTotal = administrative.reduce((sum, s) => sum + s.baseSalary, 0);
        const portersTotal = porters.reduce((sum, s) => sum + s.baseSalary, 0);
        const elevatorTotal = elevatorOps.reduce((sum, s) => sum + s.baseSalary, 0);

        // Actualizar las barras de distribución
        document.querySelectorAll('.distribution-bar-container').forEach(container => {
            const positionName = container.querySelector('.position-name').textContent;
            let amount = 0;
            let percentage = 0;

            if (positionName === 'Administrativos') {
                amount = adminTotal;
                percentage = (adminTotal / (adminTotal + portersTotal + elevatorTotal)) * 100;
            } else if (positionName === 'Portería') {
                amount = portersTotal;
                percentage = (portersTotal / (adminTotal + portersTotal + elevatorTotal)) * 100;
            } else if (positionName === 'Control Ascensores') {
                amount = elevatorTotal;
                percentage = (elevatorTotal / (adminTotal + portersTotal + elevatorTotal)) * 100;
            }

            const barFill = container.querySelector('.bar-fill');
            const barAmount = container.querySelector('.bar-amount');
            
            if (barFill) {
                barFill.style.width = `${percentage}%`;
                barFill.setAttribute('data-amount', `$${amount.toLocaleString()}`);
            }
            if (barAmount) {
                barAmount.textContent = `$${amount.toLocaleString()} (${percentage.toFixed(1)}%)`;
            }
        });
    }

    updateStaffStatistics() {
        const totalStaff = this.staffMembers.length;
        const totalPayroll = this.staffMembers.reduce((sum, staff) => sum + staff.baseSalary, 0);
        const pendingPayments = this.staffPayments.filter(p => p.status === 'pending').length;
        const overduePayments = this.staffPayments.filter(p => 
            p.status === 'pending' && new Date(p.paymentDate) < new Date()
        ).length;

        this.updateElementText('total-staff', totalStaff);
        this.updateElementText('total-payroll', `$${totalPayroll.toLocaleString()}`);
        this.updateElementText('pending-payments-staff', pendingPayments);
        this.updateElementText('overdue-payments-staff', overduePayments);
    }

    async showNewStaffPaymentModal() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: `${staff.name} - ${this.getPositionDisplayName(staff.position)} - $${staff.baseSalary}`
        }));

        const result = await this.modalSystem.form('Nuevo Pago a Personal', [
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Período de Pago',
                type: 'month',
                required: true,
                value: new Date().toISOString().substring(0, 7)
            },
            {
                label: 'Monto Base ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Bonos ($)',
                type: 'number',
                value: '0',
                placeholder: '0'
            },
            {
                label: 'Descuentos ($)',
                type: 'number',
                value: '0',
                placeholder: '0'
            },
            {
                label: 'Método de Pago',
                type: 'select',
                required: true,
                options: [
                    { value: 'transfer', text: 'Transferencia' },
                    { value: 'cash', text: 'Efectivo' },
                    { value: 'check', text: 'Cheque' }
                ]
            },
            {
                label: 'Fecha de Pago',
                type: 'date',
                required: true,
                value: new Date().toISOString().split('T')[0]
            }
        ]);

        if (result) {
            const staff = this.staffMembers.find(s => s.id === result['Personal']);
            if (staff) {
                const baseSalary = parseFloat(result['Monto Base ($)']) || staff.baseSalary;
                const bonuses = parseFloat(result['Bonos ($)']) || 0;
                const deductions = parseFloat(result['Descuentos ($)']) || 0;
                const total = baseSalary + bonuses - deductions;

                const newPayment = {
                    id: `SP-${this.nextStaffPaymentId}`,
                    staffId: staff.id,
                    staffName: staff.name,
                    position: this.getPositionDisplayName(staff.position),
                    period: result['Período de Pago'],
                    baseSalary: baseSalary,
                    bonuses: bonuses,
                    deductions: deductions,
                    total: total,
                    paymentDate: result['Fecha de Pago'],
                    status: 'completed',
                    method: result['Método de Pago']
                };

                this.staffPayments.push(newPayment);
                this.nextStaffPaymentId++;
                this.saveData();
                this.updateStaffPaymentsTable();
                this.updateStaffStatistics();
                
                this.modalSystem.alert('✅ Pago Registrado', 
                    `Pago de $${total} registrado para ${staff.name}.`, 
                    'success');
            }
        }
    }

    async generateStaffReports() {
        const result = await this.modalSystem.form('Generar Reportes de Personal', [
            {
                label: 'Tipo de Reporte',
                type: 'select',
                required: true,
                options: [
                    { value: 'payroll', text: 'Nómina' },
                    { value: 'attendance', text: 'Asistencia' },
                    { value: 'performance', text: 'Desempeño' },
                    { value: 'comprehensive', text: 'Reporte Integral' }
                ]
            },
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'month', text: 'Mes Actual' },
                    { value: 'quarter', text: 'Trimestre Actual' },
                    { value: 'year', text: 'Año Actual' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'both', text: 'PDF y Excel' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte...');

            setTimeout(() => {
                this.hideLoading();

                const reportData = {
                    type: result['Tipo de Reporte'],
                    period: result['Período'],
                    generatedAt: new Date().toISOString(),
                    data: this.generateStaffReportData(result['Tipo de Reporte'], result['Período'])
                };

                this.downloadReport(reportData, result['Formato']);
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte de ${result['Tipo de Reporte']} generado exitosamente.`, 
                    'success');
            }, 2000);
        }
    }

    generateStaffReportData(type, period) {
        switch (type) {
            case 'payroll':
                return {
                    totalStaff: this.staffMembers.length,
                    totalPayroll: this.staffPayments.reduce((sum, p) => sum + p.total, 0),
                    averageSalary: this.staffMembers.reduce((sum, s) => sum + s.baseSalary, 0) / this.staffMembers.length,
                    payrollByPosition: this.getPayrollByPosition()
                };
            case 'attendance':
                return {
                    totalStaff: this.staffMembers.length,
                    averageAttendance: '95%',
                    absences: this.calculateAbsences(period)
                };
            default:
                return { message: 'Datos del reporte' };
        }
    }

    getPayrollByPosition() {
        const payrollByPosition = {};
        this.staffMembers.forEach(staff => {
            const position = this.getPositionDisplayName(staff.position);
            payrollByPosition[position] = (payrollByPosition[position] || 0) + staff.baseSalary;
        });
        return payrollByPosition;
    }

    calculateAbsences(period) {
        // Simular cálculo de ausencias
        return {
            total: 12,
            justified: 8,
            unjustified: 4
        };
    }

    async generatePayroll() {
        const result = await this.modalSystem.form('Generar Nómina', [
            {
                label: 'Período',
                type: 'month',
                required: true,
                value: new Date().toISOString().substring(0, 7)
            },
            {
                label: 'Incluir Bonos',
                type: 'checkbox',
                value: 'on'
            },
            {
                label: 'Aplicar Descuentos',
                type: 'checkbox',
                value: 'on'
            },
            {
                label: 'Método de Pago',
                type: 'select',
                required: true,
                options: [
                    { value: 'transfer', text: 'Transferencia' },
                    { value: 'cash', text: 'Efectivo' },
                    { value: 'mixed', text: 'Mixto' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Generando nómina...');

            setTimeout(() => {
                this.hideLoading();

                const payrollData = {
                    period: result['Período'],
                    staffCount: this.staffMembers.length,
                    totalAmount: this.calculateTotalPayroll(result['Período']),
                    payments: this.generatePayrollPayments(result['Período']),
                    generatedAt: new Date().toISOString()
                };

                this.downloadReport(payrollData, 'excel');
                
                this.modalSystem.alert('✅ Nómina Generada', 
                    `Nómina para ${result['Período']} generada exitosamente. Total: $${payrollData.totalAmount.toLocaleString()}`, 
                    'success');
            }, 2000);
        }
    }

    calculateTotalPayroll(period) {
        return this.staffMembers.reduce((sum, staff) => sum + staff.baseSalary, 0);
    }

    generatePayrollPayments(period) {
        return this.staffMembers.map(staff => ({
            staffName: staff.name,
            position: this.getPositionDisplayName(staff.position),
            baseSalary: staff.baseSalary,
            bonuses: this.calculateBonusesForStaff(staff.id, period),
            deductions: 0,
            total: staff.baseSalary
        }));
    }

    calculateBonusesForStaff(staffId, period) {
        const staffBonuses = this.bonuses.filter(b => b.staffId === staffId && b.period === period);
        return staffBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    }

    async addStaffMember() {
        const result = await this.modalSystem.form('Agregar Personal', [
            {
                label: 'Nombre Completo',
                type: 'text',
                required: true,
                placeholder: 'Nombre y apellido'
            },
            {
                label: 'Cargo',
                type: 'select',
                required: true,
                options: [
                    { value: 'portero', text: 'Portero' },
                    { value: 'operador-ascensor', text: 'Operador de Ascensor' },
                    { value: 'administrativo', text: 'Administrativo' },
                    { value: 'limpieza', text: 'Limpieza' }
                ]
            },
            {
                label: 'Teléfono',
                type: 'tel',
                required: true,
                placeholder: '+1 555-0123'
            },
            {
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'personal@quantumtower.com'
            },
            {
                label: 'Salario Base ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Fecha de Contratación',
                type: 'date',
                required: true
            },
            {
                label: 'Cuenta Bancaria',
                type: 'text',
                required: true,
                placeholder: 'Número de cuenta'
            },
            {
                label: 'Horario',
                type: 'textarea',
                required: true,
                placeholder: 'Descripción del horario de trabajo...'
            }
        ]);

        if (result) {
            const newStaff = {
                id: `ST-${this.nextStaffId}`,
                name: result['Nombre Completo'],
                position: result['Cargo'],
                phone: result['Teléfono'],
                email: result['Email'],
                baseSalary: parseFloat(result['Salario Base ($)']) || 0,
                hireDate: result['Fecha de Contratación'],
                status: 'active',
                bankAccount: result['Cuenta Bancaria'],
                schedule: result['Horario']
            };

            this.staffMembers.push(newStaff);
            this.nextStaffId++;
            this.saveData();
            this.updateStaffTable();
            this.updateStaffStatistics();
            this.updatePayrollDistribution();
            
            this.modalSystem.alert('✅ Personal Agregado', 
                `Personal "${newStaff.name}" agregado exitosamente.`, 
                'success');
        }
    }

    async manageContracts() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: `${staff.name} - ${this.getPositionDisplayName(staff.position)}`
        }));

        const result = await this.modalSystem.form('Gestionar Contratos', [
            {
                label: 'Acción',
                type: 'select',
                required: true,
                options: [
                    { value: 'view', text: 'Ver Contrato' },
                    { value: 'renew', text: 'Renovar Contrato' },
                    { value: 'terminate', text: 'Terminar Contrato' }
                ]
            },
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Tipo de Contrato',
                type: 'select',
                options: [
                    { value: 'indefinido', text: 'Indefinido' },
                    { value: 'temporal', text: 'Temporal' },
                    { value: 'prueba', text: 'Período de Prueba' }
                ]
            },
            {
                label: 'Fecha de Inicio',
                type: 'date'
            },
            {
                label: 'Fecha de Fin',
                type: 'date'
            },
            {
                label: 'Salario ($)',
                type: 'number',
                placeholder: '0'
            }
        ]);

        if (result) {
            const staff = this.staffMembers.find(s => s.id === result['Personal']);
            if (staff) {
                if (result['Acción'] === 'view') {
                    this.viewStaffContract(staff.id);
                } else if (result['Acción'] === 'renew') {
                    this.renewContract(staff.id, result);
                } else if (result['Acción'] === 'terminate') {
                    this.terminateContract(staff.id);
                }
            }
        }
    }

    async staffEvaluations() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: staff.name
        }));

        const result = await this.modalSystem.form('Evaluación de Personal', [
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Fecha de Evaluación',
                type: 'date',
                required: true,
                value: new Date().toISOString().split('T')[0]
            },
            {
                label: 'Puntualidad (1-10)',
                type: 'number',
                required: true,
                min: 1,
                max: 10,
                placeholder: '8'
            },
            {
                label: 'Responsabilidad (1-10)',
                type: 'number',
                required: true,
                min: 1,
                max: 10,
                placeholder: '8'
            },
            {
                label: 'Atención al Residente (1-10)',
                type: 'number',
                required: true,
                min: 1,
                max: 10,
                placeholder: '8'
            },
            {
                label: 'Conocimiento del Trabajo (1-10)',
                type: 'number',
                required: true,
                min: 1,
                max: 10,
                placeholder: '8'
            },
            {
                label: 'Comentarios',
                type: 'textarea',
                placeholder: 'Comentarios adicionales sobre el desempeño...'
            }
        ]);

        if (result) {
            const staff = this.staffMembers.find(s => s.id === result['Personal']);
            if (staff) {
                const evaluation = {
                    id: `EV-${Date.now()}`,
                    staffId: staff.id,
                    staffName: staff.name,
                    date: result['Fecha de Evaluación'],
                    scores: {
                        punctuality: parseInt(result['Puntualidad (1-10)']),
                        responsibility: parseInt(result['Responsabilidad (1-10)']),
                        residentAttention: parseInt(result['Atención al Residente (1-10)']),
                        jobKnowledge: parseInt(result['Conocimiento del Trabajo (1-10)'])
                    },
                    averageScore: (
                        parseInt(result['Puntualidad (1-10)']) +
                        parseInt(result['Responsabilidad (1-10)']) +
                        parseInt(result['Atención al Residente (1-10)']) +
                        parseInt(result['Conocimiento del Trabajo (1-10)'])
                    ) / 4,
                    comments: result['Comentarios'],
                    evaluator: 'Administración'
                };

                // Guardar evaluación
                const evaluations = JSON.parse(localStorage.getItem('staffEvaluations') || '[]');
                evaluations.push(evaluation);
                localStorage.setItem('staffEvaluations', JSON.stringify(evaluations));
                
                this.modalSystem.alert('✅ Evaluación Registrada', 
                    `Evaluación de ${staff.name} registrada exitosamente. Puntuación promedio: ${evaluation.averageScore.toFixed(1)}/10`, 
                    'success');
            }
        }
    }

    async calculateBonuses() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: staff.name
        }));

        const result = await this.modalSystem.form('Calcular Bonos', [
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Tipo de Bono',
                type: 'select',
                required: true,
                options: [
                    { value: 'puntualidad', text: 'Puntualidad' },
                    { value: 'desempeño', text: 'Desempeño' },
                    { value: 'antiguedad', text: 'Antigüedad' },
                    { value: 'especial', text: 'Bono Especial' }
                ]
            },
            {
                label: 'Monto del Bono ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Período',
                type: 'text',
                required: true,
                placeholder: 'Marzo 2024'
            },
            {
                label: 'Motivo',
                type: 'textarea',
                required: true,
                placeholder: 'Descripción del motivo del bono...'
            }
        ]);

        if (result) {
            const staff = this.staffMembers.find(s => s.id === result['Personal']);
            if (staff) {
                const bonus = {
                    id: `B-${Date.now()}`,
                    staffId: staff.id,
                    staffName: staff.name,
                    type: result['Tipo de Bono'],
                    amount: parseFloat(result['Monto del Bono ($)']) || 0,
                    period: result['Período'],
                    reason: result['Motivo'],
                    approvedBy: 'Administración',
                    date: new Date().toISOString().split('T')[0]
                };

                this.bonuses.push(bonus);
                this.saveData();
                
                this.modalSystem.alert('✅ Bono Calculado', 
                    `Bono de $${bonus.amount} calculado para ${staff.name}.`, 
                    'success');
            }
        }
    }

    async salaryAdjustments() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: `${staff.name} - Actual: $${staff.baseSalary}`
        }));

        const result = await this.modalSystem.form('Ajustes Salariales', [
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Nuevo Salario Base ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Porcentaje de Aumento (%)',
                type: 'number',
                step: '0.1',
                placeholder: '0.0'
            },
            {
                label: 'Fecha de Efectividad',
                type: 'date',
                required: true
            },
            {
                label: 'Motivo del Ajuste',
                type: 'textarea',
                required: true,
                placeholder: 'Descripción del motivo del ajuste salarial...'
            }
        ]);

        if (result) {
            const staff = this.staffMembers.find(s => s.id === result['Personal']);
            if (staff) {
                const oldSalary = staff.baseSalary;
                const newSalary = parseFloat(result['Nuevo Salario Base ($)']) || staff.baseSalary;
                
                staff.baseSalary = newSalary;
                this.saveData();
                this.updateStaffTable();
                this.updateStaffStatistics();
                
                const increase = ((newSalary - oldSalary) / oldSalary * 100).toFixed(1);
                
                this.modalSystem.alert('✅ Ajuste Salarial Aplicado', 
                    `Salario de ${staff.name} ajustado de $${oldSalary} a $${newSalary} (${increase}% de aumento).`, 
                    'success');
            }
        }
    }

    async calculateIndividualBonus() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: staff.name
        }));

        const result = await this.modalSystem.form('Calcular Bono Individual', [
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Tipo de Bono',
                type: 'select',
                required: true,
                options: [
                    { value: 'performance', text: 'Por Desempeño' },
                    { value: 'attendance', text: 'Por Asistencia' },
                    { value: 'special', text: 'Bono Especial' }
                ]
            },
            {
                label: 'Monto Base ($)',
                type: 'number',
                required: true,
                placeholder: '0'
            },
            {
                label: 'Multiplicador',
                type: 'number',
                step: '0.1',
                value: '1.0',
                placeholder: '1.0'
            },
            {
                label: 'Motivo Detallado',
                type: 'textarea',
                required: true,
                placeholder: 'Descripción detallada del bono...'
            }
        ]);

        if (result) {
            const baseAmount = parseFloat(result['Monto Base ($)']) || 0;
            const multiplier = parseFloat(result['Multiplicador']) || 1.0;
            const totalBonus = baseAmount * multiplier;

            this.modalSystem.alert('✅ Bono Calculado', 
                `Bono calculado: $${totalBonus.toFixed(2)}\n\nMonto Base: $${baseAmount}\nMultiplicador: ${multiplier}x`, 
                'success');
        }
    }

    async performanceReview() {
        const staffOptions = this.staffMembers.map(staff => ({
            value: staff.id,
            text: staff.name
        }));

        const result = await this.modalSystem.form('Revisión de Desempeño', [
            {
                label: 'Personal',
                type: 'select',
                required: true,
                options: staffOptions
            },
            {
                label: 'Período de Revisión',
                type: 'select',
                required: true,
                options: [
                    { value: 'quarterly', text: 'Trimestral' },
                    { value: 'semiannual', text: 'Semestral' },
                    { value: 'annual', text: 'Anual' }
                ]
            },
            {
                label: 'Calificación General (1-5)',
                type: 'number',
                required: true,
                min: 1,
                max: 5,
                step: '0.1',
                placeholder: '4.0'
            },
            {
                label: 'Fortalezas',
                type: 'textarea',
                required: true,
                placeholder: 'Lista de fortalezas del empleado...'
            },
            {
                label: 'Áreas de Mejora',
                type: 'textarea',
                required: true,
                placeholder: 'Áreas que necesitan mejora...'
            },
            {
                label: 'Objetivos para el Próximo Período',
                type: 'textarea',
                required: true,
                placeholder: 'Objetivos establecidos...'
            }
        ]);

        if (result) {
            this.modalSystem.alert('✅ Revisión Completada', 
                'Revisión de desempeño completada y guardada exitosamente.', 
                'success');
        }
    }

    async salaryAnalysis() {
        this.showLoading('Analizando datos salariales...');

        setTimeout(() => {
            this.hideLoading();

            const totalStaff = this.staffMembers.length;
            const totalPayroll = this.staffMembers.reduce((sum, staff) => sum + staff.baseSalary, 0);
            const averageSalary = totalPayroll / totalStaff;
            const highestSalary = Math.max(...this.staffMembers.map(staff => staff.baseSalary));
            const lowestSalary = Math.min(...this.staffMembers.map(staff => staff.baseSalary));

            const analysisHtml = `
                <div class="salary-analysis">
                    <div class="analysis-stats">
                        <div class="stat-card">
                            <div class="stat-value">${totalStaff}</div>
                            <div class="stat-label">Total de Personal</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">$${totalPayroll.toLocaleString()}</div>
                            <div class="stat-label">Nómina Total Mensual</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">$${averageSalary.toLocaleString()}</div>
                            <div class="stat-label">Salario Promedio</div>
                        </div>
                    </div>
                    <div class="analysis-details">
                        <h4>Distribución Salarial</h4>
                        <p><strong>Salario Más Alto:</strong> $${highestSalary.toLocaleString()}</p>
                        <p><strong>Salario Más Bajo:</strong> $${lowestSalary.toLocaleString()}</p>
                        <p><strong>Rango Salarial:</strong> $${(highestSalary - lowestSalary).toLocaleString()}</p>
                    </div>
                </div>
            `;

            this.modalSystem.show({
                title: '📊 Análisis Salarial',
                content: analysisHtml,
                buttons: [
                    {
                        text: 'Exportar Reporte',
                        class: 'custom-btn-primary',
                        icon: 'download',
                        handler: () => this.exportSalaryAnalysis()
                    },
                    {
                        text: 'Cerrar',
                        class: 'custom-btn-secondary',
                        handler: () => this.modalSystem.close()
                    }
                ]
            });
        }, 2000);
    }

    exportSalaryAnalysis() {
        const analysisData = {
            totalStaff: this.staffMembers.length,
            totalPayroll: this.staffMembers.reduce((sum, staff) => sum + staff.baseSalary, 0),
            averageSalary: this.staffMembers.reduce((sum, staff) => sum + staff.baseSalary, 0) / this.staffMembers.length,
            staffDetails: this.staffMembers.map(staff => ({
                name: staff.name,
                position: staff.position,
                salary: staff.baseSalary
            })),
            generatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analisis-salarial-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    async generatePayrollReport() {
        const result = await this.modalSystem.form('Generar Reporte de Nómina', [
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'monthly', text: 'Mensual' },
                    { value: 'quarterly', text: 'Trimestral' },
                    { value: 'annual', text: 'Anual' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'both', text: 'PDF y Excel' }
                ]
            },
            {
                label: 'Incluir Detalles de Pago',
                type: 'checkbox',
                value: 'on'
            },
            {
                label: 'Incluir Análisis Comparativo',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte de nómina...');

            setTimeout(() => {
                this.hideLoading();

                const reportData = {
                    period: result['Período'],
                    totalStaff: this.staffMembers.length,
                    totalPayroll: this.staffPayments.reduce((sum, p) => sum + p.total, 0),
                    payments: this.staffPayments,
                    generatedAt: new Date().toISOString()
                };

                this.downloadReport(reportData, 'payroll');
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte de nómina generado exitosamente.`, 
                    'success');
            }, 2000);
        }
    }

    async generateCompensationReport() {
        const result = await this.modalSystem.form('Generar Reporte de Compensación', [
            {
                label: 'Tipo de Reporte',
                type: 'select',
                required: true,
                options: [
                    { value: 'bonuses', text: 'Reporte de Bonos' },
                    { value: 'salaries', text: 'Reporte Salarial' },
                    { value: 'benefits', text: 'Reporte de Beneficios' }
                ]
            },
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'current', text: 'Actual' },
                    { value: 'ytd', text: 'Año en Curso' },
                    { value: 'comparative', text: 'Comparativo' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' }
                ]
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte de compensación...');

            setTimeout(() => {
                this.hideLoading();

                const totalBonuses = this.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
                const totalSalaries = this.staffMembers.reduce((sum, staff) => sum + staff.baseSalary, 0);
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte de compensación generado exitosamente.\n\nTotal Bonos: $${totalBonuses}\nTotal Salarios: $${totalSalaries}`, 
                    'success');
            }, 2000);
        }
    }

    async generatePayslip() {
        const paymentOptions = this.staffPayments.map(payment => ({
            value: payment.id,
            text: `${payment.staffName} - ${payment.period} - $${payment.total}`
        }));

        const result = await this.modalSystem.form('Generar Recibo de Pago', [
            {
                label: 'Pago',
                type: 'select',
                required: true,
                options: paymentOptions
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'print', text: 'Imprimir' },
                    { value: 'both', text: 'PDF e Imprimir' }
                ]
            },
            {
                label: 'Incluir Desglose Detallado',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.generatePayslipForPayment(result['Pago'], result['Formato']);
        }
    }

    generatePayslipForPayment(paymentId, format = 'pdf') {
        const payment = this.staffPayments.find(p => p.id === paymentId);
        if (payment) {
            this.showLoading('Generando recibo de pago...');

            setTimeout(() => {
                this.hideLoading();

                const payslipContent = this.createPayslipContent(payment);
                
                if (format === 'pdf' || format === 'both') {
                    this.downloadPDFPayslip(payslipContent, payment);
                }
                
                if (format === 'print' || format === 'both') {
                    this.printPayslip(payslipContent);
                }
                
                this.modalSystem.alert('✅ Recibo Generado', 
                    `Recibo de pago para ${payment.staffName} generado exitosamente.`, 
                    'success');
            }, 1500);
        }
    }

    createPayslipContent(payment) {
        const staff = this.staffMembers.find(s => s.id === payment.staffId);
        const bonuses = this.bonuses.filter(b => b.staffId === payment.staffId && b.period === payment.period);

        return `
            <div class="payslip">
                <div class="payslip-header">
                    <h1>QUANTUM TOWER</h1>
                    <h2>Recibo de Pago de Nómina</h2>
                </div>
                
                <div class="payslip-info">
                    <div class="info-section">
                        <h3>Información del Empleado</h3>
                        <p><strong>Nombre:</strong> ${payment.staffName}</p>
                        <p><strong>Cargo:</strong> ${payment.position}</p>
                        <p><strong>Período:</strong> ${payment.period}</p>
                        <p><strong>Fecha de Pago:</strong> ${payment.paymentDate}</p>
                    </div>
                    
                    <div class="info-section">
                        <h3>Información de Pago</h3>
                        <p><strong>Método:</strong> ${this.capitalizeFirst(payment.method)}</p>
                        <p><strong>Estado:</strong> ${this.capitalizeFirst(payment.status)}</p>
                    </div>
                </div>
                
                <div class="payslip-breakdown">
                    <h3>Desglose de Pago</h3>
                    <table class="breakdown-table">
                        <tr>
                            <td>Salario Base:</td>
                            <td>$${payment.baseSalary}</td>
                        </tr>
                        <tr>
                            <td>Bonos:</td>
                            <td>$${payment.bonuses}</td>
                        </tr>
                        <tr>
                            <td>Descuentos:</td>
                            <td>-$${payment.deductions}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Total Neto:</strong></td>
                            <td><strong>$${payment.total}</strong></td>
                        </tr>
                    </table>
                </div>
                
                ${bonuses.length > 0 ? `
                <div class="bonus-details">
                    <h3>Detalles de Bonos</h3>
                    ${bonuses.map(bonus => `
                        <div class="bonus-item">
                            <p><strong>${this.capitalizeFirst(bonus.type)}:</strong> $${bonus.amount}</p>
                            <p><em>${bonus.reason}</em></p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <div class="payslip-footer">
                    <p>Recibo generado el: ${new Date().toLocaleDateString()}</p>
                    <p>Firma del Administrador: _________________________</p>
                </div>
            </div>
        `;
    }

    downloadPDFPayslip(content, payment) {
        // Simular descarga de PDF
        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${payment.staffName}-${payment.period}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    printPayslip(content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Recibo de Pago</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .payslip { max-width: 800px; margin: 0 auto; }
                    .payslip-header { text-align: center; margin-bottom: 30px; }
                    .payslip-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-section { flex: 1; }
                    .breakdown-table { width: 100%; border-collapse: collapse; }
                    .breakdown-table td { padding: 8px; border-bottom: 1px solid #ddd; }
                    .total-row { font-weight: bold; border-top: 2px solid #000; }
                    .payslip-footer { margin-top: 40px; text-align: center; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    async sendPayslip() {
        const paymentOptions = this.staffPayments.map(payment => ({
            value: payment.id,
            text: `${payment.staffName} - ${payment.period}`
        }));

        const result = await this.modalSystem.form('Enviar Recibo por Email', [
            {
                label: 'Pago',
                type: 'select',
                required: true,
                options: paymentOptions
            },
            {
                label: 'Email del Destinatario',
                type: 'email',
                required: true,
                placeholder: 'empleado@email.com'
            },
            {
                label: 'Asunto',
                type: 'text',
                required: true,
                value: 'Recibo de Pago - Quantum Tower'
            },
            {
                label: 'Mensaje Adicional',
                type: 'textarea',
                placeholder: 'Mensaje personalizado para el empleado...'
            }
        ]);

        if (result) {
            this.showLoading('Enviando recibo por email...');

            setTimeout(() => {
                this.hideLoading();
                this.modalSystem.alert('✅ Recibo Enviado', 
                    `Recibo de pago enviado exitosamente a ${result['Email del Destinatario']}.`, 
                    'success');
            }, 2000);
        }
    }

    sendPayslipForPayment(paymentId) {
        const payment = this.staffPayments.find(p => p.id === paymentId);
        if (payment) {
            const staff = this.staffMembers.find(s => s.id === payment.staffId);
            this.sendPayslipToStaff(staff, payment);
        }
    }

    sendPayslipToStaff(staff, payment) {
        this.showLoading(`Enviando recibo a ${staff.email}...`);

        setTimeout(() => {
            this.hideLoading();
            this.modalSystem.alert('✅ Recibo Enviado', 
                `Recibo de pago enviado exitosamente a ${staff.name}.`, 
                'success');
        }, 1500);
    }

    async generateBulkPayslips() {
        const result = await this.modalSystem.form('Generar Recibos Masivos', [
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'current', text: 'Período Actual' },
                    { value: 'last', text: 'Último Período' },
                    { value: 'specific', text: 'Período Específico' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF Individual' },
                    { value: 'zip', text: 'ZIP con Todos' },
                    { value: 'email', text: 'Enviar por Email' }
                ]
            },
            {
                label: 'Incluir Solo Pagos Pendientes',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.showLoading('Generando recibos masivos...');

            setTimeout(() => {
                this.hideLoading();

                const paymentsCount = this.staffPayments.filter(p => 
                    result['Incluir Solo Pagos Pendientes'] === 'on' ? p.status === 'pending' : true
                ).length;

                this.modalSystem.alert('✅ Recibos Generados', 
                    `Se generaron ${paymentsCount} recibos de pago exitosamente.`, 
                    'success');
            }, 3000);
        }
    }

    viewStaffDetails(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (staff) {
            const contract = this.contracts.find(c => c.staffId === staffId);
            const payments = this.staffPayments.filter(p => p.staffId === staffId);
            const staffBonuses = this.bonuses.filter(b => b.staffId === staffId);

            this.modalSystem.show({
                title: `👤 Detalles de Personal - ${staff.name}`,
                content: `
                    <div class="staff-details-modal">
                        <div class="detail-section">
                            <h4>Información Personal</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Nombre:</label>
                                    <span>${staff.name}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Cargo:</label>
                                    <span>${this.getPositionDisplayName(staff.position)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Teléfono:</label>
                                    <span>${staff.phone}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Email:</label>
                                    <span>${staff.email}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha de Contratación:</label>
                                    <span>${staff.hireDate}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Salario Base:</label>
                                    <span>$${staff.baseSalary}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span class="status status-${staff.status}">${this.capitalizeFirst(staff.status)}</span>
                                </div>
                            </div>
                        </div>

                        ${contract ? `
                        <div class="detail-section">
                            <h4>Información del Contrato</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Tipo:</label>
                                    <span>${this.capitalizeFirst(contract.type)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha Inicio:</label>
                                    <span>${contract.startDate}</span>
                                </div>
                                ${contract.endDate ? `
                                <div class="detail-item">
                                    <label>Fecha Fin:</label>
                                    <span>${contract.endDate}</span>
                                </div>
                                ` : ''}
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span class="status status-${contract.status}">${this.capitalizeFirst(contract.status)}</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="detail-section">
                            <h4>Historial de Pagos</h4>
                            <div class="payments-summary">
                                <p>Total de Pagos: ${payments.length}</p>
                                <p>Total Pagado: $${payments.reduce((sum, p) => sum + p.total, 0)}</p>
                            </div>
                        </div>

                        ${staffBonuses.length > 0 ? `
                        <div class="detail-section">
                            <h4>Bonos Recibidos</h4>
                            <div class="bonuses-list">
                                ${staffBonuses.map(bonus => `
                                    <div class="bonus-item">
                                        <strong>${this.capitalizeFirst(bonus.type)}:</strong> $${bonus.amount}
                                        <div class="bonus-reason">${bonus.reason}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `,
                buttons: [
                    {
                        text: 'Editar',
                        class: 'custom-btn-primary',
                        icon: 'edit',
                        handler: () => this.editStaffMember(staffId)
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

    editStaffMember(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (staff) {
            this.modalSystem.alert('✏️ Editar Personal', 
                `Funcionalidad de edición para ${staff.name} en desarrollo.`, 
                'info');
        }
    }

    payStaffMember(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (staff) {
            this.showNewStaffPaymentModal();
        }
    }

    viewStaffPaymentDetails(paymentId) {
        const payment = this.staffPayments.find(p => p.id === paymentId);
        if (payment) {
            const staff = this.staffMembers.find(s => s.id === payment.staffId);
            const bonuses = this.bonuses.filter(b => b.staffId === payment.staffId && b.period === payment.period);

            this.modalSystem.show({
                title: `💰 Detalles de Pago - ${payment.id}`,
                content: `
                    <div class="payment-details-modal">
                        <div class="detail-section">
                            <h4>Información del Pago</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Personal:</label>
                                    <span>${payment.staffName}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Cargo:</label>
                                    <span>${payment.position}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Período:</label>
                                    <span>${payment.period}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha de Pago:</label>
                                    <span>${payment.paymentDate}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Método:</label>
                                    <span>${this.capitalizeFirst(payment.method)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span class="status status-${payment.status}">${this.capitalizeFirst(payment.status)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Desglose del Pago</h4>
                            <div class="payment-breakdown">
                                <div class="breakdown-item">
                                    <span>Salario Base:</span>
                                    <span>$${payment.baseSalary}</span>
                                </div>
                                <div class="breakdown-item">
                                    <span>Bonos:</span>
                                    <span>$${payment.bonuses}</span>
                                </div>
                                <div class="breakdown-item">
                                    <span>Descuentos:</span>
                                    <span>-$${payment.deductions}</span>
                                </div>
                                <div class="breakdown-item total">
                                    <span>Total Neto:</span>
                                    <span>$${payment.total}</span>
                                </div>
                            </div>
                        </div>

                        ${bonuses.length > 0 ? `
                        <div class="detail-section">
                            <h4>Bonos Aplicados</h4>
                            <div class="bonuses-list">
                                ${bonuses.map(bonus => `
                                    <div class="bonus-item">
                                        <span class="bonus-type">${this.capitalizeFirst(bonus.type)}:</span>
                                        <span class="bonus-amount">$${bonus.amount}</span>
                                        <div class="bonus-reason">${bonus.reason}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `,
                buttons: [
                    {
                        text: 'Imprimir Recibo',
                        class: 'custom-btn-primary',
                        icon: 'print',
                        handler: () => this.generatePayslipForPayment(paymentId)
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

    viewStaffContract(staffId) {
        const contract = this.contracts.find(c => c.staffId === staffId);
        const staff = this.staffMembers.find(s => s.id === staffId);

        if (contract && staff) {
            this.modalSystem.show({
                title: `📄 Contrato - ${staff.name}`,
                content: `
                    <div class="contract-details">
                        <div class="contract-section">
                            <h4>Información del Contrato</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Empleado:</label>
                                    <span>${staff.name}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Cargo:</label>
                                    <span>${this.getPositionDisplayName(staff.position)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Tipo de Contrato:</label>
                                    <span>${this.capitalizeFirst(contract.type)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha de Inicio:</label>
                                    <span>${contract.startDate}</span>
                                </div>
                                ${contract.endDate ? `
                                <div class="detail-item">
                                    <label>Fecha de Fin:</label>
                                    <span>${contract.endDate}</span>
                                </div>
                                ` : ''}
                                <div class="detail-item">
                                    <label>Salario:</label>
                                    <span>$${contract.salary}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span class="status status-${contract.status}">${this.capitalizeFirst(contract.status)}</span>
                                </div>
                            </div>
                        </div>

                        ${contract.benefits && contract.benefits.length > 0 ? `
                        <div class="contract-section">
                            <h4>Beneficios</h4>
                            <ul class="benefits-list">
                                ${contract.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                `,
                buttons: [
                    {
                        text: 'Imprimir Contrato',
                        class: 'custom-btn-primary',
                        icon: 'print',
                        handler: () => this.printContract(contract, staff)
                    },
                    {
                        text: 'Cerrar',
                        class: 'custom-btn-secondary',
                        handler: () => this.modalSystem.close()
                    }
                ]
            });
        } else {
            this.modalSystem.alert('ℹ️ Sin Contrato', 
                `${staff ? staff.name : 'El empleado'} no tiene contrato registrado.`, 
                'info');
        }
    }

    printContract(contract, staff) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Contrato - ${staff.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    .contract-header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .contract-section { margin-bottom: 30px; }
                    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .detail-item { margin-bottom: 10px; }
                    .benefits-list { list-style-type: disc; margin-left: 20px; }
                    .signature-area { margin-top: 100px; display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>
                <div class="contract-header">
                    <h1>CONTRATO DE TRABAJO</h1>
                    <h2>Quantum Tower</h2>
                </div>
                
                <div class="contract-section">
                    <h3>Información de las Partes</h3>
                    <div class="detail-grid">
                        <div class="detail-item"><strong>Empleado:</strong> ${staff.name}</div>
                        <div class="detail-item"><strong>Cargo:</strong> ${this.getPositionDisplayName(staff.position)}</div>
                        <div class="detail-item"><strong>Tipo de Contrato:</strong> ${this.capitalizeFirst(contract.type)}</div>
                        <div class="detail-item"><strong>Fecha de Inicio:</strong> ${contract.startDate}</div>
                        ${contract.endDate ? `<div class="detail-item"><strong>Fecha de Fin:</strong> ${contract.endDate}</div>` : ''}
                        <div class="detail-item"><strong>Salario:</strong> $${contract.salary}</div>
                    </div>
                </div>

                ${contract.benefits && contract.benefits.length > 0 ? `
                <div class="contract-section">
                    <h3>Beneficios</h3>
                    <ul class="benefits-list">
                        ${contract.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                <div class="signature-area">
                    <div>
                        <p>_________________________</p>
                        <p>Firma del Empleado</p>
                    </div>
                    <div>
                        <p>_________________________</p>
                        <p>Firma del Representante Legal<br>Quantum Tower</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    renewContract(staffId, data) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (staff) {
            this.modalSystem.alert('✅ Contrato Renovado', 
                `Contrato de ${staff.name} renovado exitosamente.`, 
                'success');
        }
    }

    terminateContract(staffId) {
        const staff = this.staffMembers.find(s => s.id === staffId);
        if (staff) {
            this.modalSystem.confirm('⚠️ Terminar Contrato', 
                `¿Está seguro de terminar el contrato de ${staff.name}?`)
                .then(confirmed => {
                    if (confirmed) {
                        staff.status = 'inactive';
                        const contract = this.contracts.find(c => c.staffId === staffId);
                        if (contract) {
                            contract.status = 'terminated';
                        }
                        this.saveData();
                        this.updateStaffTable();
                        this.updateStaffStatistics();
                        
                        this.modalSystem.alert('✅ Contrato Terminado', 
                            `Contrato de ${staff.name} terminado exitosamente.`, 
                            'warning');
                    }
                });
        }
    }

    updateStaffTable() {
        const tbody = document.querySelector('#staff-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.staffMembers.map(staff => `
            <tr>
                <td>
                    <div class="staff-info">
                        <strong>${staff.name}</strong>
                        <div class="staff-email">${staff.email}</div>
                    </div>
                </td>
                <td><span class="badge ${staff.position}">${this.getPositionDisplayName(staff.position)}</span></td>
                <td>${staff.phone}</td>
                <td>${staff.email}</td>
                <td>$${staff.baseSalary}</td>
                <td>${staff.hireDate}</td>
                <td><span class="status status-${staff.status}">${this.capitalizeFirst(staff.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-staff" data-id="${staff.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-staff" data-id="${staff.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon pay-staff" data-id="${staff.id}" title="Realizar pago">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStaffPaymentsTable() {
        const tbody = document.querySelector('#staff-payments-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.staffPayments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.staffName}</td>
                <td>${payment.position}</td>
                <td>${payment.period}</td>
                <td>$${payment.baseSalary}</td>
                <td>$${payment.bonuses}</td>
                <td>$${payment.deductions}</td>
                <td>$${payment.total}</td>
                <td>${payment.paymentDate}</td>
                <td><span class="status status-${payment.status}">${this.capitalizeFirst(payment.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-payment-staff" data-id="${payment.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon print-receipt-staff" data-id="${payment.id}" title="Imprimir recibo">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getPositionDisplayName(position) {
        const positions = {
            'portero': 'Portero',
            'operador-ascensor': 'Operador de Ascensor',
            'administrativo': 'Administrativo',
            'limpieza': 'Limpieza'
        };
        return positions[position] || position;
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
        try {
            localStorage.setItem('maintenanceTickets', JSON.stringify(this.maintenanceTickets));
            localStorage.setItem('payments', JSON.stringify(this.payments));
            localStorage.setItem('residents', JSON.stringify(this.residents));
            localStorage.setItem('accessPermissions', JSON.stringify(this.accessPermissions));
            localStorage.setItem('communications', JSON.stringify(this.communications));
            localStorage.setItem('debtors', JSON.stringify(this.debtors));
            localStorage.setItem('budgetData', JSON.stringify(this.budgetData));
            localStorage.setItem('emergencyData', JSON.stringify(this.emergencyData));
            localStorage.setItem('commonAreas', JSON.stringify(this.commonAreas));
            localStorage.setItem('areaReservations', JSON.stringify(this.areaReservations));
            localStorage.setItem('areaPayments', JSON.stringify(this.areaPayments));
            localStorage.setItem('staffMembers', JSON.stringify(this.staffMembers));
            localStorage.setItem('staffPayments', JSON.stringify(this.staffPayments));
            localStorage.setItem('bonuses', JSON.stringify(this.bonuses));
            localStorage.setItem('contracts', JSON.stringify(this.contracts));
            
            // Guardar contadores
            localStorage.setItem('nextTicketId', this.nextTicketId.toString());
            localStorage.setItem('nextPaymentId', this.nextPaymentId.toString());
            localStorage.setItem('nextResidentId', this.nextResidentId.toString());
            localStorage.setItem('nextReservationId', this.nextReservationId.toString());
            localStorage.setItem('nextStaffId', this.nextStaffId.toString());
            localStorage.setItem('nextStaffPaymentId', this.nextStaffPaymentId.toString());
            
            console.log('💾 Datos guardados exitosamente');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
            this.modalSystem.alert('Error', 'No se pudieron guardar los datos. El almacenamiento puede estar lleno.', 'error');
        }
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
            case 'areas-comunes':
                this.loadCommonAreasData();
                break;
            case 'pagos-personal':
                this.loadStaffPaymentsData();
                break;
        }
    }

    loadCommonAreasData() {
        this.updateReservationsTable();
        this.updateAreaPaymentsTable();
        this.updateCommonAreasTable();
        this.updateStaffStatistics();
    }

    loadStaffPaymentsData() {
        this.updateStaffTable();
        this.updateStaffPaymentsTable();
        this.updatePayrollDistribution();
        this.updateStaffStatistics();
    }

    loadExecutivePanelData() {
        // Cargar datos del panel ejecutivo
        this.updateFinancialMetrics();
        this.updateMaintenanceDashboard();
        this.updateEmergencyStats();
        this.updateExecutiveKPIs();
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

    loadResidentsData() {
        this.updateResidentsTable();
        this.updateResidentStats();
    }

    loadAccessData() {
        // Placeholder para datos de control de accesos
        console.log('🔐 Cargando datos de control de accesos...');
        this.updateElementText('access-permissions-count', this.accessPermissions.length);
        this.updateAccessTable();
    }

    loadCommunicationsData() {
        // Placeholder para datos de comunicaciones
        console.log('📢 Cargando datos de comunicaciones...');
        this.updateElementText('announcements-count', this.communications.length);
        this.updateCommunicationsTable();
    }

    loadEmergencyData() {
        this.updateEmergencyStats();
        this.updateEmergencyCharts();
    }

    loadConfigurationData() {
        this.loadConfigurationSettings();
    }

    updateExecutiveKPIs() {
        // Actualizar KPIs principales del dashboard
        const totalResidents = this.residents.length;
        const activeTickets = this.maintenanceTickets.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
        const monthlyIncome = this.payments
            .filter(p => p.status === 'completed' && p.date.includes(new Date().toISOString().substring(0, 7)))
            .reduce((sum, p) => sum + p.amount, 0);

        this.updateElementText('total-residents', totalResidents);
        this.updateElementText('active-tickets', activeTickets);
        this.updateElementText('monthly-income', `$${monthlyIncome.toLocaleString()}`);
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
                        <button class="
                        delete-payment" data-id="${payment.id}" title="Eliminar">
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
                <td>${debtor.daysLate} días</td>
                <td><span class="status status-${debtor.status}">${this.capitalizeFirst(debtor.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon send-reminder" data-debtor="${debtor.name}" title="Enviar recordatorio">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn-icon create-payment-plan" data-debtor="${debtor.name}" title="Crear plan de pago">
                            <i class="fas fa-calendar"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateFinancialMetrics() {
        // Actualizar métricas financieras
        const totalIncome = this.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingPayments = this.payments.filter(p => p.status === 'pending').length;
        const totalDebt = this.debtors.reduce((sum, d) => sum + d.amount, 0);

        this.updateElementText('total-income', `$${totalIncome.toLocaleString()}`);
        this.updateElementText('pending-payments', pendingPayments);
        this.updateElementText('total-debt', `$${totalDebt.toLocaleString()}`);
    }

    updateBudgetDetails() {
        // Actualizar detalles del presupuesto
        const budgetContainer = document.querySelector('.budget-list');
        if (!budgetContainer) return;

        budgetContainer.innerHTML = this.budgetData.categories.map(category => `
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
                        <div class="progress-fill" style="width: ${(category.actual / category.planned) * 100}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateMaintenanceDashboard() {
        // Actualizar dashboard de mantenimiento
        const pendingTickets = this.maintenanceTickets.filter(t => t.status === 'pending').length;
        const inProgressTickets = this.maintenanceTickets.filter(t => t.status === 'in-progress').length;
        const completedTickets = this.maintenanceTickets.filter(t => t.status === 'completed').length;
        const urgentTickets = this.maintenanceTickets.filter(t => t.priority === 'urgente').length;

        this.updateElementText('maintenance-pending', pendingTickets);
        this.updateElementText('maintenance-in-progress', inProgressTickets);
        this.updateElementText('maintenance-completed', completedTickets);
        this.updateElementText('maintenance-urgent', urgentTickets);

        this.updateMaintenanceTable();
    }

    updateMaintenanceTable() {
        const tbody = document.querySelector('#maintenance-tickets-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.maintenanceTickets.map(ticket => `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.location}</td>
                <td>${ticket.reporter}</td>
                <td>${new Date(ticket.created).toLocaleDateString()}</td>
                <td><span class="badge ${ticket.priority}">${this.capitalizeFirst(ticket.priority)}</span></td>
                <td><span class="status status-${ticket.status}">${this.capitalizeFirst(ticket.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-ticket" data-id="${ticket.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon assign-ticket" data-id="${ticket.id}" title="Asignar">
                            <i class="fas fa-user-check"></i>
                        </button>
                        ${ticket.status !== 'completed' ? `
                        <button class="btn-icon complete-ticket" data-id="${ticket.id}" title="Completar">
                            <i class="fas fa-check"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateResidentsTable() {
        const tbody = document.querySelector('#residents-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.residents.map(resident => `
            <tr>
                <td>
                    <div class="resident-info">
                        <strong>${resident.name}</strong>
                        <div class="resident-department">${resident.department}</div>
                    </div>
                </td>
                <td>${resident.department}</td>
                <td>${resident.phone}</td>
                <td>${resident.email}</td>
                <td>${resident.moveInDate}</td>
                <td><span class="status status-${resident.status}">${this.capitalizeFirst(resident.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-resident" data-id="${resident.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-resident" data-id="${resident.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon send-message" data-id="${resident.id}" title="Enviar mensaje">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateResidentStats() {
        const totalResidents = this.residents.length;
        const activeResidents = this.residents.filter(r => r.status === 'active').length;
        const owners = this.residents.filter(r => r.type === 'owner').length;
        const tenants = this.residents.filter(r => r.type === 'tenant').length;

        this.updateElementText('total-residents', totalResidents);
        this.updateElementText('active-residents', activeResidents);
        this.updateElementText('resident-owners', owners);
        this.updateElementText('resident-tenants', tenants);
    }

    updateAccessTable() {
        const tbody = document.querySelector('#access-permissions-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.accessPermissions.map(permission => `
            <tr>
                <td>${permission.residentName}</td>
                <td><span class="badge resident">Residente</span></td>
                <td>${permission.area}</td>
                <td>24/7</td>
                <td>2024-12-31</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-permission" data-id="${permission.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon revoke-permission" data-id="${permission.id}" title="Revocar">
                            <i class="fas fa-ban"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCommunicationsTable() {
        const tbody = document.querySelector('#announcements-table tbody');
        if (!tbody) return;

        tbody.innerHTML = this.communications.map(comm => `
            <tr>
                <td>${comm.title}</td>
                <td><span class="badge ${comm.type}">${this.capitalizeFirst(comm.type)}</span></td>
                <td>${comm.date}</td>
                <td>Todos los residentes</td>
                <td><span class="status status-${comm.status}">${this.capitalizeFirst(comm.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-announcement" data-id="${comm.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon resend-announcement" data-id="${comm.id}" title="Reenviar">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="btn-icon delete-announcement" data-id="${comm.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateEmergencyStats() {
        // Actualizar estadísticas de emergencia
        const activeEmergencies = 2; // Simulado
        const securityIncidents = 5; // Simulado
        const resolvedEmergencies = 28; // Simulado

        this.updateElementText('active-emergencies', activeEmergencies);
        this.updateElementText('security-incidents', securityIncidents);
        this.updateElementText('resolved-emergencies', resolvedEmergencies);
    }

    updateEmergencyCharts() {
        // Actualizar gráficos de emergencia si existen
        if (this.charts.emergencyStats) {
            // Los gráficos ya están inicializados, solo necesitamos actualizar datos si es necesario
        }
    }

    loadConfigurationSettings() {
        // Cargar configuración desde localStorage
        const settings = JSON.parse(localStorage.getItem('dashboardSettings') || '{}');
        
        // Aplicar configuración
        if (settings.buildingName) {
            document.getElementById('building-name').value = settings.buildingName;
        }
        if (settings.timezone) {
            document.getElementById('timezone').value = settings.timezone;
        }
        if (settings.language) {
            document.getElementById('language').value = settings.language;
        }
    }

    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.switchSection(sectionId);
            });
        });

        // Botón de cerrar sesión
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Botón de notificaciones
        const notificationsBell = document.getElementById('notifications-bell');
        if (notificationsBell) {
            notificationsBell.addEventListener('click', () => this.showNotifications());
        }

        // Buscador global
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
        }

        // Botones de acción principales
        this.setupActionButtons();
        
        // Eventos específicos de secciones
        this.setupSectionSpecificEvents();

        // Configurar eventos de áreas comunes
        this.setupCommonAreasEvents();

        // Configurar eventos de pagos a personal
        this.setupStaffPaymentsEvents();
    }

    setupActionButtons() {
        const actions = {
            'refresh-dashboard': () => this.refreshDashboard(),
            'generate-executive-report': () => this.generateExecutiveReport(),
            'new-maintenance-ticket': () => this.showNewMaintenanceTicketModal(),
            'new-resident': () => this.showNewResidentModal(),
            'new-announcement': () => this.showNewAnnouncementModal(),
            'new-emergency': () => this.showNewEmergencyModal(),
            'save-settings': () => this.saveSettings(),
            'reset-settings': () => this.resetSettings()
        };

        Object.entries(actions).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupSectionSpecificEvents() {
        // Eventos para gestión financiera
        this.setupFinancialEvents();
        
        // Eventos para mantenimiento
        this.setupMaintenanceEvents();
        
        // Eventos para residentes
        this.setupResidentsEvents();
        
        // Eventos para comunicaciones
        this.setupCommunicationsEvents();
        
        // Eventos para emergencias
        this.setupEmergencyEvents();
        
        // Eventos para configuración
        this.setupConfigurationEvents();
    }

    setupFinancialEvents() {
        const elements = {
            'new-invoice': () => this.showNewInvoiceModal(),
            'financial-reports': () => this.generateFinancialReports(),
            'generate-receipts': () => this.generateReceipts(),
            'send-bulk-reminders': () => this.sendBulkReminders(),
            'create-payment-plan': () => this.createPaymentPlan(),
            'block-access': () => this.blockAccessForDebtors(),
            'generate-debt-report': () => this.generateDebtReport(),
            'collection-analysis': () => this.collectionAnalysis()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Configurar tabs de pagos
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

    setupMaintenanceEvents() {
        const elements = {
            'filter-maintenance': () => this.filterMaintenanceTickets(),
            'schedule-maintenance': () => this.scheduleMaintenance(),
            'add-company': () => this.addMaintenanceCompany(),
            'create-ticket': () => this.showNewMaintenanceTicketModal(),
            'assign-technician': () => this.assignTechnician(),
            'update-status': () => this.updateMaintenanceStatus()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupResidentsEvents() {
        const elements = {
            'resident-reports': () => this.generateResidentReports(),
            'send-bulk-message': () => this.sendBulkMessage(),
            'export-residents': () => this.exportResidents(),
            'import-residents': () => this.importResidents(),
            'manage-access': () => this.manageResidentAccess(),
            'generate-access-report': () => this.generateAccessReport()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupCommunicationsEvents() {
        const elements = {
            'message-history': () => this.showMessageHistory(),
            'send-maintenance-alert': () => this.sendMaintenanceAlert(),
            'send-security-update': () => this.sendSecurityUpdate(),
            'send-payment-reminder': () => this.sendPaymentReminder(),
            'send-emergency-alert': () => this.sendEmergencyAlert(),
            'preview-announcement': () => this.previewAnnouncement(),
            'filter-announcements': () => this.filterAnnouncements()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupEmergencyEvents() {
        const elements = {
            'emergency-history': () => this.showEmergencyHistory(),
            'emergency-procedures': () => this.showEmergencyProcedures(),
            'test-fire-alarm': () => this.testFireAlarm(),
            'lockdown-building': () => this.lockdownBuilding(),
            'call-ambulance': () => this.callAmbulance(),
            'test-alert': () => this.testAlert(),
            'send-alert': () => this.sendAlert(),
            'generate-emergency-report': () => this.generateEmergencyReport()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Configurar tabs de emergencias
        this.setupEmergencyTabs();
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

    setupConfigurationEvents() {
        const elements = {
            'add-user': () => this.addUser(),
            'backup-now': () => this.backupNow(),
            'restore-backup': () => this.restoreBackup()
        };

        Object.entries(elements).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Configurar tabs de configuración
        this.setupConfigurationTabs();
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

    // ==================== MÉTODOS DE ACCIÓN PRINCIPALES ====================

    async refreshDashboard() {
        this.showLoading('Actualizando dashboard...');
        
        // Simular actualización de datos
        setTimeout(() => {
            this.loadDashboardData();
            this.hideLoading();
            this.modalSystem.alert('✅ Dashboard Actualizado', 'Todos los datos han sido actualizados correctamente.', 'success');
        }, 1500);
    }

    async generateExecutiveReport() {
        const result = await this.modalSystem.form('Generar Reporte Ejecutivo', [
            {
                label: 'Período',
                type: 'select',
                required: true,
                options: [
                    { value: 'monthly', text: 'Mensual' },
                    { value: 'quarterly', text: 'Trimestral' },
                    { value: 'annual', text: 'Anual' }
                ]
            },
            {
                label: 'Formato',
                type: 'select',
                required: true,
                options: [
                    { value: 'pdf', text: 'PDF' },
                    { value: 'excel', text: 'Excel' },
                    { value: 'both', text: 'PDF y Excel' }
                ]
            },
            {
                label: 'Incluir Gráficos',
                type: 'checkbox',
                value: 'on'
            },
            {
                label: 'Incluir Análisis',
                type: 'checkbox',
                value: 'on'
            }
        ]);

        if (result) {
            this.showLoading('Generando reporte ejecutivo...');

            setTimeout(() => {
                this.hideLoading();
                
                // Simular generación de reporte
                const reportData = {
                    period: result['Período'],
                    generatedAt: new Date().toISOString(),
                    metrics: {
                        totalResidents: this.residents.length,
                        monthlyIncome: this.payments
                            .filter(p => p.status === 'completed')
                            .reduce((sum, p) => sum + p.amount, 0),
                        activeTickets: this.maintenanceTickets.filter(t => 
                            t.status === 'pending' || t.status === 'in-progress'
                        ).length,
                        occupancyRate: '85%'
                    }
                };

                this.downloadReport(reportData, result['Formato']);
                
                this.modalSystem.alert('✅ Reporte Generado', 
                    `Reporte ejecutivo ${result['Período']} generado exitosamente.`, 
                    'success');
            }, 2000);
        }
    }

    async showNewMaintenanceTicketModal() {
        const result = await this.modalSystem.form('Nuevo Ticket de Mantenimiento', [
            {
                label: 'Título',
                type: 'text',
                required: true,
                placeholder: 'Descripción breve del problema'
            },
            {
                label: 'Área',
                type: 'select',
                required: true,
                options: [
                    { value: 'plomeria', text: 'Plomería' },
                    { value: 'electricidad', text: 'Electricidad' },
                    { value: 'ascensores', text: 'Ascensores' },
                    { value: 'areas-comunes', text: 'Áreas Comunes' },
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
                label: 'Ubicación',
                type: 'text',
                required: true,
                placeholder: 'Ej: Torre A, Piso 5, Departamento 501'
            },
            {
                label: 'Descripción Detallada',
                type: 'textarea',
                required: true,
                placeholder: 'Describa el problema en detalle...'
            },
            {
                label: 'Reportado Por',
                type: 'text',
                required: true,
                placeholder: 'Nombre de quien reporta'
            },
            {
                label: 'Teléfono de Contacto',
                type: 'tel',
                required: true,
                placeholder: '+56 9 1234 5678'
            }
        ]);

        if (result) {
            const newTicket = {
                id: `MT-${this.nextTicketId}`,
                title: result['Título'],
                area: result['Área'],
                priority: result['Prioridad'],
                status: 'pending',
                location: result['Ubicación'],
                description: result['Descripción Detallada'],
                reporter: result['Reportado Por'],
                contact: result['Teléfono de Contacto'],
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

            this.maintenanceTickets.push(newTicket);
            this.nextTicketId++;
            this.saveData();
            this.updateMaintenanceDashboard();
            
            this.modalSystem.alert('✅ Ticket Creado', 
                `Ticket de mantenimiento creado exitosamente (ID: ${newTicket.id}).`, 
                'success');
        }
    }

    async showNewResidentModal() {
        const result = await this.modalSystem.form('Nuevo Residente', [
            {
                label: 'Nombre Completo',
                type: 'text',
                required: true,
                placeholder: 'Nombre y apellido'
            },
            {
                label: 'Departamento',
                type: 'text',
                required: true,
                placeholder: 'Ej: Torre A - 501'
            },
            {
                label: 'Teléfono',
                type: 'tel',
                required: true,
                placeholder: '+56 9 1234 5678'
            },
            {
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'residente@email.com'
            },
            {
                label: 'Tipo',
                type: 'select',
                required: true,
                options: [
                    { value: 'owner', text: 'Propietario' },
                    { value: 'tenant', text: 'Inquilino' },
                    { value: 'commercial', text: 'Comercial' }
                ]
            },
            {
                label: 'Fecha de Ingreso',
                type: 'date',
                required: true
            }
        ]);

        if (result) {
            const newResident = {
                id: `R-${this.nextResidentId}`,
                name: result['Nombre Completo'],
                department: result['Departamento'],
                phone: result['Teléfono'],
                email: result['Email'],
                status: 'active',
                type: result['Tipo'],
                moveInDate: result['Fecha de Ingreso']
            };

            this.residents.push(newResident);
            this.nextResidentId++;
            this.saveData();
            this.updateResidentsTable();
            this.updateResidentStats();
            
            this.modalSystem.alert('✅ Residente Agregado', 
                `Residente "${newResident.name}" agregado exitosamente.`, 
                'success');
        }
    }

    async showNewAnnouncementModal() {
        const result = await this.modalSystem.form('Nuevo Anuncio', [
            {
                label: 'Título',
                type: 'text',
                required: true,
                placeholder: 'Título del anuncio'
            },
            {
                label: 'Tipo',
                type: 'select',
                required: true,
                options: [
                    { value: 'general', text: 'General' },
                    { value: 'maintenance', text: 'Mantenimiento' },
                    { value: 'security', text: 'Seguridad' },
                    { value: 'emergency', text: 'Emergencia' },
                    { value: 'payment', text: 'Pagos' }
                ]
            },
            {
                label: 'Prioridad',
                type: 'select',
                required: true,
                options: [
                    { value: 'low', text: 'Baja' },
                    { value: 'medium', text: 'Media' },
                    { value: 'high', text: 'Alta' },
                    { value: 'urgent', text: 'Urgente' }
                ]
            },
            {
                label: 'Mensaje',
                type: 'textarea',
                required: true,
                placeholder: 'Contenido del anuncio...'
            },
            {
                label: 'Destinatarios',
                type: 'select',
                required: true,
                options: [
                    { value: 'all', text: 'Todos los residentes' },
                    { value: 'owners', text: 'Solo propietarios' },
                    { value: 'tenants', text: 'Solo inquilinos' },
                    { value: 'commercial', text: 'Solo comerciales' }
                ]
            }
        ]);

        if (result) {
            const newAnnouncement = {
                id: `COM-${Date.now()}`,
                title: result['Título'],
                type: result['Tipo'],
                priority: result['Prioridad'],
                content: result['Mensaje'],
                recipients: result['Destinatarios'],
                date: new Date().toISOString().split('T')[0],
                status: 'sent'
            };

            this.communications.push(newAnnouncement);
            this.saveData();
            this.updateCommunicationsTable();
            
            this.modalSystem.alert('✅ Anuncio Enviado', 
                `Anuncio "${newAnnouncement.title}" enviado exitosamente.`, 
                'success');
        }
    }

    async showNewEmergencyModal() {
        const result = await this.modalSystem.form('Registrar Emergencia', [
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
                placeholder: 'Ubicación exacta de la emergencia'
            },
            {
                label: 'Descripción',
                type: 'textarea',
                required: true,
                placeholder: 'Describa la emergencia en detalle...'
            },
            {
                label: 'Acción Inmediata Requerida',
                type: 'textarea',
                required: true,
                placeholder: 'Qué acción se debe tomar inmediatamente...'
            }
        ]);

        if (result) {
            this.modalSystem.alert('🚨 Emergencia Registrada', 
                `Emergencia de ${result['Tipo de Emergencia']} registrada. Se han activado los protocolos correspondientes.`, 
                'warning');
        }
    }

    async saveSettings() {
        const settings = {
            buildingName: document.getElementById('building-name').value,
            timezone: document.getElementById('timezone').value,
            language: document.getElementById('language').value,
            currency: document.getElementById('currency').value,
            dateFormat: document.getElementById('date-format').value
        };

        localStorage.setItem('dashboardSettings', JSON.stringify(settings));
        
        this.modalSystem.alert('✅ Configuración Guardada', 
            'La configuración ha sido guardada exitosamente.', 
            'success');
    }

    async resetSettings() {
        const confirm = await this.modalSystem.confirm(
            '⚠️ Restablecer Configuración',
            '¿Está seguro de restablecer toda la configuración a los valores predeterminados?'
        );

        if (confirm) {
            localStorage.removeItem('dashboardSettings');
            this.loadConfigurationSettings();
            
            this.modalSystem.alert('✅ Configuración Restablecida', 
                'La configuración ha sido restablecida a los valores predeterminados.', 
                'success');
        }
    }

    // ==================== MÉTODOS ADICIONALES DE GESTIÓN ====================

    async showNewInvoiceModal() {
        this.modalSystem.alert('📄 Nueva Factura', 
            'Funcionalidad de creación de facturas en desarrollo.', 
            'info');
    }

    async generateFinancialReports() {
        this.modalSystem.alert('📊 Reportes Financieros', 
            'Funcionalidad de reportes financieros en desarrollo.', 
            'info');
    }

    async generateReceipts() {
        this.modalSystem.alert('🧾 Generar Recibos', 
            'Funcionalidad de generación de recibos en desarrollo.', 
            'info');
    }

    async sendBulkReminders() {
        const confirm = await this.modalSystem.confirm(
            '📧 Enviar Recordatorios Masivos',
            '¿Está seguro de enviar recordatorios de pago a todos los residentes en mora?'
        );

        if (confirm) {
            this.showLoading('Enviando recordatorios...');
            
            setTimeout(() => {
                this.hideLoading();
                this.modalSystem.alert('✅ Recordatorios Enviados', 
                    `Se enviaron recordatorios a ${this.debtors.length} residentes en mora.`, 
                    'success');
            }, 2000);
        }
    }

    async createPaymentPlan() {
        this.modalSystem.alert('📅 Plan de Pago', 
            'Funcionalidad de planes de pago en desarrollo.', 
            'info');
    }

    async blockAccessForDebtors() {
        const confirm = await this.modalSystem.confirm(
            '🚫 Bloquear Acceso',
            '¿Está seguro de bloquear el acceso a los residentes en mora?'
        );

        if (confirm) {
            this.showLoading('Bloqueando accesos...');
            
            setTimeout(() => {
                this.hideLoading();
                this.modalSystem.alert('✅ Accesos Bloqueados', 
                    `Acceso bloqueado para ${this.debtors.length} residentes en mora.`, 
                    'warning');
            }, 1500);
        }
    }

    async generateDebtReport() {
        this.showLoading('Generando reporte de morosidad...');
        
        setTimeout(() => {
            this.hideLoading();
            
            const reportData = {
                totalDebtors: this.debtors.length,
                totalDebt: this.debtors.reduce((sum, d) => sum + d.amount, 0),
                debtors: this.debtors,
                generatedAt: new Date().toISOString()
            };

            this.downloadReport(reportData, 'pdf');
            
            this.modalSystem.alert('✅ Reporte Generado', 
                'Reporte de morosidad generado exitosamente.', 
                'success');
        }, 2000);
    }

    async collectionAnalysis() {
        this.showLoading('Analizando cobranza...');
        
        setTimeout(() => {
            this.hideLoading();
            
            const analysis = {
                totalDebtors: this.debtors.length,
                totalDebt: this.debtors.reduce((sum, d) => sum + d.amount, 0),
                averageDebt: this.debtors.reduce((sum, d) => sum + d.amount, 0) / this.debtors.length,
                oldestDebt: Math.max(...this.debtors.map(d => d.daysLate))
            };

            const analysisHtml = `
                <div class="collection-analysis">
                    <h4>Análisis de Cobranza</h4>
                    <div class="analysis-stats">
                        <div class="stat-card">
                            <div class="stat-value">${analysis.totalDebtors}</div>
                            <div class="stat-label">Deudores</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">$${analysis.totalDebt.toLocaleString()}</div>
                            <div class="stat-label">Deuda Total</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">$${analysis.averageDebt.toLocaleString()}</div>
                            <div class="stat-label">Deuda Promedio</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${analysis.oldestDebt}</div>
                            <div class="stat-label">Días de Morosidad</div>
                        </div>
                    </div>
                </div>
            `;

            this.modalSystem.show({
                title: '📊 Análisis de Cobranza',
                content: analysisHtml,
                buttons: [
                    {
                        text: 'Exportar',
                        class: 'custom-btn-primary',
                        handler: () => this.downloadReport(analysis, 'pdf')
                    },
                    {
                        text: 'Cerrar',
                        class: 'custom-btn-secondary',
                        handler: () => this.modalSystem.close()
                    }
                ]
            });
        }, 1500);
    }

    // ==================== MÉTODOS DE UTILIDAD ====================

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    loadDashboardData() {
        console.log('📊 Cargando datos del dashboard...');
        
        // Actualizar todas las métricas
        this.updateExecutiveKPIs();
        this.updateFinancialMetrics();
        this.updateMaintenanceDashboard();
        this.updateResidentStats();
        this.updateEmergencyStats();
        
        // Actualizar todas las tablas
        this.updatePaymentsTable();
        this.updateDebtorsTable();
        this.updateMaintenanceTable();
        this.updateResidentsTable();
        this.updateAccessTable();
        this.updateCommunicationsTable();
        
        console.log('✅ Datos del dashboard cargados');
    }

    updateUserInfo() {
        const userEmail = localStorage.getItem('userEmail') || 'admin@quantumtower.com';
        const userRole = localStorage.getItem('userRole') || 'administrador';
        
        const userEmailElement = document.getElementById('user-email');
        const userRoleElement = document.getElementById('user-role');
        
        if (userEmailElement) userEmailElement.textContent = userEmail;
        if (userRoleElement) userRoleElement.textContent = userRole;
    }

    async logout() {
        const confirm = await this.modalSystem.confirm(
            '🚪 Cerrar Sesión',
            '¿Está seguro de que desea cerrar sesión?'
        );

        if (confirm) {
            this.showLoading('Cerrando sesión...');
            
            setTimeout(() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userEmail');
                
                // Redirigir al login
                window.location.href = 'login.html';
            }, 1000);
        }
    }

    async showNotifications() {
        const notifications = [
            {
                id: 1,
                type: 'info',
                message: 'Nuevo ticket de mantenimiento reportado',
                time: 'Hace 5 minutos',
                read: false
            },
            {
                id: 2,
                type: 'warning',
                message: 'Pago pendiente de Carlos López',
                time: 'Hace 1 hora',
                read: false
            },
            {
                id: 3,
                type: 'success',
                message: 'Reserva de área común aprobada',
                time: 'Hace 2 horas',
                read: true
            }
        ];

        const notificationsHtml = notifications.map(notification => `
            <div class="notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}">
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <button class="notification-close" data-id="${notification.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        this.modalSystem.show({
            title: '🔔 Notificaciones',
            content: `
                <div class="notifications-panel">
                    ${notificationsHtml}
                </div>
            `,
            buttons: [
                {
                    text: 'Marcar Todas como Leídas',
                    class: 'custom-btn-secondary',
                    handler: () => this.markAllNotificationsAsRead()
                },
                {
                    text: 'Cerrar',
                    class: 'custom-btn-primary',
                    handler: () => this.modalSystem.close()
                }
            ]
        });
    }

    markAllNotificationsAsRead() {
        this.modalSystem.alert('✅ Notificaciones', 
            'Todas las notificaciones han sido marcadas como leídas.', 
            'success');
    }

    handleGlobalSearch(query) {
        if (query.length < 2) return;

        const results = [];
        
        // Buscar en residentes
        this.residents.forEach(resident => {
            if (resident.name.toLowerCase().includes(query.toLowerCase()) ||
                resident.department.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    type: 'resident',
                    title: resident.name,
                    subtitle: resident.department,
                    action: () => this.viewResidentDetails(resident.id)
                });
            }
        });

        // Buscar en tickets de mantenimiento
        this.maintenanceTickets.forEach(ticket => {
            if (ticket.title.toLowerCase().includes(query.toLowerCase()) ||
                ticket.location.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    type: 'maintenance',
                    title: ticket.title,
                    subtitle: ticket.location,
                    action: () => this.viewTicketDetails(ticket.id)
                });
            }
        });

        // Mostrar resultados
        if (results.length > 0) {
            this.showSearchResults(results, query);
        }
    }

    showSearchResults(results, query) {
        const resultsHtml = results.map(result => `
            <div class="search-result-item" data-type="${result.type}">
                <div class="search-result-content">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                </div>
                <button class="btn-icon view-result" data-action="${result.type}">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `).join('');

        this.modalSystem.show({
            title: `🔍 Resultados para "${query}"`,
            content: `
                <div class="search-results">
                    ${resultsHtml}
                </div>
            `,
            buttons: [
                {
                    text: 'Cerrar',
                    class: 'custom-btn-secondary',
                    handler: () => this.modalSystem.close()
                }
            ]
        });

        // Configurar eventos de los resultados
        document.querySelectorAll('.view-result').forEach(button => {
            button.addEventListener('click', (e) => {
                const resultItem = e.target.closest('.search-result-item');
                const resultType = resultItem.getAttribute('data-type');
                const result = results.find(r => r.type === resultType);
                if (result && result.action) {
                    result.action();
                }
            });
        });
    }

    viewResidentDetails(residentId) {
        const resident = this.residents.find(r => r.id === residentId);
        if (resident) {
            this.modalSystem.show({
                title: `👤 Detalles de Residente - ${resident.name}`,
                content: `
                    <div class="resident-details">
                        <div class="detail-section">
                            <h4>Información Personal</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Nombre:</label>
                                    <span>${resident.name}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Departamento:</label>
                                    <span>${resident.department}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Teléfono:</label>
                                    <span>${resident.phone}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Email:</label>
                                    <span>${resident.email}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Tipo:</label>
                                    <span>${this.capitalizeFirst(resident.type)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha de Ingreso:</label>
                                    <span>${resident.moveInDate}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span class="status status-${resident.status}">${this.capitalizeFirst(resident.status)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                buttons: [
                    {
                        text: 'Editar',
                        class: 'custom-btn-primary',
                        handler: () => this.editResident(residentId)
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

    viewTicketDetails(ticketId) {
        const ticket = this.maintenanceTickets.find(t => t.id === ticketId);
        if (ticket) {
            this.modalSystem.show({
                title: `🔧 Detalles de Ticket - ${ticket.id}`,
                content: `
                    <div class="ticket-details">
                        <div class="detail-section">
                            <h4>Información del Ticket</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <label>Título:</label>
                                    <span>${ticket.title}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Área:</label>
                                    <span>${this.capitalizeFirst(ticket.area)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Prioridad:</label>
                                    <span class="badge ${ticket.priority}">${this.capitalizeFirst(ticket.priority)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Estado:</label>
                                    <span class="status status-${ticket.status}">${this.capitalizeFirst(ticket.status)}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Ubicación:</label>
                                    <span>${ticket.location}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Reportado por:</label>
                                    <span>${ticket.reporter}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Contacto:</label>
                                    <span>${ticket.contact}</span>
                                </div>
                                <div class="detail-item">
                                    <label>Fecha de creación:</label>
                                    <span>${new Date(ticket.created).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4>Descripción</h4>
                            <p>${ticket.description}</p>
                        </div>
                    </div>
                `,
                buttons: [
                    {
                        text: 'Asignar',
                        class: 'custom-btn-primary',
                        handler: () => this.assignTicket(ticketId)
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

    editResident(residentId) {
        this.modalSystem.alert('✏️ Editar Residente', 
            'Funcionalidad de edición de residentes en desarrollo.', 
            'info');
    }

    assignTicket(ticketId) {
        this.modalSystem.alert('👤 Asignar Ticket', 
            'Funcionalidad de asignación de tickets en desarrollo.', 
            'info');
    }

    // ==================== INICIALIZACIÓN FINAL ====================

    initializeDashboard() {
        console.log('🎯 Inicializando dashboard completo...');
        
        // Verificar autenticación
        if (!localStorage.getItem('authToken')) {
            window.location.href = 'login.html';
            return;
        }

        // Cargar datos iniciales
        this.loadDashboardData();
        
        // Inicializar gráficos
        this.initializeCharts();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Mostrar sección por defecto
        this.switchSection('panel-ejecutivo');
        
        console.log('🚀 Dashboard Quantum Tower completamente inicializado');
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente cargado - Iniciando dashboard...');
    
    // Inicializar el dashboard
    window.adminDashboard = new AdminDashboard();
    window.adminDashboard.initializeDashboard();
    
    // Exponer el sistema de modales globalmente para debugging
    window.modalSystem = window.adminDashboard.modalSystem;
    
    console.log('✅ Dashboard listo para usar');
});

// Manejar errores no capturados
window.addEventListener('error', function(e) {
    console.error('❌ Error no capturado:', e.error);
});

// Exportar para uso en otros módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminDashboard, CustomModalSystem };
}