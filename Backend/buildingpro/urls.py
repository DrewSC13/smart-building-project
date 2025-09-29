from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from pathlib import Path
import os

# Configuración de directorios
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR.parent / 'Frontend'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),  # ✅ TODAS las APIs incluidas aquí
    path('captcha/', include('captcha.urls')),
    
    # URLs principales - usando TemplateView directo
    path('', TemplateView.as_view(template_name='login.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register'),
    path('reset-password/', TemplateView.as_view(template_name='reset-password.html'), name='reset-password'),
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='profile'),
    
    # URLs para archivos estáticos del Frontend
    re_path(r'^css/(?P<path>.*)$', serve, {
        'document_root': FRONTEND_DIR / 'css',
    }),
    re_path(r'^js/(?P<path>.*)$', serve, {
        'document_root': FRONTEND_DIR / 'js',
    }),
    re_path(r'^img/(?P<path>.*)$', serve, {
        'document_root': FRONTEND_DIR / 'img',
    }),
]

# Fallback para desarrollo - redirigir a login
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='login.html')),
]