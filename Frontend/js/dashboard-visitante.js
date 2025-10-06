// Variables globales
let assistantActive = false;
let visitEndTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 horas desde ahora
let qrCode = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    startRealTimeUpdates();
    initializeAssistant();
    generateQRCode();
    setupReservationForm();
});

// Inicializar el dashboard
function initializeDashboard() {
    console.log('Dashboard de visitante inicializado');
    
    // Configurar eventos de botones
    setupEventListeners();
    
    // Actualizar información de tiempo
    updateTimeDisplay();
    
    // Iniciar contador de tiempo restante
    startTimeRemainingCounter();
}

// Configurar event listeners
function setupEventListeners() {
    // Asistente virtual
    document.getElementById('assistantAvatar').addEventListener('click', toggleAssistant);
    document.getElementById('closeChat').addEventListener('click', toggleAssistant);
    document.getElementById('sendMessage').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Botones de servicios
    document.querySelectorAll('.btn-copy').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            copyToClipboard(text);
        });
    });
    
    document.querySelectorAll('.btn-navigate').forEach(button => {
        button.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            showNavigation(location);
        });
    });
    
    // Selector de pisos
    document.querySelectorAll('.floor-btn').forEach(button => {
        button.addEventListener('click', function() {
            const floor = this.getAttribute('data-floor');
            showFloorMap(floor);
        });
    });
    
    // Botones de ayuda contextual
    document.querySelectorAll('.assistant-hint').forEach(hint => {
        hint.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSectionHelp(section);
        });
    });
}

// Configurar formulario de reservas
function setupReservationForm() {
    // Establecer fecha mínima como mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('next-visit-date');
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Establecer fecha por defecto en 3 días
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    dateInput.value = defaultDate.toISOString().split('T')[0];
}

// Inicializar asistente virtual
function initializeAssistant() {
    console.log('Asistente virtual inicializado');
    
    // Mensaje de bienvenida automático después de 3 segundos
    setTimeout(() => {
        if (!assistantActive) {
            addAssistantMessage('¡Bienvenido! Soy tu asistente virtual. Puedo ayudarte con reservas, navegación y cualquier duda durante tu visita.');
        }
    }, 3000);
}

// Alternar visibilidad del asistente
function toggleAssistant() {
    const chat = document.getElementById('assistantChat');
    assistantActive = !assistantActive;
    
    if (assistantActive) {
        chat.classList.add('active');
        document.getElementById('chatInput').focus();
    } else {
        chat.classList.remove('active');
    }
}

// Enviar mensaje al asistente
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Agregar mensaje del usuario
    addUserMessage(message);
    input.value = '';
    
    // Procesar mensaje y generar respuesta
    setTimeout(() => {
        const response = generateAssistantResponse(message);
        addAssistantMessage(response);
    }, 1000);
}

// Agregar mensaje del usuario al chat
function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Agregar mensaje del asistente al chat
function addAssistantMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Generar respuesta del asistente
function generateAssistantResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Respuestas predefinidas basadas en palabras clave
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenas')) {
        return '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte durante tu visita al edificio?';
    } else if (lowerMessage.includes('qr') || lowerMessage.includes('código')) {
        return 'Tu código QR es tu credencial de acceso. Muéstralo en los lectores de las puertas para acceder a las áreas permitidas. Es válido por 4 horas. Puedes descargarlo si lo necesitas.';
    } else if (lowerMessage.includes('mapa') || lowerMessage.includes('ubicación')) {
        return 'Puedes usar el mapa interactivo para ver las diferentes áreas del edificio. Las áreas verdes son de acceso permitido para visitantes.';
    } else if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
        return 'La red WiFi para visitantes es "BuildingPRO-Visitantes" y la contraseña es "welcome2024". Puedes copiarla haciendo clic en el botón de copiar.';
    } else if (lowerMessage.includes('estacionamiento') || lowerMessage.includes('parking')) {
        return 'El estacionamiento para visitantes está disponible en los niveles B1 y B2, con un tiempo máximo de 2 horas.';
    } else if (lowerMessage.includes('emergencia') || lowerMessage.includes('ayuda')) {
        return 'En caso de emergencia, contacta inmediatamente al guardia de seguridad llamando al +56 9 1234 5678 o usando el botón de llamada en la sección de contactos.';
    } else if (lowerMessage.includes('tiempo') || lowerMessage.includes('dura')) {
        return 'Tu visita tiene una duración autorizada de 4 horas. Puedes ver el tiempo restante en tu credencial digital. Si necesitas más tiempo, puedes solicitar una extensión.';
    } else if (lowerMessage.includes('normas') || lowerMessage.includes('reglas')) {
        return 'Las normas de convivencia incluyen: presentar identificación, respetar áreas restringidas, mantener silencio entre 22:00 y 07:00, y estacionar máximo 2 horas.';
    } else if (lowerMessage.includes('reserva') || lowerMessage.includes('próxima visita')) {
        return 'Puedes programar tu próxima visita en la sección "Reservar Próxima Visita". Allí puedes seleccionar fecha, horario y solicitar áreas especiales como sala de reuniones o terraza.';
    } else if (lowerMessage.includes('área') || lowerMessage.includes('sala')) {
        return 'Puedes solicitar áreas especiales como sala de reuniones, terraza privada o área de quincho en el formulario de reserva. Tu anfitrión deberá aprobar estas solicitudes.';
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('thank')) {
        return '¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?';
    } else {
        return 'Entiendo que preguntas sobre: "' + message + '". Como asistente virtual, puedo ayudarte con información sobre tu credencial, servicios del edificio, navegación, reservas futuras, normas de convivencia y contactos de emergencia. ¿En qué aspecto específico necesitas ayuda?';
    }
}

