from django.urls import path
from . import views

urlpatterns = [
    # URLs existentes
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify-email'),
    path('verify-login/<uuid:token>/', views.verify_login, name='verify-login'),
    path('dashboard-api/', views.dashboard_api, name='dashboard-api'),
    path('captcha/', views.get_captcha, name='get-captcha'),
    path('password-reset-request/', views.password_reset_request, name='password-reset-request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    
    # === NUEVAS URLs PARA FASE 1 ===
    path('profile/', views.user_profile, name='user-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('profile/change-password/', views.change_password, name='change-password'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('announcements/', views.announcements_list, name='announcements-list'),
    path('announcements/create/', views.create_announcement, name='create-announcement'),
    path('notifications/', views.notifications_list, name='notifications-list'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
]