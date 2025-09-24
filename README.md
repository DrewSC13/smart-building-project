🏢 Sistema de Administración de Edificio Inteligente - BuildingPRO

📋 Descripción
Sistema web completo para la administración inteligente de edificios multifamiliares y corporativos. Incluye módulos de seguridad, gestión de residentes, control de accesos y sistema de autenticación robusto con verificación en dos pasos.

🚀 Estado del Proyecto
✅ FASE DE LOGIN/REGISTER COMPLETADA - Versión Alpha 1.5

✅ COMPLETADO
* Estructura completa del proyecto (Backend + Frontend)

* Backend Django con API REST y Django REST Framework

* Frontend HTML/CSS/JS con diseño responsive

* Base de datos SQLite3 con modelos completos

* Sistema de autenticación seguro con roles de usuario

* Autenticación de dos factores (2FA) vía WhatsApp

* Validación en tiempo real de fortaleza de contraseñas

* Verificación de números telefónicos por WhatsApp

* Protección contra fuerza bruta (3 intentos + bloqueo 15min)

* Hashing BCrypt para contraseñas con transparencia

* Verificación CAPTCHA en todos los formularios

* Sistema de tokens con expiración (login y reset)

* Emails de verificación con información de seguridad

* Interfaz moderna con efectos futuristas

* Integración Twilio para envío de WhatsApp

🚧 EN DESARROLLO
* Dashboards administrativos por rol

* Gestión de residentes y visitantes

* Sistema de control de accesos

* Módulo de finanzas y pagos

* Sistema de tickets de mantenimiento

* Notificaciones en tiempo real

* Integración con dispositivos IoT

🛠️ Tecnologías Implementadas
Backend
Python 3.12 + Django 5.2.6

Django REST Framework para APIs

BCrypt para hashing seguro de contraseñas

Django Captcha para protección contra bots

Twilio API para envío de WhatsApp

SQLite3 (base de datos de desarrollo)

Frontend
HTML5, CSS3, JavaScript vanilla

Bootstrap 5 para componentes UI

Boxicons para iconografía moderna

Diseño responsive para PC y móviles

Seguridad
✅ BCrypt con salt para contraseñas

✅ Autenticación de dos factores (2FA) por WhatsApp

✅ Validación visual de fortaleza de contraseñas

✅ Verificación de números telefónicos

✅ Bloqueo automático después de 3 intentos fallidos

✅ Rate limiting por IP y email

✅ Tokens expirables (15min login, 1h reset)

✅ Validación de fortaleza de contraseñas

✅ Verificación CAPTCHA en todos los forms

✅ Middleware personalizado para protección

🐧 Instalación y Configuración
Prerrequisitos

# Verificar instalaciones
python --version  # 3.8+
pip --version
git --version
📦 Instalación Manual

# 1. Clonar repositorio
git clone https://github.com/DrewSC13/smart-building-project.git
cd smart-building-project

# 2. Configurar entorno virtual
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

# 3. Instalar dependencias
cd Backend
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 5. Aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# 6. Crear superusuario (opcional)
python manage.py createsuperuser
🚀 Ejecución de la Aplicación
bash
# Terminal 1 - Backend (Django)
cd Backend
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
python manage.py runserver 0.0.0.0:8000
🔧 Configuración de Variables de Entorno
Crear archivo Backend/.env con:

# Email Configuration (Gmail)
EMAIL_HOST_USER=tu_email@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicación

# Django Security
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=True

# Twilio Configuration
TWILIO_ACCOUNT_SID=TU_TWILIO_ACCOUNT_SID_AQUI
TWILIO_AUTH_TOKEN=TU_TWILIO_AUTH_TOKEN_AQUI
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
📊 URLs de Acceso
🖥️ Desde PC - Desarrollo Local
Servicio	URL	Descripción
Frontend Web	http://localhost:8000	Aplicación principal
Login	http://localhost:8000/login/	Página de inicio de sesión
Registro	http://localhost:8000/register/	Página de registro
API REST	http://localhost:8000/api/	Endpoints JSON
Admin Django	http://localhost:8000/admin/	Panel administrativo
📱 Desde Celular (Misma Red)
Servicio	URL	Requisito
Frontend Web	http://[IP-PC]:8000	Misma red WiFi
API REST	http://[IP-PC]:8000/api/	Misma red WiFi
Reemplazar [IP-PC] con la IP de tu computadora:

Linux: hostname -I

Windows: ipconfig

👥 Roles del Sistema
🔐 Roles Implementados
👨‍💼 Administrador - Acceso completo al sistema

👨‍👩‍👧 Residente - Habitantes del edificio

🛡️ Guardia de Seguridad - Control de accesos

🔧 Personal de Mantenimiento - Gestión técnica

👤 Visitante - Acceso temporal con invitación

🎯 Permisos por Rol
Registro: Todos los roles con verificación por email

Login: Verificación de credenciales + código de rol + 2FA

Dashboard: Próxima implementación por rol

🔐 Flujos de Autenticación Implementados
1. 📝 Registro de Usuario
text
Email → Validación → Envío token → Verificación → Cuenta activa
2. 🔑 Inicio de Sesión con 2FA
text
Credenciales → Verificación → WhatsApp 2FA → Código → Acceso
3. 🔓 Recuperación de Contraseña
text
Email → Token → Identificación → Nueva contraseña
🛡️ Características de Seguridad Mejoradas
🔒 Nivel Empresarial Implementado
BCrypt Hashing: $2b$12$9dc9xfcRdIoIh9KbG1WwWujz4Ui0axpPvRKyJpip2NjqB47ZCrrge