// Mostrar ayuda contextual por sección
function showSectionHelp(section) {
    const messages = {
        'credencial': 'Tu credencial digital contiene tu código QR de acceso e información sobre tu visita. Es válida por 4 horas y muestra las áreas a las que tienes acceso. Puedes descargar el QR para tenerlo en tu dispositivo.',
        'servicios': 'En esta sección encontrarás los servicios disponibles durante tu visita, como WiFi gratuito, estacionamiento y áreas comunes. Puedes copiar contraseñas y obtener direcciones.',
        'mapa': 'El mapa interactivo te ayuda a ubicarte en el edificio. Puedes cambiar entre pisos para ver las diferentes áreas y sus accesos.',
        'contactos': 'Aquí tienes los contactos importantes: seguridad, administración y tu anfitrión. En caso de emergencia, contacta a seguridad primero.',
        'normas': 'Estas son las normas de convivencia del edificio. Respetarlas asegura una experiencia agradable para todos los residentes y visitantes.',
        'reserva': 'En esta sección puedes programar tus próximas visitas, solicitar áreas especiales y ver el estado de tus reservas pendientes.'
    };
    
    addAssistantMessage(messages[section] || 'Puedo ayudarte con esta sección del dashboard. ¿Qué información específica necesitas?');
    
    if (!assistantActive) {
        toggleAssistant();
    }
}

