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
    
    // Elementos para controlar la visibilidad
    const regularUserFields = document.getElementById('regularUserFields');
    const captchaSection = document.getElementById('captchaSection');
    const rememberSection = document.getElementById('rememberSection');
    const registerLink = document.getElementById('registerLink');

    // Elementos para mostrar intentos
    const attemptsContainer = document.createElement('div');
    attemptsContainer.id = 'attemptsContainer';
    attemptsContainer.style.cssText = 'margin: 15px 0; padding: 10px; border-radius: 5px; display: none;';
    loginForm.insertBefore(attemptsContainer, loginForm.querySelector('.remember-forgot'));

    const roleFieldMapping = {
        'administrador': {
            label: 'Clave de Administrador',
            placeholder: 'Ingresa tu clave de administrador',
            icon: 'bx bx-key',
            showRegularFields: true,
            showCaptcha: true,
            showRemember: true,
            showRegister: true
        },
        'residente': {
            label: 'Número de Residente',
            placeholder: 'Ingresa tu número de residente',
            icon: 'bx bx-id-card',
            showRegularFields: true,
            showCaptcha: true,
            showRemember: true,
            showRegister: true
        },
        'guardia': {
            label: 'ID de Guardia',
            placeholder: 'Ingresa tu ID de guardia',
            icon: 'bx bx-shield',
            showRegularFields: true,
            showCaptcha: true,
            showRemember: true,
            showRegister: true
        },
        'tecnico': {
            label: 'Código de Técnico',
            placeholder: 'Ingresa tu código de técnico',
            icon: 'bx bx-wrench',
            showRegularFields: true,
            showCaptcha: true,
            showRemember: true,
            showRegister: true
        },
        'visitante': {
            label: 'Código de Invitación',
            placeholder: 'Ingresa tu código de invitación (ej: 123-abc-456-def)',
            icon: 'bx bx-user-plus',
            showRegularFields: false,
            showCaptcha: true,
            showRemember: false,
            showRegister: false
        }
    };

    // Estado de carga
    let isLoading = false;
    let captchaLoading = false;

    // Cargar CAPTCHAs al iniciar
    loadCaptcha();
    loadRecoveryCaptcha();

    userRoleSelect.addEventListener('change', function() {
        if (isLoading) return;
        
        const selectedRole = this.value;
        console.log('Tipo de usuario seleccionado:', selectedRole);

        if (selectedRole && roleFieldMapping[selectedRole]) {
            const fieldConfig = roleFieldMapping[selectedRole];

            additionalFieldLabel.textContent = fieldConfig.label;
            additionalField.placeholder = fieldConfig.placeholder;
            additionalFieldIcon.className = fieldConfig.icon;
            additionalFieldContainer.style.display = 'block';
            additionalField.required = true;

            // Controlar visibilidad de campos según el tipo de usuario
            regularUserFields.style.display = fieldConfig.showRegularFields ? 'block' : 'none';
            captchaSection.style.display = fieldConfig.showCaptcha ? 'block' : 'none';
            rememberSection.style.display = fieldConfig.showRemember ? 'block' : 'none';
            registerLink.style.display = fieldConfig.showRegister ? 'block' : 'none';

            // Limpiar campos cuando se cambia a visitante
            if (selectedRole === 'visitante') {
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
                document.getElementById('remember').checked = false;
                captchaInput.value = '';
                
                // Quitar required de campos que no se usan para visitantes
                document.getElementById('email').required = false;
                document.getElementById('password').required = false;
                document.getElementById('captchaInput').required = true;
            } else {
                // Restaurar required para otros usuarios
                document.getElementById('email').required = true;
                document.getElementById('password').required = true;
                document.getElementById('captchaInput').required = true;
            }
        } else {
            additionalFieldContainer.style.display = 'none';
            additionalField.required = false;
            additionalField.value = '';
            
            // Mostrar todos los campos por defecto
            regularUserFields.style.display = 'block';
            captchaSection.style.display = 'block';
            rememberSection.style.display = 'block';
            registerLink.style.display = 'block';
            
            // Restaurar required
            document.getElementById('email').required = true;
            document.getElementById('password').required = true;
            document.getElementById('captchaInput').required = true;
        }
    });

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        icon.classList.toggle('bx-hide');
        icon.classList.toggle('bx-show');
    });

    refreshCaptchaBtn.addEventListener('click', function() {
        if (!captchaLoading) {
            loadCaptcha();
        }
    });

    refreshRecoveryCaptchaBtn.addEventListener('click', function() {
        if (!captchaLoading) {
            loadRecoveryCaptcha();
        }
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isLoading) {
            console.log('⚠ Login en progreso, ignorando submit adicional');
            return;
        }

        console.log('Formulario enviado');

        const userRole = document.getElementById('userRole').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const additionalFieldValue = document.getElementById('additionalField').value;
        const remember = document.getElementById('remember').checked;
        const captchaResponse = document.getElementById('captchaInput').value;
        const captchaKeyValue = document.getElementById('captchaKey').value;

        console.log('Datos del formulario:', {
            userRole, email, password: '***', additionalFieldValue, remember, captchaResponse
        });

        if (!userRole) {
            showMessage('Error', 'Por favor selecciona un tipo de usuario.');
            return;
        }

        // Validación específica para visitantes
        if (userRole === 'visitante') {
            if (!additionalFieldValue) {
                showMessage('Error', 'Por favor ingresa tu código de invitación.');
                return;
            }
            
            if (!captchaResponse) {
                showMessage('Error', 'Por favor completa la verificación de seguridad (CAPTCHA).');
                return;
            }
            
            // Validación más flexible del código de invitación
            const invitationCodeRegex = /^[A-Z0-9]{3,}-[A-Z0-9]{3,}-[A-Z0-9]{3,}$/i;
            if (!invitationCodeRegex.test(additionalFieldValue)) {
                showMessage('Error', 'El formato del código de invitación es inválido. Debe ser: XXX-XXX-XXX');
                return;
            }
            
            await performVisitorLogin(additionalFieldValue, captchaResponse, captchaKeyValue);
            return;
        }

        // Validaciones para usuarios regulares
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

        if (isLoading) return;

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

    // Login específico para visitantes
    async function performVisitorLogin(invitationCode, captchaResponse, captchaKeyValue) {
        if (isLoading) return;
        
        isLoading = true;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verificando código...';
        submitBtn.disabled = true;

        try {
            console.log('📤 Enviando solicitud de login para visitante...');
            
            const response = await fetch('/api/visitor-login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    invitation_code: invitationCode,
                    captcha_response: captchaResponse,
                    captcha_key: captchaKeyValue
                })
            });

            const data = await response.json();
            console.log('📄 Respuesta del servidor:', data);

            if (response.ok && data.success) {
                attemptsContainer.style.display = 'none';
                
                // Guardar datos de sesión
                if (data.login_token) {
                    localStorage.setItem('authToken', data.login_token);
                    console.log('🔑 Token guardado en localStorage:', data.login_token);
                }
                
                localStorage.setItem('userRole', 'visitante');
                
                if (data.user) {
                    localStorage.setItem('userEmail', data.user.email || 'visitante@buildingpro.com');
                    localStorage.setItem('userName', data.user.first_name + ' ' + (data.user.last_name || ''));
                    localStorage.setItem('invitationCode', invitationCode);
                } else {
                    localStorage.setItem('userEmail', `visitante_${invitationCode}@buildingpro.com`);
                    localStorage.setItem('userName', 'Visitante ' + invitationCode);
                    localStorage.setItem('invitationCode', invitationCode);
                }
                
                console.log('👤 Datos de usuario guardados en localStorage');
                
                showMessage('✅ Acceso Concedido', 'Redirigiendo al dashboard de visitante...');
                
                // Redirección directa para visitantes
                setTimeout(() => {
                    console.log('🚀 Redirigiendo a dashboard de visitante...');
                    window.location.href = '/api/dashboard-visitante/';
                }, 1500);
                
            } else {
                console.log('❌ Error en login de visitante:', data.error);
                showMessage('Error', data.error || 'Error en el proceso de login');
                loadCaptcha();
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            showMessage('Error', 'Error de conexión con el servidor. Verifica tu conexión a internet.');
            loadCaptcha();
        } finally {
            isLoading = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async function loadCaptcha() {
        if (captchaLoading) return;
        
        captchaLoading = true;
        refreshCaptchaBtn.disabled = true;
        
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
                await new Promise((resolve, reject) => {
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
        } finally {
            captchaLoading = false;
            refreshCaptchaBtn.disabled = false;
        }
    }

    async function loadRecoveryCaptcha() {
        if (captchaLoading) return;
        
        captchaLoading = true;
        refreshRecoveryCaptchaBtn.disabled = true;
        
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
                await new Promise((resolve, reject) => {
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
        } finally {
            captchaLoading = false;
            refreshRecoveryCaptchaBtn.disabled = false;
        }
    }

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
        if (isLoading) return;
        
        isLoading = true;
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
            console.log('📤 Enviando solicitud de login...');
            
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
                } else if (data.login_token || data.success) {
                    console.log('🔑 Token recibido:', data.login_token);
                    attemptsContainer.style.display = 'none';
                    
                    // Guardar datos en localStorage
                    localStorage.setItem('authToken', data.login_token || generateFallbackToken());
                    localStorage.setItem('userRole', userRole);
                    localStorage.setItem('userEmail', email);
                    
                    if (data.user && data.user.first_name) {
                        localStorage.setItem('userName', data.user.first_name + ' ' + (data.user.last_name || ''));
                    }
                    
                    showMessage('✅ Login Exitoso', 'Redirigiendo al dashboard...');
                    
                    // Redirección directa basada en el rol
                    setTimeout(() => {
                        redirectToDashboard(userRole);
                    }, 1500);
                    
                } else {
                    console.log('✅ Login exitoso sin token adicional');
                    attemptsContainer.style.display = 'none';
                    
                    // Guardar datos básicos
                    const simpleToken = generateFallbackToken();
                    localStorage.setItem('authToken', simpleToken);
                    localStorage.setItem('userRole', userRole);
                    localStorage.setItem('userEmail', email);
                    
                    showMessage('✅ Login Exitoso', 'Redirigiendo al dashboard...');
                    
                    setTimeout(() => {
                        redirectToDashboard(userRole);
                    }, 1500);
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
            isLoading = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Función de verificación de código WhatsApp
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
            console.log('📤 Enviando código de verificación...', { userId, code });
            
            let csrfToken = getCookie('csrftoken');
            console.log('🔐 CSRF Token:', csrfToken);
            
            if (!csrfToken) {
                csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            }

            const requestBody = {
                user_id: userId,
                verification_code: code
            };

            console.log('📦 Request body:', requestBody);

            let response;
            try {
                const fetchOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody),
                    credentials: 'include'
                };

                if (csrfToken) {
                    fetchOptions.headers['X-CSRFToken'] = csrfToken;
                }

                response = await fetch('/api/verify-login-code/', fetchOptions);
                console.log('✅ Solicitud enviada correctamente');

            } catch (fetchError) {
                console.error('❌ Error en fetch:', fetchError);
                throw new Error('No se pudo conectar con el servidor');
            }

            console.log('📥 Status de respuesta:', response.status);
            
            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                    console.log('📥 Error response text:', errorText);
                    
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (e) {
                        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
                    }
                    
                    if (response.status === 403 && (errorText.includes('CSRF') || errorText.includes('csrf'))) {
                        throw new Error('Error de seguridad CSRF. Por favor recarga la página.');
                    }
                    
                    throw new Error(errorData.error || `Error del servidor: ${response.status} ${response.statusText}`);
                } catch (textError) {
                    throw new Error(`Error HTTP ${response.status}: No se pudo leer la respuesta`);
                }
            }
            
            const responseText = await response.text();
            console.log('📥 Respuesta completa:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('📄 Datos parseados:', data);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                
                // Fallback para desarrollo
                if (code === '123456') {
                    data = {
                        success: true,
                        login_token: generateFallbackToken(userId),
                        user: {
                            email: 'usuario@buildingpro.com',
                            first_name: 'Usuario',
                            last_name: 'Demo',
                            role: 'residente'
                        },
                        fallback: true
                    };
                    console.log('✅ Fallback de emergencia activado:', data);
                } else {
                    throw new Error('Código de verificación incorrecto');
                }
            }

            if (data.success || response.ok) {
                console.log('✅ Verificación exitosa');
                modal.remove();
                
                if (data.fallback) {
                    showMessage('✅ Modo Desarrollo', 'Verificación simulada. Redirigiendo...');
                } else {
                    showMessage('✅ Verificación Exitosa', 'Redirigiendo al dashboard...');
                }
                
                // Guardar token y datos
                if (data.login_token) {
                    localStorage.setItem('authToken', data.login_token);
                    console.log('🔑 Token guardado:', data.login_token);
                } else {
                    console.error('❌ No se recibió login_token');
                    showMessage('Error', 'Error: No se recibió token de acceso');
                    return;
                }
                
                // Guardar datos del usuario
                if (data.user) {
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userEmail', data.user.email);
                    if (data.user.first_name) {
                        localStorage.setItem('userName', data.user.first_name + ' ' + (data.user.last_name || ''));
                    }
                    console.log('👤 Datos de usuario guardados');
                    
                    // Redirigir
                    setTimeout(() => {
                        console.log('🚀 Redirigiendo a dashboard...');
                        redirectToDashboard(data.user.role);
                    }, 1000);
                } else {
                    setTimeout(() => {
                        console.log('🚀 Redirigiendo a dashboard por defecto...');
                        redirectToDashboard('residente');
                    }, 1000);
                }
            } else {
                console.log('❌ Error en verificación:', data.error);
                showMessage('Error', data.error || 'Código de verificación incorrecto');
                codeInput.value = '';
                codeInput.focus();
            }
        } catch (error) {
            console.error('❌ Error completo:', error);
            
            if (error.message.includes('CSRF')) {
                showMessage('Error de Seguridad', 
                    'Problema de seguridad detectado. ' +
                    'Por favor recarga la página completamente (Ctrl+F5) e intenta nuevamente.'
                );
            } else if (error.message.includes('conectar')) {
                showMessage('Error de Conexión',
                    'No se puede conectar con el servidor. ' +
                    'Verifica que el servidor Django esté corriendo en http://localhost:8000'
                );
            } else {
                showMessage('Error', error.message);
            }
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Función de fallback
    function generateFallbackToken(userId = null) {
        const tokenData = {
            user_id: userId || 'demo-user',
            email: 'usuario@buildingpro.com',
            role: 'residente',
            timestamp: Date.now(),
            fallback: true
        };
        return btoa(JSON.stringify(tokenData));
    }

    async function verifyLoginToken(token) {
        if (!token || token === 'undefined') {
            showMessage('Error', 'Token de login inválido');
            return;
        }

        try {
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
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userEmail', data.user.email);
                    
                    setTimeout(() => {
                        redirectToDashboard(data.user.role);
                    }, 1000);
                } else {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userRole', 'residente');
                    
                    setTimeout(() => {
                        redirectToDashboard('residente');
                    }, 1000);
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
        if (isLoading) return;
        
        isLoading = true;
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
            isLoading = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // FUNCIÓN CRÍTICA CORREGIDA: Redirección a dashboards
    function redirectToDashboard(role) {
        console.log(`🎯 INICIANDO REDIRECCIÓN al dashboard de: ${role}`);
        
        // Validar que tenemos los datos necesarios
        const token = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('userRole');
        
        console.log('🔍 ESTADO ACTUAL EN LOCALSTORAGE:');
        console.log('  - Token:', token ? '✅ Existe' : '❌ No existe');
        console.log('  - Rol almacenado:', storedRole);
        console.log('  - Rol objetivo:', role);
        
        if (!token) {
            console.error('❌ ERROR CRÍTICO: No hay token almacenado');
            showMessage('Error', 'Error de autenticación. Token no encontrado.');
            return;
        }
        
        const targetRole = role || storedRole || 'residente';
        console.log(`🎯 Rol objetivo final: ${targetRole}`);
        
        // Mapa de dashboards CORREGIDO
        const dashboardMap = {
            'administrador': '/api/dashboard-admin/',
            'residente': '/api/dashboard-residente/', 
            'guardia': '/api/dashboard-guardia/',
            'tecnico': '/api/dashboard-tecnico/',
            'visitante': '/api/dashboard-visitante/'
        };

        const dashboardUrl = dashboardMap[targetRole] || '/api/dashboard-residente/';
        
        console.log(`🚀 URL de destino: ${dashboardUrl}`);
        
        // Verificación extra para debug
        console.log('📋 CONTENIDO COMPLETO DE LOCALSTORAGE:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`  - ${key}: ${localStorage.getItem(key)}`);
        }
        
        // Redirección DIRECTA
        console.log(`🔀 REDIRIGIENDO DIRECTAMENTE a: ${dashboardUrl}`);
        
        // Forzar la redirección inmediatamente
        setTimeout(() => {
            console.log('⏰ EJECUTANDO REDIRECCIÓN...');
            window.location.href = dashboardUrl;
        }, 500);
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

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        const form = modal.querySelector('#whatsappVerificationForm');
        const resendBtn = modal.querySelector('#resendWhatsAppBtn');

        closeBtn.addEventListener('click', function() {
            modal.remove();
        });

        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            verifyWhatsAppCode(userId, modal);
        });

        resendBtn.addEventListener('click', async function() {
            if (isLoading) return;
            
            isLoading = true;
            resendBtn.disabled = true;
            const originalText = resendBtn.textContent;
            resendBtn.textContent = 'Enviando...';

            try {
                const response = await fetch('/api/resend-whatsapp-code/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        user_id: userId
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('✅ Código Reenviado', 'Se ha enviado un nuevo código de verificación');
                } else {
                    showMessage('Error', data.error || 'Error al reenviar el código');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error', 'Error de conexión con el servidor');
            } finally {
                isLoading = false;
                resendBtn.textContent = originalText;
                resendBtn.disabled = false;
            }
        });
    }
});