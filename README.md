Smart Building Project / BuildingPRO

Proyecto INF 281
Sistema web completo para la administración inteligente de edificios multifamiliares y corporativos.

Versión actual: Alpha 1.5 (login / register + 2FA)
Licencia: MIT

Tabla de contenidos

Visión general

Características implementadas

Arquitectura / estructura del proyecto

Tecnologías utilizadas

Prerrequisitos

Instalación y configuración

6.1 Clonar repositorio

6.2 Configurar entorno virtual

6.3 Instalar dependencias

6.4 Variables de entorno

6.5 Migraciones y superusuario

Ejecución del proyecto

7.1 Linux / macOS

7.2 Windows

Endpoints y URLs de acceso

Roles, flujo de autenticación y seguridad

Comandos útiles

Roadmap / próximas mejoras

Contribuciones y soporte

Autores

Visión general

BuildingPRO (smart-building-project) es un sistema para gestionar integralmente edificios con módulos de autenticación, registro, control de acceso, administración de residentes, mantenimiento, finanzas, etc. En esta fase Alpha 1.5, ya cuenta con registro/login con 2FA vía WhatsApp, bloqueo por fuerza bruta, validación de fuerza de contraseñas, entre otros mecanismos de seguridad.

Características implementadas (hasta la versión actual)

Registro de usuarios con verificación por correo electrónico

Inicio de sesión con autenticación de dos factores (2FA) vía WhatsApp

Validación visual de contraseña (en tiempo real)

Restricción por número de intentos fallidos + bloqueo temporal

Protección mediante rate limiting (por IP / por email)

Hash seguro de contraseñas con BCrypt

Integración con Twilio para envío de mensajes WhatsApp

Capacidad de verificación de número telefónico

Middleware personalizado para protección de rutas sensibles

API REST para funciones backend

Interfaz frontend (HTML / CSS / JS) con diseño responsivo usando Bootstrap + Boxicons

Soporte para paneles futuros / módulo de dashboard

Arquitectura / estructura del proyecto

La estructura general es:

smart-building-project/
├── Backend/
│   ├── authentication/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── middleware.py
│   │   ├── whatsapp_service.py
│   │   └── urls.py
│   ├── buildingpro/
│   │   ├── settings.py
│   │   └── urls.py
│   └── manage.py
├── Frontend/
│   ├── css/
│   │   ├── login.css
│   │   └── register.css
│   ├── js/
│   │   ├── login.js
│   │   └── register.js
│   ├── img/
│   │   └── Logo.png
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── reset-password.html
├── requirements.txt
└── .gitignore


Backend: aplicación Django + Django REST Framework. Aquí están los modelos, vistas, serializers, middleware, lógica de 2FA, etc.

Frontend: archivos estáticos (HTML, CSS, JS) que consumen la API REST del backend.

requirements.txt: dependencias Python del backend.

Tecnologías utilizadas

Python 3.8+ / ideal 3.12

Django (versión usada)

Django REST Framework

BCrypt para hashing de contraseñas

Twilio API para WhatsApp

Bootstrap 5, Boxicons para el frontend

JavaScript (vanilla) para lógica del frontend

SQLite3 como base de datos de desarrollo

Middleware personalizado para protección y seguridad

Prerrequisitos

Antes de instalar, asegúrate de tener:

Git

Python (versión 3.8 o superior)

pip

(Opcional pero recomendado) virtualenv / entorno virtual

Cuenta en Twilio, para obtener credenciales de WhatsApp

(Opcional) cuenta de correo electrónico configurada para envíos (Gmail u otro)

Instalación y configuración
6.1 Clonar repositorio
git clone https://github.com/DrewSC13/smart-building-project.git
cd smart-building-project

6.2 Configurar entorno virtual

En Linux / macOS:

python3 -m venv venv
source venv/bin/activate


En Windows (PowerShell / CMD):

python -m venv venv
venv\Scripts\activate

6.3 Instalar dependencias
cd Backend
pip install -r requirements.txt

6.4 Variables de entorno

Duplica el archivo de ejemplo .env.example (o crea .env) en el directorio Backend con la configuración adecuada:

SECRET_KEY=tu_clave_secreta
DEBUG=True

EMAIL_HOST_USER=tu_email@gmail.com
EMAIL_HOST_PASSWORD=tu_contraseña_aplicación

TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886


Asegúrate de llenar esos campos con tus credenciales reales.

6.5 Migraciones y superusuario
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser


Sigue los pasos para crear el usuario administrador.

Ejecución del proyecto
7.1 En Linux / macOS

Desde la carpeta Backend, con el entorno virtual activado:

python manage.py runserver 0.0.0.0:8000


Esto iniciará el servidor en http://localhost:8000 (y accesible desde otras máquinas en la misma red si usas la IP del host).

7.2 En Windows

En la carpeta Backend, activando el entorno virtual:

python manage.py runserver 0.0.0.0:8000


El resultado es el mismo: servidor Django corriendo en el puerto 8000.

Endpoints y URLs de acceso
Servicio / ruta	Descripción
http://localhost:8000/	Página principal / frontend (login)
http://localhost:8000/login/	Formulario de inicio de sesión
http://localhost:8000/register/	Formulario de registro
http://localhost:8000/reset-password/	Recuperación de contraseña
http://localhost:8000/api/	Base de la API REST
http://localhost:8000/admin/	Panel administrativo Django

Si accedes desde otra máquina en la red, reemplaza localhost por la IP del servidor (por ejemplo 192.168.x.x:8000).

Roles, flujo de autenticación y seguridad
Roles del sistema

Administrador: acceso completo al sistema

Residente: gestión de su unidad, consultas

Guardia de seguridad: control de accesos

Personal de mantenimiento: gestión técnica

Visitante: acceso temporal mediante invitación

Flujo de autenticación y seguridad

Registro de usuario

Usuario envía email + datos

Se envía token de verificación por email

Verificación de cuenta vía link/token

Login con 2FA

Usuario proporciona email y contraseña

Si es correcto, se envía código 2FA por WhatsApp

Usuario ingresa el código para completar el login

Recuperación de contraseña

Usuario solicita cambio mediante email

Se genera token de reset

Usuario establece nueva contraseña

Protecciones adicionales

Bloqueo después de 3 intentos fallidos (15 minutos de bloqueo)

Rate limiting por IP / email

Validación de fortaleza de contraseña (longitud, mayúsculas, minúsculas, números, caracteres especiales)

Hashing con BCrypt

Middleware para rutas sensibles

Expiración de tokens / códigos de seguridad

Comandos útiles
# Ejecutar tests
python manage.py test

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recoger archivos estáticos (production)
python manage.py collectstatic

Roadmap / próximas mejoras

Implementar dashboards personalizados por rol

Módulo de gestión de residentes / visitantes

Control de accesos físicos (hardware / IoT)

Módulo de finanzas / pagos

Sistema de tickets de mantenimiento

Notificaciones en tiempo real

Integración con APIs externas, analítica y machine learning

Versión móvil / app híbrida