from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from authentication.views import custom_dashboard_view
from pathlib import Path
import os

# Configuración de directorios
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / 'Frontend'

def serve_frontend(request, path='login.html'):
    """Servir archivos HTML del frontend"""
    file_path = os.path.join(FRONTEND_DIR, path)
    
    # Si no se especifica archivo, servir login.html por defecto
    if not path or path.endswith('/'):
        path = 'login.html'
        file_path = os.path.join(FRONTEND_DIR, 'login.html')
    
    # Si el archivo no existe, servir el archivo base (SPA)
    if not os.path.exists(file_path):
        file_path = os.path.join(FRONTEND_DIR, 'login.html')
    
    return serve(request, os.path.basename(file_path), document_root=os.path.dirname(file_path))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('captcha/', include('captcha.urls')),
    
    # URLs principales
    path('', TemplateView.as_view(template_name='login.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register'),
    path('reset-password/', TemplateView.as_view(template_name='reset-password.html'), name='reset-password'),
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='profile'),
    
    # Dashboard principal - redirige según rol
    path('dashboard/', custom_dashboard_view, name='dashboard'),
    
    # URLs específicas para dashboards
    path('dashboard-admin/', TemplateView.as_view(template_name='dashboard-admin.html'), name='dashboard-admin'),
    path('dashboard-residente/', TemplateView.as_view(template_name='dashboard-residente.html'), name='dashboard-residente'),
    path('dashboard-guardia/', TemplateView.as_view(template_name='dashboard-guardia.html'), name='dashboard-guardia'),
    path('dashboard-tecnico/', TemplateView.as_view(template_name='dashboard-tecnico.html'), name='dashboard-tecnico'),
    path('dashboard-visitante/', TemplateView.as_view(template_name='dashboard-visitante.html'), name='dashboard-visitante'),
    
    # URLs para archivos estáticos
    re_path(r'^css/(?P<path>.*)$', serve, {
        'document_root': FRONTEND_DIR / 'css',
    }),
    re_path(r'^js/(?P<path>.*)$', serve, {
        'document_root': FRONTEND_DIR / 'js',
    }),
    re_path(r'^img/(?P<path>.*)$', serve, {
        'document_root': FRONTEND_DIR / 'img',
    }),
    
    # Captcha images
    re_path(r'^captcha/image/(?P<key>\w+)/$', serve, {
        'document_root': BASE_DIR / 'media' / 'captcha',
    }),
    
    # Servir cualquier archivo HTML directamente desde Frontend
    re_path(r'^(?P<path>[\w\-/]+\.html)$', serve, {
        'document_root': FRONTEND_DIR,
    }),
    
    # Fallback: servir cualquier ruta no encontrada con login.html (para SPA)
    re_path(r'^.*$', TemplateView.as_view(template_name='login.html')),
]