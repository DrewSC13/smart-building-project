document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const profileNameElement = document.getElementById('profile-name');
    const profileRoleElement = document.getElementById('profile-role');
    const profileEmailElement = document.getElementById('profile-email');
    const avatarIconElement = document.getElementById('avatar-icon');

    // Formularios
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    // Campos del formulario de perfil
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const birthDateInput = document.getElementById('birth-date');
    const emergencyContactInput = document.getElementById('emergency-contact');
    const emergencyPhoneInput = document.getElementById('emergency-phone');

    // Campos del formulario de contraseña
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Pestañas
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Botones
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveProfileBtn = document.getElementById('save-profile');
    const savePreferencesBtn = document.getElementById('save-preferences');
    const exportDataBtn = document.getElementById('export-data');
    const deleteAccountBtn = document.getElementById('delete-account');

    // Modal
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const closeModal = document.querySelector('.close');

    // Estado de la aplicación
    let userProfile = null;
    let originalProfileData = null;

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

    function formatDate(dateString) {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    // Funciones de API
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
            showMessage('Error', 'No se pudo cargar el perfil del usuario');
            return null;
        }
    }

    async function updateUserProfile(profileData) {
        try {
            const response = await fetch('/api/profile/update/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar perfil');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    async function changePassword(passwordData) {
        try {
            const response = await fetch('/api/profile/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(passwordData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al cambiar contraseña');
            }

            return await response.json();
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // Funciones de renderizado
    function renderUserProfile(profile) {
        if (profile) {
            // Información principal
            profileNameElement.textContent = `${profile.first_name} ${profile.last_name}`;
            profileRoleElement.textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
            profileEmailElement.textContent = profile.email;

            // Formulario de perfil
            firstNameInput.value = profile.first_name || '';
            lastNameInput.value = profile.last_name || '';
            emailInput.value = profile.email || '';
            phoneInput.value = profile.phone || '';
            addressInput.value = profile.address || '';
            birthDateInput.value = profile.date_of_birth || '';
            emergencyContactInput.value = profile.emergency_contact || '';
            emergencyPhoneInput.value = profile.emergency_phone || '';

            // Información de la cuenta
            document.getElementById('account-created').textContent = formatDate(profile.created_at);
            document.getElementById('account-updated').textContent = formatDate(profile.updated_at);
            document.getElementById('account-role').textContent = profile.role;

            // Guardar datos originales para cancelar edición
            originalProfileData = { ...profile };
        }
    }

    function setupTabs() {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');

                // Remover clase active de todas las pestañas y contenidos
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Agregar clase active a la pestaña clickeada y su contenido
                this.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }

    function setupFormValidation() {
        // Validación del formulario de perfil
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveProfile();
        });

        // Validación del formulario de contraseña
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await changeUserPassword();
        });

        // Validación en tiempo real de contraseña
        newPasswordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validatePassword);
    }

    function validatePassword() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword && confirmPassword) {
            if (newPassword === confirmPassword) {
                confirmPasswordInput.style.borderColor = 'var(--success)';
            } else {
                confirmPasswordInput.style.borderColor = 'var(--error)';
            }
        }
    }

    // Funciones de manejo de eventos
    async function saveProfile() {
        try {
            saveProfileBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Guardando...';
            saveProfileBtn.disabled = true;

            const profileData = {
                first_name: firstNameInput.value,
                last_name: lastNameInput.value,
                phone: phoneInput.value,
                address: addressInput.value,
                date_of_birth: birthDateInput.value,
                emergency_contact: emergencyContactInput.value,
                emergency_phone: emergencyPhoneInput.value
            };

            await updateUserProfile(profileData);
            showMessage('Éxito', 'Perfil actualizado correctamente');

            // Recargar datos actualizados
            userProfile = await fetchUserProfile();
            if (userProfile) {
                renderUserProfile(userProfile);
            }

        } catch (error) {
            showMessage('Error', error.message);
        } finally {
            saveProfileBtn.innerHTML = '<i class="bx bx-save"></i> Guardar Cambios';
            saveProfileBtn.disabled = false;
        }
    }

    async function changeUserPassword() {
        try {
            const passwordData = {
                current_password: currentPasswordInput.value,
                new_password: newPasswordInput.value,
                confirm_password: confirmPasswordInput.value
            };

            await changePassword(passwordData);
            showMessage('Éxito', 'Contraseña cambiada correctamente');

            // Limpiar formulario
            passwordForm.reset();

        } catch (error) {
            showMessage('Error', error.message);
        }
    }

    function cancelEdit() {
        if (originalProfileData) {
            renderUserProfile(originalProfileData);
            showMessage('Información', 'Cambios cancelados');
        }
    }

    function exportUserData() {
        if (userProfile) {
            const dataStr = JSON.stringify(userProfile, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `buildingpro-data-${userProfile.email}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showMessage('Éxito', 'Datos exportados correctamente');
        }
    }

    function deleteUserAccount() {
        if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            showMessage('Información', 'Funcionalidad de eliminación de cuenta en desarrollo');
        }
    }

    // Funciones de inicialización
    async function initializeProfile() {
        try {
            userProfile = await fetchUserProfile();
            if (userProfile) {
                renderUserProfile(userProfile);
            }

            setupTabs();
            setupFormValidation();

            showMessage('Éxito', 'Perfil cargado correctamente');

        } catch (error) {
            console.error('Error initializing profile:', error);
            showMessage('Error', 'Error al inicializar el perfil');
        }
    }

    // Event Listeners
    cancelEditBtn.addEventListener('click', cancelEdit);
    exportDataBtn.addEventListener('click', exportUserData);
    deleteAccountBtn.addEventListener('click', deleteUserAccount);

    savePreferencesBtn.addEventListener('click', function() {
        showMessage('Éxito', 'Preferencias guardadas correctamente');
    });

    // Modal events
    closeModal.addEventListener('click', closeMessage);
    window.addEventListener('click', function(e) {
        if (e.target === messageModal) {
            closeMessage();
        }
    });

    // Upload de avatar
    document.getElementById('avatar-input').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showMessage('Error', 'La imagen debe ser menor a 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showMessage('Error', 'Por favor selecciona una imagen válida');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                avatarIconElement.style.backgroundImage = `url(${e.target.result})`;
                avatarIconElement.innerHTML = '';
                showMessage('Éxito', 'Avatar actualizado correctamente');
            };
            reader.readAsDataURL(file);
        }
    });

    // Inicializar perfil
    initializeProfile();

    // Estilos adicionales dinámicos
    const style = document.createElement('style');
    style.textContent = `
        .preference-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--accent);
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        .theme-selector {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .theme-option {
            flex: 1;
            padding: 10px;
            border: 1px solid rgba(0, 191, 255, 0.3);
            background: rgba(10, 15, 28, 0.6);
            color: var(--text);
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .theme-option.active {
            border-color: var(--accent);
            background: rgba(0, 191, 255, 0.2);
        }

        .theme-option:hover {
            background: rgba(0, 191, 255, 0.1);
        }

        .account-info {
            display: grid;
            gap: 15px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(0, 191, 255, 0.1);
        }

        .account-actions {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        #last-login {
            color: var(--accent);
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
});
