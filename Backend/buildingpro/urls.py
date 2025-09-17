from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from authentication.views import custom_dashboard_view
from pathlib import Path
import os

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / 'Frontend'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('captcha/', include('captcha.urls')),
    
    path('', TemplateView.as_view(template_name='login.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register'),
    path('reset-password/', TemplateView.as_view(template_name='reset-password.html'), name='reset-password'),
    path('dashboard/', custom_dashboard_view, name='dashboard'),
    
    re_path(r'^css/(?P<path>.*)$', serve, {
        'document_root': os.path.join(FRONTEND_DIR, 'css'),
    }),
    re_path(r'^js/(?P<path>.*)$', serve, {
        'document_root': os.path.join(FRONTEND_DIR, 'js'),
    }),
    re_path(r'^img/(?P<path>.*)$', serve, {
        'document_root': os.path.join(FRONTEND_DIR, 'img'),
    }),
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': os.path.join(FRONTEND_DIR, 'static'),
    }),
]
