from django.urls import path
from . import views

urlpatterns = [
    # 🔐 Autenticación y seguridad
    path('captcha/', views.get_captcha, name='get_captcha'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify_email'),
    path('verify-login/<uuid:token>/', views.verify_login, name='verify_login'),
    path('verify-login-code/', views.verify_login_code, name='verify_login_code'),
    path('resend-login-code/', views.resend_login_code, name='resend_login_code'),
    path('check-password-strength/', views.check_password_strength, name='check_password_strength'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('logout/', views.logout, name='logout'),

    # 👤 Perfil de usuario
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),

    # 📊 Dashboard y API de datos
    path('dashboard/', views.custom_dashboard_view, name='dashboard'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('dashboard/api/', views.dashboard_api, name='dashboard_api'),

    # 🎯 Dashboards específicos por rol - ✅ CORREGIDO: Usar vistas de Django
    path('dashboard-admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard-residente/', views.residente_dashboard, name='residente_dashboard'),
    path('dashboard-guardia/', views.guardia_dashboard, name='guardia_dashboard'),
    path('dashboard-tecnico/', views.tecnico_dashboard, name='tecnico_dashboard'),
    path('dashboard-visitante/', views.visitante_dashboard, name='visitante_dashboard'),

    # 📢 Anuncios y notificaciones
    path('announcements/', views.announcements_list, name='announcements_list'),
    path('announcements/create/', views.create_announcement, name='create_announcement'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
]