2FA por WhatsApp: Códigos de 6 dígitos con expiración

Validación Visual: Indicadores en tiempo real de contraseñas

Protección Fuerza Bruta: 3 intentos → bloqueo 15min

Rate Limiting: Límite por IP y email

Tokens Desechables: Expiración automática

Validación Contraseñas: 8+ chars, números, mayúsculas, minúsculas, caracteres especiales

Transparencia: Hash visible en emails para confianza

📱 Sistema de Verificación por WhatsApp
Códigos 2FA: Envío automático al iniciar sesión

Verificación Telefónica: Validación de números en registro

Reenvío de códigos: En caso de no recepción

Expiración: Códigos válidos por 5 minutos

🔐 Validación de Contraseñas en Tiempo Real
Indicadores visuales para cada requisito

Barra de progreso de fortaleza

Validación inmediata mientras se escribe

Feedback visual (rojo/verde) para cada criterio

📧 Sistema de Emails Seguros
Verificación de Cuenta: Con hash BCrypt visible

Tokens de Acceso: Instrucciones claras + seguridad

Recuperación: Verificación de identidad robusta

Confirmaciones: Notificación de actividades

🎨 Interfaz de Usuario Mejorada
✨ Diseño Moderno con 2FA
Estilo futurista con efectos de fondo animados

Modales interactivos para verificación 2FA

Indicadores visuales de fortaleza de contraseñas

Responsive design para PC, tablet y móvil

Formularios intuitivos con validación en tiempo real

📱 Experiencia de Usuario Mejorada
Verificación 2FA integrada en el flujo de login

Contador de intentos visible en login

Mensajes de error descriptivos y útiles

Modales informativos para códigos de verificación

Navegación fluida entre secciones

Feedback inmediato en validación de contraseñas

📁 Estructura del Proyecto Actualizada
text
smart-building-project/
├── 📁 Backend/
│   ├── 📁 authentication/
│   │   ├── models.py          # Modelos: User, Tokens, Attempts, 2FA
│   │   ├── views.py           # Lógica auth + seguridad + 2FA
│   │   ├── serializers.py     # Validación APIs + validación contraseñas
│   │   ├── middleware.py      # Protección fuerza bruta
│   │   ├── whatsapp_service.py # Integración Twilio WhatsApp
│   │   └── urls.py           # Endpoints auth + 2FA
│   ├── 📁 buildingpro/
│   │   ├── settings.py        # Configuración Django + Twilio
│   │   └── urls.py           # URLs principales
│   └── manage.py
├── 📁 Frontend/
│   ├── 📁 css/
│   │   ├── login.css         # Estilos modernos login + 2FA
│   │   └── register.css      # Estilos registro + validación
│   ├── 📁 js/
│   │   ├── login.js          # Lógica frontend login + 2FA
│   │   └── register.js       # Lógica registro + validación contraseñas
│   ├── 📁 img/
│   │   └── Logo.png          # Logo BuildingPRO
│   ├── login.html           # Página login con 2FA
│   ├── register.html        # Página registro con validación
│   ├── dashboard.html       # Dashboard (próximo)
│   └── reset-password.html  # Recuperación contraseña
└── requirements.txt         # Dependencias Python + Twilio
🚀 Nuevas Features Implementadas
🔐 Autenticación de Dos Factores (2FA)
Integración Twilio para envío de WhatsApp

Códigos de 6 dígitos con expiración de 5 minutos

Reenvío automático en caso de no recepción

Interfaz modal integrada en el flujo de login

🔒 Validación de Fortaleza de Contraseñas
Indicadores visuales en tiempo real

Validación de 5 criterios: longitud, mayúsculas, minúsculas, números, caracteres especiales

Barra de progreso de seguridad

Feedback inmediato durante la escritura

📱 Verificación de Números Telefónicos
Integración WhatsApp para verificación

Validación internacional de números

Sistema de códigos de verificación

Flujo integrado en registro y login

👨‍💻 Desarrollo
🛠️ Comandos Útiles

# Ejecutar tests
python manage.py test

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones  
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Colectar archivos estáticos
python manage.py collectstatic
📝 Estructura de Commits

feat:     Nueva funcionalidad (2FA, validación contraseñas, etc.)
fix:      Corrección de bugs
docs:     Documentación
style:    Mejoras de formato
refactor: Refactorización de código
security: Mejoras de seguridad

🔧 Configuración Twilio
Crear cuenta en Twilio

Obtener Account SID y Auth Token

Configurar WhatsApp Sandbox

Agregar credenciales al archivo .env

📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

🤝 Soporte y Contacto
Para soporte técnico o contribuciones:

📧 Email: drewsc13@gmail.com

📱 GitHub: @DrewSC13

🐛 Issues: Reportar problemas

💬 Discusiones: GitHub Discussions

Desarrollado por Claudio Andrew - Sistema BuildingPRO v1.5 🏢🔐📱

🔮 Roadmap Futuro
Alpha 2.0: Dashboards por rol y gestión de usuarios

Beta 1.0: Sistema de pagos y control de accesos

v1.0: App móvil e integración IoT

v2.0: Analytics avanzados y machine learning

¡Sistema de autenticación empresarial completamente funcional con 2FA, validación de seguridad avanzada y verificación telefónica integrada! 🚀