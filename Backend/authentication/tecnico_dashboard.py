from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q
from .models import (
    TemporaryUser, Incidencia, Mantenimiento, Residente, Departamento,
    InventarioItem, MovimientoInventario
)

@api_view(['GET'])
def tecnico_dashboard_data(request):
    """Endpoint para datos del dashboard de técnico"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'tecnico':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Información del técnico
        info_tecnico = {
            'nombre': user.get_full_name(),
            'especialidad': 'Fontanería y Electricidad',  # Podría venir de un perfil extendido
            'fecha_incorporacion': '2023-03-15',  # Datos simulados
            'turno': 'Completo'
        }
        
        # Agenda de trabajo para hoy
        agenda_trabajo = []
        mantenimientos_hoy = Mantenimiento.objects.filter(
            tecnico=user,
            fecha_asignacion__date=timezone.now().date()
        ).select_related('incidencia')
        
        for mantenimiento in mantenimientos_hoy:
            incidencia = mantenimiento.incidencia
            agenda_trabajo.append({
                'id': incidencia.id,
                'tipo': 'mantenimiento',
                'descripcion': incidencia.titulo,
                'prioridad': incidencia.prioridad,
                'estado': mantenimiento.estado if hasattr(mantenimiento, 'estado') else 'asignado',
                'ubicacion': f"{incidencia.residente.departamento.numero} - {incidencia.residente.departamento.edificio.nombre}",
                'hora': mantenimiento.fecha_inicio.time().isoformat()[:5] if mantenimiento.fecha_inicio else 'Por asignar',
                'duracion': '2 horas',  # Estimado
                'contacto': f"{incidencia.residente.usuario.get_full_name()} - {incidencia.residente.usuario.phone}",
                'turno': 'mañana' if mantenimiento.fecha_inicio and mantenimiento.fecha_inicio.hour < 12 else 'tarde'
            })
        
        # Tickets por prioridad (estadísticas)
        tickets_prioridad = {
            'urgentes': Incidencia.objects.filter(prioridad='urgente').count(),
            'altos': Incidencia.objects.filter(prioridad='alta').count(),
            'medios': Incidencia.objects.filter(prioridad='media').count(),
            'bajos': Incidencia.objects.filter(prioridad='baja').count()
        }
        
        # Inventario crítico (stock bajo)
        inventario_critico = InventarioItem.objects.filter(
            stock_actual__lte=models.F('stock_minimo')
        )[:5]
        
        inventario_data = []
        for item in inventario_critico:
            inventario_data.append({
                'nombre': item.nombre,
                'categoria': item.categoria,
                'stock_actual': item.stock_actual,
                'stock_minimo': item.stock_minimo,
                'unidad_medida': item.unidad_medida,
                'necesita_reposicion': item.stock_actual <= item.stock_minimo
            })
        
        # Mantenimientos preventivos próximos
        mantenimientos_preventivos = [
            {
                'equipo': 'Ascensor Torre A',
                'ultimo_mantenimiento': '2023-12-15',
                'proximo': '2024-02-15',
                'responsable': user.get_full_name()
            },
            {
                'equipo': 'Sistema de bombeo',
                'ultimo_mantenimiento': '2023-11-20',
                'proximo': '2024-01-20',
                'responsable': user.get_full_name()
            }
        ]
        
        # Métricas de rendimiento
        metricas_rendimiento = {
            'tickets_completados': Mantenimiento.objects.filter(
                tecnico=user,
                fecha_fin__isnull=False
            ).count(),
            'tiempo_promedio_respuesta': '2.3 horas',  # Simulado
            'satisfaccion_clientes': 4.5,
            'tickets_hoy': mantenimientos_hoy.count()
        }
        
        dashboard_data = {
            'info_tecnico': info_tecnico,
            'agenda_trabajo': agenda_trabajo,
            'tickets_prioridad': tickets_prioridad,
            'inventario_critico': inventario_data,
            'mantenimientos_preventivos': mantenimientos_preventivos,
            'metricas_rendimiento': metricas_rendimiento,
            'metricas_dia': {
                'tickets_hoy': metricas_rendimiento['tickets_hoy'],
                'completados_hoy': Mantenimiento.objects.filter(
                    tecnico=user,
                    fecha_fin__date=timezone.now().date()
                ).count()
            },
            'timestamp': timezone.now().isoformat()
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def iniciar_intervencion(request, ticket_id):
    """Endpoint para iniciar una intervención"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'tecnico':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Buscar la incidencia
        try:
            incidencia = Incidencia.objects.get(id=ticket_id)
        except Incidencia.DoesNotExist:
            return Response({'error': 'Ticket no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Crear o actualizar mantenimiento
        mantenimiento, created = Mantenimiento.objects.get_or_create(
            incidencia=incidencia,
            defaults={
                'tecnico': user,
                'fecha_asignacion': timezone.now(),
                'fecha_inicio': timezone.now()
            }
        )
        
        if not created:
            mantenimiento.fecha_inicio = timezone.now()
            mantenimiento.save()
        
        # Actualizar estado de la incidencia
        incidencia.estado = 'en_proceso'
        incidencia.save()
        
        return Response({
            'message': 'Intervención iniciada correctamente',
            'ticket_id': ticket_id,
            'intervencion_id': mantenimiento.id,
            'fecha_inicio': mantenimiento.fecha_inicio.isoformat(),
            'estado': 'en_proceso'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def finalizar_intervencion(request, ticket_id):
    """Endpoint para finalizar una intervención"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'tecnico':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            mantenimiento = Mantenimiento.objects.get(
                incidencia_id=ticket_id,
                tecnico=user
            )
        except Mantenimiento.DoesNotExist:
            return Response({'error': 'Intervención no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        observaciones = request.data.get('observaciones', '')
        materiales_utilizados = request.data.get('materiales_utilizados', [])
        
        # Actualizar mantenimiento
        mantenimiento.fecha_fin = timezone.now()
        mantenimiento.observaciones = observaciones
        mantenimiento.save()
        
        # Actualizar estado de la incidencia
        mantenimiento.incidencia.estado = 'resuelta'
        mantenimiento.incidencia.save()
        
        # Registrar uso de materiales
        for material in materiales_utilizados:
            MovimientoInventario.objects.create(
                item_id=material['item_id'],
                tipo='salida',
                cantidad=material['cantidad'],
                motivo=f"Intervención ticket #{ticket_id}",
                fecha=timezone.now()
            )
        
        return Response({
            'message': 'Intervención finalizada correctamente',
            'ticket_id': ticket_id,
            'tiempo_total': str(mantenimiento.fecha_fin - mantenimiento.fecha_inicio),
            'observaciones': observaciones
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def historial_intervenciones(request):
    """Historial de intervenciones del técnico"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'tecnico':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Intervenciones de los últimos 30 días
        intervenciones = Mantenimiento.objects.filter(
            tecnico=user,
            fecha_fin__isnull=False,
            fecha_fin__gte=timezone.now() - timedelta(days=30)
        ).select_related('incidencia').order_by('-fecha_fin')
        
        historial_data = []
        for intervencion in intervenciones:
            historial_data.append({
                'ticket_id': intervencion.incidencia.id,
                'descripcion': intervencion.incidencia.titulo,
                'fecha_inicio': intervencion.fecha_inicio.isoformat(),
                'fecha_fin': intervencion.fecha_fin.isoformat(),
                'duracion': str(intervencion.fecha_fin - intervencion.fecha_inicio),
                'prioridad': intervencion.incidencia.prioridad,
                'ubicacion': f"{intervencion.incidencia.residente.departamento.numero}",
                'satisfaccion': 4.5  # Simulado - podría venir de encuestas
            })
        
        # Estadísticas del historial
        estadisticas = {
            'total_intervenciones': intervenciones.count(),
            'tiempo_promedio': intervenciones.aggregate(
                avg_tiempo=Avg(models.F('fecha_fin') - models.F('fecha_inicio'))
            )['avg_tiempo'],
            'intervenciones_urgentes': intervenciones.filter(incidencia__prioridad='urgente').count(),
            'eficiencia_general': '95%'  # Simulado
        }
        
        return Response({
            'historial': historial_data,
            'estadisticas': estadisticas,
            'periodo': 'Últimos 30 días'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)