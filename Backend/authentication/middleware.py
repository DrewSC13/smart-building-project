import os
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from pathlib import Path
from django.utils import timezone
from .models import FailedLoginAttempt
import ipaddress

class StaticFilesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.frontend_dir = settings.BASE_DIR.parent / 'Frontend'
        
    def __call__(self, request):
        # ✅ CORRECCIÓN: Manejar archivos estáticos y HTML del frontend
        if request.path.startswith(('/css/', '/js/', '/img/')) or request.path.endswith(('.html', '.htm')):
            return self.serve_static_file(request)
        
        # Dejar que Django maneje todas las demás rutas
        response = self.get_response(request)
        return response
    
    def serve_static_file(self, request):
        # Construir la ruta del archivo
        if request.path == '/' or request.path == '/login/':
            file_path = self.frontend_dir / 'login.html'
        elif request.path == '/register/':
            file_path = self.frontend_dir / 'register.html'
        elif request.path == '/reset-password/':
            file_path = self.frontend_dir / 'reset-password.html'
        elif request.path == '/profile/':
            file_path = self.frontend_dir / 'profile.html'
        elif request.path.startswith(('/css/', '/js/', '/img/')):
            file_path = self.frontend_dir / request.path[1:]
        else:
            # Para otros archivos HTML
            file_path = self.frontend_dir / request.path.lstrip('/')
        
        if file_path.exists() and file_path.is_file():
            content_type = self.get_content_type(file_path)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                return HttpResponse(content, content_type=content_type)
            except Exception as e:
                return HttpResponse(f"Error reading file: {e}", status=500)
        
        return HttpResponse("File not found", status=404)
    
    def get_content_type(self, file_path):
        content_types = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.html': 'text/html',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        }
        return content_types.get(file_path.suffix.lower(), 'text/plain')

class BruteForceProtectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.login_paths = ['/api/login/', '/api/login']
    
    def __call__(self, request):
        if request.path in self.login_paths and request.method == 'POST':
            return self.check_brute_force(request)
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_private_ip(self, ip):
        try:
            return ipaddress.ip_address(ip).is_private
        except ValueError:
            return False
    
    def check_brute_force(self, request):
        client_ip = self.get_client_ip(request)
        email = request.POST.get('email', '')
        
        if self.is_private_ip(client_ip):
            return self.get_response(request)
        
        time_threshold = timezone.now() - timezone.timedelta(minutes=15)
        ip_attempts = FailedLoginAttempt.objects.filter(
            ip_address=client_ip,
            timestamp__gte=time_threshold
        ).count()
        
        if email:
            email_attempts = FailedLoginAttempt.objects.filter(
                email=email,
                timestamp__gte=time_threshold
            ).count()
        else:
            email_attempts = 0
        
        max_attempts_per_ip = 10
        max_attempts_per_email = 5
        
        if ip_attempts >= max_attempts_per_ip:
            return JsonResponse({
                'error': 'Demasiados intentos fallidos desde esta dirección IP. Por favor, espere 15 minutos.'
            }, status=429)
        
        if email_attempts >= max_attempts_per_email:
            return JsonResponse({
                'error': 'Demasiados intentos fallidos para este email. Por favor, espere 15 minutos.'
            }, status=429)
        
        return self.get_response(request)