# Backend/check_paths.py
import os
from pathlib import Path

def check_paths():
    # Obtener el directorio base del proyecto
    BASE_DIR = Path(__file__).resolve().parent
    print(f"BASE_DIR: {BASE_DIR}")
    
    # Ruta al Frontend
    frontend_path = BASE_DIR.parent / 'Frontend'
    print(f"Frontend path: {frontend_path}")
    print(f"Frontend exists: {frontend_path.exists()}")
    
    if frontend_path.exists():
        print("Contenido de Frontend:")
        for item in frontend_path.iterdir():
            print(f"  {item.name}")
    
    # Verificar archivos específicos
    css_path = frontend_path / 'css' / 'login.css'
    print(f"CSS path: {css_path}")
    print(f"CSS exists: {css_path.exists()}")
    
    return frontend_path.exists()

if __name__ == "__main__":
    check_paths()