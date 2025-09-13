# authentication/middleware.py
import os
from django.http import HttpResponse, Http404
from django.conf import settings
from pathlib import Path

class StaticFilesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.frontend_dir = settings.BASE_DIR.parent / 'Frontend'
        
    def __call__(self, request):
        # Verificar si es una solicitud de archivo estático
        if request.path.startswith(('/css/', '/js/', '/img/')):
            return self.serve_static_file(request)
        
        response = self.get_response(request)
        return response
    
    def serve_static_file(self, request):
        file_path = self.frontend_dir / request.path[1:]  # Remover el slash inicial
        
        if file_path.exists() and file_path.is_file():
            # Determinar el tipo MIME basado en la extensión
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