import os
from django.http import HttpResponse, Http404, JsonResponse
from django.conf import settings
from pathlib import Path
from django.utils import timezone
from .models import FailedLoginAttempt
from django.db.models import Count
import ipaddress

class StaticFilesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.frontend_dir = settings.BASE_DIR.parent / 'Frontend'
        
    def __call__(self, request):
        if request.path.startswith(('/css/', '/js/', '/img/')):
            return self.serve_static_file(request)
        
        response = self.get_response(request)
        return response
    
    def serve_static_file(self, request):
        file_path = self.frontend_dir / request.path[1:]
        
        if file_path.exists() and file_path.is_file():
            content_type = 'text/plain'
            if file_path.suffix == '.css':
                content_type = 'text/css'
            elif file_path.suffix == '.js':
                content_type = 'application/javascript'
            elif file_path.suffix in ['.png', '.jpg', '.jpeg', '.gif']:
                content_type = f'image/{file_path.suffix[1:]}'
            
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                return HttpResponse(content, content_type=content_type)
            except Exception as e:
                return Http404(f"Error reading file: {e}")
        
        return Http404("File not found")

class BruteForceProtectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.login_paths = ['/api/login/', '/api/login']  # Rutas de login a proteger
    
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
        
        # No aplicar protección a IPs privadas (para desarrollo)
        if self.is_private_ip(client_ip):
            return self.get_response(request)
        
        # Verificar intentos recientes por IP
        time_threshold = timezone.now() - timezone.timedelta(minutes=15)
        ip_attempts = FailedLoginAttempt.objects.filter(
            ip_address=client_ip,
            timestamp__gte=time_threshold
        ).count()
        
        # Verificar intentos recientes por email
        if email:
            email_attempts = FailedLoginAttempt.objects.filter(
                email=email,
                timestamp__gte=time_threshold
            ).count()
        else:
            email_attempts = 0
        
        # Bloquear si hay demasiados intentos
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
