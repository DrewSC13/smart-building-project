from django.urls import path, include
from . import views

urlpatterns = [
    # CAPTCHA endpoints
    path('captcha/', views.get_captcha, name='get_captcha'),
    
    # Autenticación
    path('login/', views.login, name='login'),
    path('verify-login-code/', views.verify_login_code, name='verify_login_code'),
    path('resend-login-code/', views.resend_login_code, name='resend_login_code'),
    path('visitor-login/', views.visitor_login, name='visitor_login'),
    
    # Dashboards - URLs directas
    path('dashboard-admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard-residente/', views.residente_dashboard, name='residente_dashboard'),
    path('dashboard-guardia/', views.guardia_dashboard, name='guardia_dashboard'),
    path('dashboard-tecnico/', views.tecnico_dashboard, name='tecnico_dashboard'),
    path('dashboard-visitante/', views.visitante_dashboard, name='visitante_dashboard'),
    
    # Redirección de dashboard general (opcional)
    path('dashboard/', views.dashboard_redirect, name='dashboard_redirect'),
    
    # Registro y verificación
    path('register/', views.register, name='register'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify_email'),
    
    # Recuperación de contraseña
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # Gestión de sesión
    path('check-session/', views.check_session, name='check_session'),
    path('logout/', views.logout, name='logout'),
    
    # Perfil de usuario
    path('user-profile/', views.user_profile, name='user_profile'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
    
    # Anuncios y notificaciones
    path('dashboard-stats/', views.dashboard_stats, name='dashboard_stats'),
    path('announcements/', views.announcements_list, name='announcements_list'),
    path('create-announcement/', views.create_announcement, name='create_announcement'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('mark-notification-read/<int:notification_id>/', views.mark_notification_read, name='mark_notification_read'),
    
    # Verificación 2FA
    path('verify-2fa/', views.verify_2fa, name='verify_2fa'),
    path('resend-2fa-code/', views.resend_2fa_code, name='resend_2fa_code'),
    
    # API general
    path('dashboard-api/', views.dashboard_api, name='dashboard_api'),
    path('check-password-strength/', views.check_password_strength, name='check_password_strength'),
]