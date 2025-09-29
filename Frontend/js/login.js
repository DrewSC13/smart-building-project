document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const messageModal = document.getElementById('messageModal');
    const closeButtons = document.querySelectorAll('.close');
    const userRoleSelect = document.getElementById('userRole');
    const additionalFieldContainer = document.getElementById('additionalFieldContainer');
    const additionalFieldLabel = document.getElementById('additionalFieldLabel');
    const additionalField = document.getElementById('additionalField');
    const additionalFieldIcon = document.getElementById('additionalFieldIcon');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const captchaImage = document.getElementById('captchaImage');
    const captchaInput = document.getElementById('captchaInput');
    const captchaKey = document.getElementById('captchaKey');
    const refreshRecoveryCaptchaBtn = document.getElementById('refreshRecoveryCaptcha');
    const recoveryCaptchaImage = document.getElementById('recoveryCaptchaImage');
    const recoveryCaptchaInput = document.getElementById('recoveryCaptchaInput');
    const recoveryCaptchaKey = document.getElementById('recoveryCaptchaKey');

    // Elementos para mostrar intentos
    const attemptsContainer = document.createElement('div');
    attemptsContainer.id = 'attemptsContainer';
    attemptsContainer.style.cssText = 'margin: 15px 0; padding: 10px; border-radius: 5px; display: none;';
    loginForm.insertBefore(attemptsContainer, loginForm.querySelector('.remember-forgot'));

    const roleFieldMapping = {
        'administrador': {
            label: 'Clave de Administrador',
            placeholder: 'Ingresa tu clave de administrador',
            icon: 'bx bx-key'
        },
        'residente': {
            label: 'Número de Residente',
            placeholder: 'Ingresa tu número de residente',
            icon: 'bx bx-id-card'
        },
        'guardia': {
            label: 'ID de Guardia',
            placeholder: 'Ingresa tu ID de guardia',
            icon: 'bx bx-shield'
        },
        'tecnico': {
            label: 'Código de Técnico',
            placeholder: 'Ingresa tu código de técnico',
            icon: 'bx bx-wrench'
        },
        'visitante': {
            label: 'Código de Invitación',
            placeholder: 'Ingresa tu código de invitación',
            icon: 'bx bx-user-plus'
        }
    };

    // Cargar CAPTCHAs al iniciar
    loadCaptcha();
    loadRecoveryCaptcha();

    userRoleSelect.addEventListener('change', function() {
        const selectedRole = this.value;

        if (selectedRole && roleFieldMapping[selectedRole]) {
            const fieldConfig = roleFieldMapping[selectedRole];

            additionalFieldLabel.textContent = fieldConfig.label;
            additionalField.placeholder = fieldConfig.placeholder;
            additionalFieldIcon.className = fieldConfig.icon;
            additionalFieldContainer.style.display = 'block';
            additionalField.required = true;
        } else {
            additionalFieldContainer.style.display = 'none';
            additionalField.required = false;
            additionalField.value = '';
        }
    });

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        icon.classList.toggle('bx-hide');
        icon.classList.toggle('bx-show');
    });

    refreshCaptchaBtn.addEventListener('click', loadCaptcha);
    refreshRecoveryCaptchaBtn.addEventListener('click', loadRecoveryCaptcha);

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const userRole = document.getElementById('userRole').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const additionalFieldValue = document.getElementById('additionalField').value;
        const remember = document.getElementById('remember').checked;
        const captchaResponse = document.getElementById('captchaInput').value;
        const captchaKeyValue = document.getElementById('captchaKey').value;

        if (!userRole) {
            showMessage('Error', 'Por favor selecciona un tipo de usuario.');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (password.length < 6) {
            showMessage('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (!captchaResponse) {
            showMessage('Error', 'Por favor completa la verificación de seguridad (CAPTCHA).');
            return;
        }

        if (additionalFieldContainer.style.display === 'block') {
            if (!additionalFieldValue) {
                const fieldName = additionalFieldLabel.textContent;
                showMessage('Error', `Por favor ingresa tu ${fieldName.toLowerCase()}.`);
                return;
            }
        }

        await performLogin(userRole, email, password, additionalFieldValue, remember, captchaResponse, captchaKeyValue);
    });

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
        loadRecoveryCaptcha();
    });

    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('recoveryEmail').value;
        const captchaResponse = document.getElementById('recoveryCaptchaInput').value;
        const captchaKeyValue = document.getElementById('recoveryCaptchaKey').value;

        if (!validateEmail(email)) {
            showMessage('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!captchaResponse) {
            showMessage('Error', 'Por favor completa la verificación de seguridad (CAPTCHA).');
            return;
        }

        await performPasswordRecovery(email, captchaResponse, captchaKeyValue);
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
            messageModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
        if (e.target === messageModal) {
            messageModal.style.display = 'none';
        }
    });

    async function loadCaptcha() {
        try {
            console.log('🔄 Cargando CAPTCHA...');
            
            const response = await fetch('/api/captcha/');
            
            if (!response.ok) {
                throw new Error(`Error HTTP! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📄 Datos CAPTCHA recibidos:', data);

            if (data.captcha_image && data.captcha_key) {
                // Usar un timestamp para evitar caché
                const timestamp = new Date().getTime();
                const captchaImageUrl = `${data.captcha_image}?t=${timestamp}`;
                
                captchaImage.src = captchaImageUrl;
                captchaKey.value = data.captcha_key;
                captchaInput.value = '';
                
                console.log('🖼️ Intentando cargar imagen CAPTCHA:', captchaImageUrl);
                
                // Verificar que la imagen se carga
                return new Promise((resolve, reject) => {
                    captchaImage.onload = function() {
                        console.log('✅ Imagen CAPTCHA cargada correctamente');
                        resolve(true);
                    };
                    
                    captchaImage.onerror = function() {
                        console.error('❌ Error cargando imagen CAPTCHA');
                        reject(new Error('No se pudo cargar la imagen CAPTCHA'));
                    };
                    
                    // Timeout después de 5 segundos
                    setTimeout(() => {
                        if (!captchaImage.complete) {
                            reject(new Error('Timeout cargando CAPTCHA'));
                        }
                    }, 5000);
                });
                
            } else {
                throw new Error('Datos CAPTCHA incompletos');
            }
        } catch (error) {
            console.error('❌ Error cargando CAPTCHA:', error);
            showMessage('Error', 'No se pudo cargar la verificación de seguridad. Recargando...');
            
            // Reintentar después de 3 segundos
            setTimeout(loadCaptcha, 3000);
            return false;
        }
    }

    async function loadRecoveryCaptcha() {
        try {
            console.log('🔄 Cargando CAPTCHA de recuperación...');
            
            const response = await fetch('/api/captcha/');
            
            if (!response.ok) {
                throw new Error(`Error HTTP! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📄 Datos CAPTCHA recuperación recibidos:', data);

            if (data.captcha_image && data.captcha_key) {
                // Usar un timestamp para evitar caché
                const timestamp = new Date().getTime();
                const captchaImageUrl = `${data.captcha_image}?t=${timestamp}`;
                
                recoveryCaptchaImage.src = captchaImageUrl;
                recoveryCaptchaKey.value = data.captcha_key;
                recoveryCaptchaInput.value = '';
                
                console.log('🖼️ Intentando cargar imagen CAPTCHA recuperación:', captchaImageUrl);
                
                // Verificar que la imagen se carga
                return new Promise((resolve, reject) => {
                    recoveryCaptchaImage.onload = function() {
                        console.log('✅ Imagen CAPTCHA recuperación cargada correctamente');
                        resolve(true);
                    };
                    
                    recoveryCaptchaImage.onerror = function() {
                        console.error('❌ Error cargando imagen CAPTCHA recuperación');
                        reject(new Error('No se pudo cargar la imagen CAPTCHA'));
                    };
                    
                    // Timeout después de 5 segundos
                    setTimeout(() => {
                        if (!recoveryCaptchaImage.complete) {
                            reject(new Error('Timeout cargando CAPTCHA'));
                        }
                    }, 5000);
                });
                
            } else {
                throw new Error('Datos CAPTCHA incompletos');
            }
        } catch (error) {
            console.error('❌ Error cargando CAPTCHA recuperación:', error);
            showMessage('Error', 'No se pudo cargar la verificación de seguridad. Recargando...');
            
            // Reintentar después de 3 segundos
            setTimeout(loadRecoveryCaptcha, 3000);
            return false;
        }
    }

    // Modifica el event listener del refresh
    refreshCaptchaBtn.addEventListener('click', function() {
        console.log('🔄 Refrescando CAPTCHA...');
        loadCaptcha().then(success => {
            if (success) {
                console.log('✅ CAPTCHA refrescado exitosamente');
            }
        });
    });

    refreshRecoveryCaptchaBtn.addEventListener('click', function() {
        console.log('🔄 Refrescando CAPTCHA de recuperación...');
        loadRecoveryCaptcha().then(success => {
            if (success) {
                console.log('✅ CAPTCHA de recuperación refrescado exitosamente');
            }
        });
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(title, text) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        messageModal.style.display = 'flex';
    }

    function updateAttemptsDisplay(attempts, remaining, locked = false, minutes = 0) {
        if (locked) {
            attemptsContainer.style.display = 'block';
            attemptsContainer.style.background = '#ffebee';
            attemptsContainer.style.border = '1px solid #f44336';
            attemptsContainer.innerHTML = `
                <div style="color: #d32f2f; font-weight: bold;">
                    🔒 Cuenta bloqueada temporalmente
                </div>
                <div style="font-size: 14px; margin-top: 5px;">
                    Demasiados intentos fallidos. Espere ${minutes} minutos.
                </div>
            `;
        } else if (attempts > 0) {
            attemptsContainer.style.display = 'block';
            attemptsContainer.style.background = '#fff3cd';
            attemptsContainer.style.border = '1px solid #ffc107';
            attemptsContainer.innerHTML = `
                <div style="color: #856404; font-weight: bold;">
                    ⚠️ Intentos fallidos: ${attempts}/3
                </div>
                <div style="font-size: 14px; margin-top: 5px;">
                    Intentos restantes: ${remaining}
                </div>
            `;
        } else {
            attemptsContainer.style.display = 'none';
        }
    }

    async function performLogin(userRole, email, password, additionalField, remember, captchaResponse, captchaKeyValue) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;

        const formData = {
            email: email,
            password: password,
            role: userRole,
            captcha_response: captchaResponse,
            captcha_key: captchaKeyValue
        };

        if (additionalFieldContainer.style.display === 'block' && additionalField) {
            formData.role_code = additionalField;
        }

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('📄 Respuesta del login:', data);

            if (response.ok) {
                if (data.login_verification_required) {
                    console.log('📱 Verificación por WhatsApp requerida');
                    showWhatsAppVerificationModal(data.user_id, data.phone);
                } else if (data.login_token) {
                    console.log('🔑 Token recibido:', data.login_token);
                    attemptsContainer.style.display = 'none';
                    
                    // ✅ CORRECCIÓN: Guardar el token en localStorage y redirigir
                    localStorage.setItem('authToken', data.login_token);
                    localStorage.setItem('userRole', userRole);
                    localStorage.setItem('userEmail', email);
                    
                    redirectToDashboard(userRole);
                } else {
                    console.log('✅ Login exitoso sin token adicional');
                    attemptsContainer.style.display = 'none';
                    
                    // ✅ CORRECCIÓN: Crear token simple y guardarlo
                    const simpleToken = btoa(JSON.stringify({
                        email: email,
                        role: userRole,
                        timestamp: Date.now()
                    }));
                    localStorage.setItem('authToken', simpleToken);
                    localStorage.setItem('userRole', userRole);
                    localStorage.setItem('userEmail', email);
                    
                    redirectToDashboard(userRole);
                }
            } else {
                console.log('❌ Error en login:', data.error);
                if (data.attempts !== undefined) {
                    updateAttemptsDisplay(
                        data.attempts,
                        data.remaining_attempts,
                        data.locked,
                        data.minutes_remaining
                    );
                }

                showMessage('Error', data.error || 'Error en el login');
                loadCaptcha();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
            loadCaptcha();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async function verifyLoginToken(token) {
        try {
            if (!token || token === 'undefined') {
                showMessage('Error', 'Token de login inválido');
                return;
            }

            const response = await fetch(`/api/verify-login/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('✅ Login Exitoso', 'Redirigiendo al dashboard...');
                if (data.user) {
                    // ✅ CORRECCIÓN: Guardar en localStorage
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userEmail', data.user.email);
                    
                    redirectToDashboard(data.user.role);
                } else {
                    // ✅ CORRECCIÓN: Guardar en localStorage
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userRole', 'residente');
                    
                    redirectToDashboard('residente');
                }
            } else {
                showMessage('Error', data.error || 'Error en la verificación del token');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
        }
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

    async function performPasswordRecovery(email, captchaResponse, captchaKeyValue) {
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/password-reset-request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    email: email,
                    captcha_response: captchaResponse,
                    captcha_key: captchaKeyValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('✅ Token Enviado', `Token de recuperación enviado a ${email}`);
                forgotPasswordModal.style.display = 'none';
                document.getElementById('recoveryEmail').value = '';
                recoveryCaptchaInput.value = '';
                loadRecoveryCaptcha();
            } else {
                showMessage('Error', data.error || 'Error al enviar el token');
                loadRecoveryCaptcha();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
            loadRecoveryCaptcha();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    function redirectToDashboard(role) {
        console.log(`🎯 Redirigiendo al dashboard de: ${role}`);
        
        // ✅ CORRECCIÓN CRÍTICA: Usar las URLs de Django
        const dashboardMap = {
            'administrador': '/api/dashboard-admin/',
            'residente': '/api/dashboard-residente/',
            'guardia': '/api/dashboard-guardia/',
            'tecnico': '/api/dashboard-tecnico/',
            'visitante': '/api/dashboard-visitante/'
        };

        let dashboardUrl = dashboardMap[role] || '/api/dashboard-residente/';
        
        console.log(`🚀 Redirigiendo a: ${dashboardUrl}`);
        
        // Redirigir a la URL de Django
        window.location.href = dashboardUrl;
    }

    // Funciones de WhatsApp
    async function showWhatsAppVerificationModal(userId, phoneMasked) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>📱 Verificación por WhatsApp</h2>
                <p>Se ha enviado un código de verificación al teléfono terminado en ${phoneMasked}</p>

                <form id="whatsappVerificationForm">
                    <div class="form-group">
                        <label for="verificationCode">Código de Verificación</label>
                        <div class="input-with-icon">
                            <input type="text" id="verificationCode" class="form-control"
                                   placeholder="Ingresa el código de 6 dígitos" maxlength="6" required>
                            <i class='bx bx-message-square-dots'></i>
                        </div>
                        <small class="form-text">El código es válido por 5 minutos</small>
                    </div>

                    <button type="submit" class="btn">Verificar Código</button>
                    <button type="button" id="resendWhatsAppBtn" class="btn btn-secondary">Reenviar Código</button>
                </form>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .btn-secondary {
                background: var(--secondary) !important;
                color: var(--text) !important;
                margin-top: 10px;
                border: 1px solid var(--accent);
            }
            .btn-secondary:hover {
                background: var(--accent) !important;
                color: var(--primary) !important;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.remove();

        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        const verificationForm = modal.querySelector('#whatsappVerificationForm');
        verificationForm.onsubmit = async (e) => {
            e.preventDefault();
            await verifyWhatsAppCode(userId, modal);
        };

        const resendBtn = modal.querySelector('#resendWhatsAppBtn');
        resendBtn.onclick = async () => {
            await resendWhatsAppCode(userId, modal);
        };

        setTimeout(() => {
            modal.querySelector('#verificationCode').focus();
        }, 100);
    }

    async function verifyWhatsAppCode(userId, modal) {
        const codeInput = modal.querySelector('#verificationCode');
        const code = codeInput.value.trim();

        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            showMessage('Error', 'Por favor ingresa un código válido de 6 dígitos.');
            return;
        }

        const submitBtn = modal.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verificando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/verify-login-code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    user_id: userId,
                    verification_code: code
                })
            });

            const data = await response.json();

            if (response.ok) {
                modal.remove();
                showMessage('✅ Verificación Exitosa', 'Redirigiendo al dashboard...');
                
                // ✅ CORRECCIÓN: Guardar en localStorage
                if (data.user) {
                    localStorage.setItem('authToken', data.login_token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userEmail', data.user.email);
                    redirectToDashboard(data.user.role);
                } else {
                    localStorage.setItem('authToken', data.login_token);
                    localStorage.setItem('userRole', 'residente');
                    redirectToDashboard('residente');
                }
            } else {
                showMessage('Error', data.error || 'Código de verificación incorrecto');
                codeInput.value = '';
                codeInput.focus();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async function resendWhatsAppCode(userId, modal) {
        const resendBtn = modal.querySelector('#resendWhatsAppBtn');
        const originalText = resendBtn.textContent;
        resendBtn.textContent = 'Enviando...';
        resendBtn.disabled = true;

        try {
            const response = await fetch('/api/resend-login-code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ user_id: userId })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('✅ Código Reenviado', data.message || 'Se ha enviado un nuevo código');
            } else {
                showMessage('Error', data.error || 'Error al reenviar el código');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
        } finally {
            resendBtn.textContent = originalText;
            resendBtn.disabled = false;
        }
    }

    // Función para manejar redirección desde parámetros de URL
    function handleUrlRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            verifyLoginToken(token);
        }
    }

    // Verificar si hay token en la URL al cargar la página
    handleUrlRedirect();

    // Función para guardar datos de sesión
    function saveSessionData(userData) {
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
        }
    }

    // Función para cargar datos de sesión
    function loadSessionData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    // Función para limpiar datos de sesión
    function clearSessionData() {
        localStorage.removeItem('user_data');
    }

    // Verificar si hay sesión activa al cargar la página
    const savedUserData = loadSessionData();
    if (savedUserData && savedUserData.role) {
        // Si hay sesión guardada, redirigir al dashboard correspondiente
        redirectToDashboard(savedUserData.role);
    }
});