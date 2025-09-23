from django.urls import path
from . import views

urlpatterns = [
    # URLs existentes
    path('captcha/', views.get_captcha, name='get_captcha'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify_email'),
    path('verify-login/<uuid:token>/', views.verify_login, name='verify_login'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # Nuevas URLs para verificación de login por WhatsApp
    path('verify-login-code/', views.verify_login_code, name='verify_login_code'),
    path('resend-login-code/', views.resend_login_code, name='resend_login_code'),
    path('check-password-strength/', views.check_password_strength, name='check_password_strength'),
    
    # URLs mantenidas para compatibilidad
    path('verify-phone/', views.verify_login_code, name='verify_phone'),  # Redirigido
    path('resend-phone-code/', views.resend_login_code, name='resend_phone_code'),  # Redirigido
    
    # URLs para perfil y dashboard
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('announcements/', views.announcements_list, name='announcements_list'),
    path('announcements/create/', views.create_announcement, name='create_announcement'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    
    # Vista del dashboard
    path('dashboard/', views.custom_dashboard_view, name='dashboard'),
    path('dashboard/api/', views.dashboard_api, name='dashboard_api'),
]