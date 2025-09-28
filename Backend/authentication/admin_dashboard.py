from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Q
from .models import (
    TemporaryUser, Factura, Pago, Departamento, Residente, 
    Incidencia, Acceso, Visitante, Consumo, Encuesta, VotoEncuesta,
    EventoIoT, Mantenimiento
)

@api_view(['GET'])
def admin_dashboard_data(request):
    """Endpoint para datos del dashboard de administrador"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'administrador':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # KPIs financieros
        total_ingresos = Pago.objects.aggregate(total=Sum('monto'))['total'] or 0
        morosidad = Factura.objects.filter(
            estado='pendiente', 
            fecha_vencimiento__lt=timezone.now().date()
        ).aggregate(total=Sum('monto_total'))['total'] or 0
        
        # Gastos (simulado - en un sistema real vendría de orden_compra)
        gastos_mensuales = Mantenimiento.objects.filter(
            fecha_fin__month=timezone.now().month
        ).aggregate(total=Sum('costo'))['total'] or 0
        
        # Ocupación del edificio
        total_deptos = Departamento.objects.count()
        deptos_ocupados = Departamento.objects.filter(estado='ocupado').count()
        ocupacion_porcentaje = (deptos_ocupados / total_deptos * 100) if total_deptos > 0 else 0
        
        # Satisfacción (simulado con encuestas)
        encuesta_activa = Encuesta.objects.filter(activa=True).first()
        satisfaccion = 4.2  # Valor simulado
        
        kpis_financieros = {
            'ingresos_totales': float(total_ingresos),
            'morosidad': float(morosidad),
            'gastos_mensuales': float(gastos_mensuales),
            'ocupacion_edificio': round(ocupacion_porcentaje, 1),
            'satisfaccion_residentes': satisfaccion
        }
        
        # Alertas críticas en tiempo real
        alertas_criticas = []
        
        # Alertas de seguridad
        eventos_seguridad = EventoIoT.objects.filter(
            tipo='seguridad',
            fecha_hora__gte=timezone.now() - timedelta(hours=24)
        )[:5]
        
        for evento in eventos_seguridad:
            alertas_criticas.append({
                'tipo': 'seguridad',
                'mensaje': evento.mensaje,
                'prioridad': 'alta',
                'timestamp': evento.fecha_hora
            })
        
        # Alertas de mantenimiento urgente
        mantenimientos_urgentes = Incidencia.objects.filter(
            prioridad='urgente',
            estado__in=['reportada', 'asignada']
        )[:3]
        
        for incidencia in mantenimientos_urgentes:
            alertas_criticas.append({
                'tipo': 'mantenimiento',
                'mensaje': f'{incidencia.titulo} - {incidencia.descripcion[:50]}...',
                'prioridad': 'urgente',
                'timestamp': incidencia.created_at
            })
        
        # Alertas financieras
        facturas_morosas = Factura.objects.filter(
            estado='pendiente',
            fecha_vencimiento__lt=timezone.now().date() - timedelta(days=60)
        ).count()
        
        if facturas_morosas > 0:
            alertas_criticas.append({
                'tipo': 'financiero',
                'mensaje': f'{facturas_morosas} departamentos con morosidad superior a 60 días',
                'prioridad': 'media',
                'timestamp': timezone.now()
            })
        
        # Tickets activos por prioridad
        tickets_activos = []
        incidencias_activas = Incidencia.objects.filter(
            estado__in=['reportada', 'asignada', 'en_proceso']
        ).order_by('-prioridad')[:10]
        
        for incidencia in incidencias_activas:
            tickets_activos.append({
                'id': incidencia.id,
                'tipo': 'incidencia',
                'descripcion': incidencia.descripcion[:100] + '...' if len(incidencia.descripcion) > 100 else incidencia.descripcion,
                'prioridad': incidencia.prioridad,
                'estado': incidencia.estado,
                'fecha_reporte': incidencia.created_at
            })
        
        # Accesos recientes (últimas 2 horas)
        accesos_recientes = []
        accesos = Acceso.objects.filter(
            fecha_hora__gte=timezone.now() - timedelta(hours=2)
        ).order_by('-fecha_hora')[:10]
        
        for acceso in accesos:
            accesos_recientes.append({
                'usuario': acceso.usuario.get_full_name(),
                'tipo': acceso.usuario.role,
                'hora': acceso.fecha_hora.strftime('%H:%M'),
                'puerta': acceso.puerta,
                'metodo': acceso.metodo
            })
        
        # Comunicaciones recientes
        comunicaciones = []
        anuncios_recientes = Announcement.objects.filter(
            is_published=True
        ).order_by('-publish_date')[:5]
        
        for anuncio in anuncios_recientes:
            comunicaciones.append({
                'tipo': 'anuncio',
                'titulo': anuncio.title,
                'fecha': anuncio.publish_date.strftime('%Y-%m-%d'),
                'estado': 'activo'
            })
        
        # Métricas de engagement (encuestas)
        encuestas_recientes = Encuesta.objects.filter(
            fecha_fin__gte=timezone.now().date()
        )[:3]
        
        for encuesta in encuestas_recientes:
            total_votos = VotoEncuesta.objects.filter(encuesta=encuesta).count()
            comunicaciones.append({
                'tipo': 'encuesta',
                'titulo': encuesta.titulo,
                'fecha': encuesta.fecha_fin.strftime('%Y-%m-%d'),
                'participantes': total_votos
            })
        
        dashboard_data = {
            'kpis': kpis_financieros,
            'alertas': alertas_criticas,
            'tickets_activos': tickets_activos,
            'accesos_recientes': accesos_recientes,
            'comunicaciones': comunicaciones,
            'timestamp': timezone.now().isoformat()
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def financial_reports(request):
    """Reportes financieros detallados"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'administrador':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Facturación del mes actual
        mes_actual = timezone.now().month
        ano_actual = timezone.now().year
        
        facturacion_mensual = Factura.objects.filter(
            fecha_emision__month=mes_actual,
            fecha_emision__year=ano_actual
        ).aggregate(
            total=Sum('monto_total'),
            cantidad=Count('id')
        )
        
        # Pagos del mes
        pagos_mensuales = Pago.objects.filter(
            fecha_pago__month=mes_actual,
            fecha_pago__year=ano_actual
        ).aggregate(
            total=Sum('monto'),
            cantidad=Count('id')
        )
        
        # Morosidad detallada
        morosidad_detalle = Factura.objects.filter(
            estado='pendiente'
        ).values('residente__departamento__numero').annotate(
            total_mora=Sum('monto_total'),
            cantidad=Count('id')
        ).order_by('-total_mora')[:10]
        
        report_data = {
            'facturacion_mensual': facturacion_mensual,
            'pagos_mensuales': pagos_mensuales,
            'morosidad_detalle': list(morosidad_detalle),
            'periodo': f'{mes_actual}/{ano_actual}'
        }
        
        return Response(report_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)