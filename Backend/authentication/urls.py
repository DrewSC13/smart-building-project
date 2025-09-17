from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-email/<uuid:token>/', views.verify_email, name='verify-email'),
    path('verify-login/<uuid:token>/', views.verify_login, name='verify-login'),
    path('dashboard-api/', views.dashboard_api, name='dashboard-api'),
    path('captcha/', views.get_captcha, name='get-captcha'),
    path('password-reset-request/', views.password_reset_request, name='password-reset-request'),
    path('password-reset-confirm/', views.password_reset_confirm, name='password-reset-confirm'),
]