// Generar código QR
function generateQRCode() {
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar tamaño del canvas
    canvas.width = 140;
    canvas.height = 140;
    
    // Generar un código QR simple (en un caso real usarías una librería)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 140, 140);
    
    ctx.fillStyle = '#000000';
    
    // Patrón simple de QR (simulado)
    const pattern = [
        [1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,1,0,1,1,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
        [1,1,0,1,1,1,0,1,1,0,0,1,1,1,0,1,0,0,1,0,0],
        [1,0,1,1,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0,1,1],
        [1,0,1,0,0,1,0,1,0,1,0,1,0,1,1,1,1,0,1,0,1],
        [0,1,1,0,1,1,1,0,1,0,1,1,0,0,0,0,1,0,1,1,0],
        [1,0,0,1,0,1,0,1,1,1,0,0,1,1,1,0,1,1,0,0,1],
        [0,0,0,0,0,0,0,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
        [1,1,1,1,1,1,1,0,1,0,0,1,0,1,0,1,0,1,0,0,1],
        [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,1,0,0,1,1,0],
        [1,0,1,1,1,0,1,0,1,0,0,1,0,1,1,0,1,0,0,1,1],
        [1,0,1,1,1,0,1,0,0,1,0,1,1,0,0,1,1,1,1,0,0],
        [1,0,1,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,1,1,1,0,1,1,0,1,0,1,0,1],
        [1,1,1,1,1,1,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0]
    ];
    
    const cellSize = 6;
    const offsetX = (canvas.width - pattern[0].length * cellSize) / 2;
    const offsetY = (canvas.height - pattern.length * cellSize) / 2;
    
    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
                ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Guardar referencia al código QR
    qrCode = canvas.toDataURL();
}

// Descargar código QR
function downloadQRCode() {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.download = 'buildingpro-qr-code.png';
    link.href = qrCode;
    link.click();
    
    showNotification('Código QR descargado correctamente');
}

// Actualizar display de tiempo
function updateTimeDisplay() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    timeElement.textContent = now.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    dateElement.textContent = now.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Iniciar contador de tiempo restante
function startTimeRemainingCounter() {
    function updateTimeRemaining() {
        const now = new Date();
        const diff = visitEndTime - now;
        
        if (diff <= 0) {
            document.getElementById('time-remaining').textContent = '00:00:00';
            document.querySelector('.status').textContent = 'Expirado';
            document.querySelector('.status').className = 'status unavailable';
            showNotification('Tu tiempo de visita ha expirado', 'warning');
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('time-remaining').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
        // Cambiar color cuando quede menos de 30 minutos
        if (hours === 0 && minutes < 30) {
            document.getElementById('time-remaining').style.color = '#e74c3c';
        }
    }
    
    updateTimeRemaining();
    setInterval(updateTimeRemaining, 1000);
}

// Iniciar actualizaciones en tiempo real
function startRealTimeUpdates() {
    // Actualizar hora cada segundo
    setInterval(updateTimeDisplay, 1000);
    
    // Simular cambios de estado de servicios
    setInterval(updateServiceStatus, 30000);
}

// Actualizar estado de servicios (simulado)
function updateServiceStatus() {
    const services = document.querySelectorAll('.service-card');
    
    services.forEach(service => {
        // Simular cambios aleatorios de disponibilidad (10% de probabilidad)
        if (Math.random() < 0.1 && !service.classList.contains('unavailable')) {
            const wasAvailable = service.classList.contains('available');
            service.classList.toggle('available');
            service.classList.toggle('unavailable');
            
            const statusElement = service.querySelector('.status');
            if (wasAvailable) {
                statusElement.textContent = 'No disponible';
                statusElement.className = 'status unavailable';
                showNotification(`Servicio ${service.querySelector('h4').textContent} no disponible temporalmente`, 'warning');
            } else {
                statusElement.textContent = 'Disponible';
                statusElement.className = 'status available';
                showNotification(`Servicio ${service.querySelector('h4').textContent} disponible nuevamente`);
            }
        }
    });
}

// Copiar texto al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar texto: ', err);
        showNotification('Error al copiar texto', 'error');
    });
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'error' ? 'fas fa-exclamation-circle' : 
                 type === 'warning' ? 'fas fa-exclamation-triangle' : 
                 'fas fa-check-circle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#00b894'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animación de salida después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Mostrar navegación a ubicación
function showNavigation(location) {
    const locations = {
        'parking': 'Para llegar al estacionamiento, dirígete a los ascensores y selecciona los niveles B1 o B2.',
        'rest-area': 'El área de descanso se encuentra en el piso 3. Toma el ascensor hasta el piso 3 y sigue las señales.'
    };
    
    addAssistantMessage(locations[location] || 'Te ayudo a encontrar tu destino. ¿A qué área específica necesitas dirigirte?');
    
    if (!assistantActive) {
        toggleAssistant();
    }
}

// Mostrar mapa del piso
function showFloorMap(floor) {
    const mapDisplay = document.getElementById('mapDisplay');
    const floorButtons = document.querySelectorAll('.floor-btn');
    
    // Actualizar botones activos
    floorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-floor') === floor) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar contenido del mapa (simulado)
    const floorInfo = {
        '1': 'Planta Baja: Recepción, Sala de espera, Baños visitantes, Acceso principal',
        '2': 'Piso 2: Áreas administrativas, Salas de reunión (acceso restringido)',
        '3': 'Piso 3: Área social, Sala de descanso, Terraza'
    };
    
    mapDisplay.innerHTML = `
        <div class="map-visual">
            <div class="floor-plan floor-${floor}">
                <div class="map-rooms">
                    ${generateFloorRooms(floor)}
                </div>
            </div>
        </div>
        <div class="floor-info">
            <h4>Piso ${floor}</h4>
            <p>${floorInfo[floor]}</p>
        </div>
    `;
    
    showNotification(`Mostrando mapa del Piso ${floor}`, 'info');
}

// Generar habitaciones del piso (simulado)
function generateFloorRooms(floor) {
    const rooms = {
        '1': `
            <div class="room reception allowed">Recepción</div>
            <div class="room waiting allowed">Sala Espera</div>
            <div class="room restroom allowed">Baños</div>
            <div class="room elevator allowed">Ascensores</div>
            <div class="room stairs allowed">Escaleras</div>
        `,
        '2': `
            <div class="room admin restricted">Admin</div>
            <div class="room meeting restricted">Reuniones</div>
            <div class="room elevator allowed">Ascensores</div>
            <div class="room stairs allowed">Escaleras</div>
        `,
        '3': `
            <div class="room social allowed">Social</div>
            <div class="room terrace allowed">Terraza</div>
            <div class="room kitchen allowed">Cocina</div>
            <div class="room elevator allowed">Ascensores</div>
            <div class="room stairs allowed">Escaleras</div>
        `
    };
    
    return rooms[floor] || '<p>Mapa no disponible para este piso</p>';
}

// Funciones de los botones de acción
function extendVisit() {
    addAssistantMessage('Para extender tu visita, necesitas que tu anfitrión autorice la extensión. ¿Quieres que le envíe una solicitud?');
    
    if (!assistantActive) {
        toggleAssistant();
    }
    
    // Simular solicitud de extensión
    setTimeout(() => {
        showNotification('Solicitud de extensión enviada a tu anfitrión');
    }, 2000);
}

function requestAssistance() {
    addAssistantMessage('¿En qué tipo de asistencia necesitas ayuda? Puedo contactar a seguridad, administración o a tu anfitrión.');
    
    if (!assistantActive) {
        toggleAssistant();
    }
}

function showReservationSection() {
    // Desplazar a la sección de reservas
    document.querySelector('.reservation-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    showNotification('Navegando a la sección de reservas');
}

function endVisit() {
    if (confirm('¿Estás seguro de que deseas finalizar tu visita? Esta acción no se puede deshacer.')) {
        showNotification('Visita finalizada. ¡Esperamos verte pronto!');
        
        // Redirigir a página de despedida después de 2 segundos
        setTimeout(() => {
            window.location.href = '/visit-end.html';
        }, 2000);
    }
}

// Funciones de contacto
function callSecurity() {
    showNotification('Llamando a seguridad...');
    // En una aplicación real, esto iniciaría una llamada telefónica
}

function callAdmin() {
    showNotification('Llamando a administración...');
    // En una aplicación real, esto iniciaría una llamada telefónica
}

function messageHost() {
    addAssistantMessage('¿Qué mensaje te gustaría enviar a tu anfitrión?');
    
    if (!assistantActive) {
        toggleAssistant();
    }
}

// Funciones de reserva
function submitReservation() {
    const date = document.getElementById('next-visit-date').value;
    const time = document.getElementById('visit-time').value;
    const purpose = document.getElementById('visit-purpose').value;
    const notes = document.getElementById('additional-notes').value;
    
    // Obtener áreas seleccionadas
    const selectedAreas = [];
    document.querySelectorAll('input[name="special-areas"]:checked').forEach(checkbox => {
        selectedAreas.push(checkbox.value);
    });
    
    if (!date) {
        showNotification('Por favor selecciona una fecha para tu visita', 'warning');
        return;
    }
    
    // Simular envío de reserva
    showNotification('Enviando solicitud de reserva...', 'info');
    
    setTimeout(() => {
        showNotification('¡Reserva enviada correctamente! Tu anfitrión será notificado y te confirmará pronto.');
        
        // Limpiar formulario
        document.getElementById('additional-notes').value = '';
        document.querySelectorAll('input[name="special-areas"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        addAssistantMessage('Tu solicitud de reserva ha sido enviada. Tu anfitrión recibirá una notificación y te confirmará la visita pronto.');
        
        if (!assistantActive) {
            toggleAssistant();
        }
    }, 2000);
}

function quickReservation() {
    // Establecer fecha para la próxima semana
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('next-visit-date').value = nextWeek.toISOString().split('T')[0];
    
    // Mantener mismo horario si es posible
    const currentTime = document.getElementById('visit-hours').textContent;
    if (currentTime.includes('14:00')) {
        document.getElementById('visit-time').value = '14:00-16:00';
    }
    
    showNotification('Formulario prellenado para la próxima semana');
    document.querySelector('.reservation-section').scrollIntoView({ behavior: 'smooth' });
}

function requestRecurringVisit() {
    addAssistantMessage('Las visitas recurrentes deben coordinarse directamente con tu anfitrión. ¿Te gustaría que le envíe una solicitud para visitas semanales?');
    
    if (!assistantActive) {
        toggleAssistant();
    }
}

// Funciones del modal de ayuda
function showHelp() {
    document.getElementById('helpModal').classList.add('active');
}

function closeHelp() {
    document.getElementById('helpModal').classList.remove('active');
}

// Cerrar modal al hacer clic fuera
document.getElementById('helpModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeHelp();
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeHelp();
        if (assistantActive) {
            toggleAssistant();
        }
    }
});