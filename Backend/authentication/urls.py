from django.urls import path
from . import views
from . import admin_dashboard, residente_dashboard, guardia_dashboard, tecnico_dashboard, visitante_dashboard

urlpatterns = [
    # URLs de autenticación
    path('captcha/', views.get_captcha, name='get_captcha'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify_email'),
    path('verify-login/<uuid:token>/', views.verify_login, name='verify_login'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('verify-login-code/', views.verify_login_code, name='verify_login_code'),
    path('resend-login-code/', views.resend_login_code, name='resend_login_code'),
    path('check-password-strength/', views.check_password_strength, name='check_password_strength'),
    path('verify-phone/', views.verify_login_code, name='verify_phone'),
    path('resend-phone-code/', views.resend_login_code, name='resend_phone_code'),

    # Perfil y dashboard básico
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('announcements/', views.announcements_list, name='announcements_list'),
    path('announcements/create/', views.create_announcement, name='create_announcement'),
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('dashboard/', views.custom_dashboard_view, name='dashboard'),
    path('dashboard/api/', views.dashboard_api, name='dashboard_api'),

    # DASHBOARDS POR ROL - ADMINISTRADOR
    path('dashboard/admin/', admin_dashboard.admin_dashboard_data, name='admin_dashboard'),
    path('dashboard/admin/financial-reports/', admin_dashboard.financial_reports, name='financial_reports'),

    # DASHBOARDS POR ROL - RESIDENTE
    path('dashboard/residente/', residente_dashboard.residente_dashboard_data, name='residente_dashboard'),
    path('dashboard/residente/finanzas/', residente_dashboard.residente_finanzas, name='residente_finanzas'),
    path('dashboard/residente/reportar-problema/', residente_dashboard.reportar_problema, name='reportar_problema'),

    # DASHBOARDS POR ROL - GUARDIA
    path('dashboard/guardia/', guardia_dashboard.guardia_dashboard_data, name='guardia_dashboard'),
    path('dashboard/guardia/registrar-acceso/', guardia_dashboard.registrar_acceso_manual, name='registrar_acceso_manual'),
    path('dashboard/guardia/registrar-incidente/', guardia_dashboard.registrar_incidente, name='registrar_incidente'),
    path('dashboard/guardia/estado-dispositivos/', guardia_dashboard.estado_dispositivos, name='estado_dispositivos'),

    # DASHBOARDS POR ROL - TÉCNICO
    path('dashboard/tecnico/', tecnico_dashboard.tecnico_dashboard_data, name='tecnico_dashboard'),
    path('dashboard/tecnico/intervenciones/<int:ticket_id>/iniciar/', tecnico_dashboard.iniciar_intervencion, name='iniciar_intervencion'),
    path('dashboard/tecnico/intervenciones/<int:ticket_id>/finalizar/', tecnico_dashboard.finalizar_intervencion, name='finalizar_intervencion'),
    path('dashboard/tecnico/historial/', tecnico_dashboard.historial_intervenciones, name='historial_intervenciones'),

    # DASHBOARDS POR ROL - VISITANTE
    path('dashboard/visitante/', visitante_dashboard.visitante_dashboard_data, name='visitante_dashboard'),
    path('dashboard/visitante/solicitar-extension/', visitante_dashboard.solicitar_extension, name='solicitar_extension'),
    path('dashboard/visitante/solicitar-asistencia/', visitante_dashboard.solicitar_asistencia, name='solicitar_asistencia'),
    path('dashboard/visitante/finalizar-visita/', visitante_dashboard.finalizar_visita, name='finalizar_visita'),
]
