const PDFDocument = require('pdfkit');
const { Alquiler, Venta, Propiedad, Cliente, Usuario } = require('../models');

// ========================================
// GENERAR CONTRATO DE ALQUILER
// ========================================
const generarContratoAlquiler = async (req, res) => {
    try {
        const alquiler = await Alquiler.findOne({
            where: { 
                id: req.params.id,
                activo: true
            },
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'descripcion', 'precio', 'tamaño']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ]
        });

        if (!alquiler) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Alquiler no encontrado' 
            });
        }

        // Solo generar PDF si está activo o finalizado
        if (alquiler.estado !== 'activo' && alquiler.estado !== 'finalizado') {
            return res.status(400).json({
                status: 400,
                message: 'El contrato solo está disponible para alquileres activos o finalizados'
            });
        }

        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'A4', 
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=contrato-alquiler-${alquiler.id}.pdf`);

        // Pipe del PDF a la respuesta
        doc.pipe(res);

        // ========== ENCABEZADO ==========
        doc.fontSize(24)
           .fillColor('#6B4423')
           .text('CONTRATO DE ALQUILER', { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#8B6F3F')
           .text(`Contrato N° ${alquiler.id}`, { align: 'center' })
           .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' })
           .moveDown(2);

        // ========== LÍNEA DIVISORIA ==========
        doc.strokeColor('#D4AF37')
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown(1.5);

        // ========== DATOS DEL ARRENDATARIO (CLIENTE) ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('DATOS DEL ARRENDATARIO', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Nombre: ${alquiler.Cliente?.Usuario?.nombre || 'N/A'}`)
           .text(`Documento: ${alquiler.Cliente?.documento_identidad || 'N/A'}`)
           .text(`Email: ${alquiler.Cliente?.Usuario?.email || 'N/A'}`)
           .text(`Teléfono: ${alquiler.Cliente?.telefono || 'N/A'}`)
           .moveDown(1.5);

        // ========== DATOS DEL INMUEBLE ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('DATOS DEL INMUEBLE', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Dirección: ${alquiler.Propiedad?.direccion || 'N/A'}`)
           .text(`Descripción: ${alquiler.Propiedad?.descripcion || 'Sin descripción'}`)
           .text(`Tamaño: ${alquiler.Propiedad?.tamaño || 'N/A'} m²`)
           .moveDown(1.5);

        // ========== TÉRMINOS DEL CONTRATO ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('TÉRMINOS DEL CONTRATO', { underline: true })
           .moveDown(0.5);

        const fechaInicio = new Date(alquiler.fecha_inicio).toLocaleDateString('es-AR');
        const fechaFin = new Date(alquiler.fecha_fin).toLocaleDateString('es-AR');

        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Fecha de inicio: ${fechaInicio}`)
           .text(`Fecha de finalización: ${fechaFin}`)
           .text(`Monto mensual: $${(alquiler.monto_mensual || 0).toLocaleString('es-AR')}`)
           .text(`Estado: ${alquiler.estado.toUpperCase()}`)
           .moveDown(1.5);

        // ========== CLÁUSULAS ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('CLÁUSULAS', { underline: true })
           .moveDown(0.5);

        doc.fontSize(9)
           .fillColor('#000000')
           .text('1. El arrendatario se compromete a pagar el monto mensual acordado antes del día 10 de cada mes.', { align: 'justify' })
           .moveDown(0.3)
           .text('2. El arrendatario se compromete a mantener el inmueble en buen estado de conservación.', { align: 'justify' })
           .moveDown(0.3)
           .text('3. Queda prohibida la cesión o subarriendo del inmueble sin autorización escrita del arrendador.', { align: 'justify' })
           .moveDown(0.3)
           .text('4. El arrendatario debe notificar cualquier daño o necesidad de reparación al arrendador.', { align: 'justify' })
           .moveDown(0.3)
           .text('5. La rescisión anticipada del contrato debe ser notificada con 30 días de antelación.', { align: 'justify' })
           .moveDown(2);

        // ========== PIE DE PÁGINA CON FIRMAS ==========
        const finalY = doc.page.height - 150;
        doc.y = finalY;

        doc.fontSize(10)
           .fillColor('#000000')
           .text('_________________________', 100, doc.y, { width: 150, align: 'center' })
           .text('Firma del Arrendador', 100, doc.y + 20, { width: 150, align: 'center' });

        doc.text('_________________________', 345, finalY, { width: 150, align: 'center' })
           .text('Firma del Arrendatario', 345, finalY + 20, { width: 150, align: 'center' });

        doc.moveDown(2);
        doc.fontSize(8)
           .fillColor('#8B6F3F')
           .text('Este documento es un contrato legalmente vinculante. Conserve una copia para sus registros.', { align: 'center' });

        // Finalizar PDF
        doc.end();

    } catch (error) {
        console.error('Error al generar contrato de alquiler:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al generar contrato de alquiler', 
            error: error.message 
        });
    }
};

// ========================================
// GENERAR BOLETO/RECIBO DE VENTA
// ========================================
const generarReciboVenta = async (req, res) => {
    try {
        const venta = await Venta.findOne({
            where: { 
                id: req.params.id,
                activo: true
            },
            include: [
                { 
                    model: Propiedad, 
                    attributes: ['id', 'direccion', 'descripcion', 'precio', 'tamaño'] 
                },
                { 
                    model: Cliente, 
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ]
        });

        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Venta no encontrada' 
            });
        }

        // Solo generar PDF si está finalizada
        if (venta.estado !== 'finalizada') {
            return res.status(400).json({
                status: 400,
                message: 'El recibo solo está disponible para ventas finalizadas'
            });
        }

        // Crear documento PDF
        const doc = new PDFDocument({ 
            size: 'A4', 
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=recibo-venta-${venta.id}.pdf`);

        // Pipe del PDF a la respuesta
        doc.pipe(res);

        // ========== ENCABEZADO ==========
        doc.fontSize(28)
           .fillColor('#D4AF37')
           .text('RECIBO DE VENTA', { align: 'center' })
           .moveDown(0.3);

        doc.fontSize(12)
           .fillColor('#6B4423')
           .text('BOLETO DE COMPRA-VENTA', { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#8B6F3F')
           .text(`Recibo N° ${venta.id.toString().padStart(8, '0')}`, { align: 'center' })
           .text(`Fecha: ${new Date(venta.fecha_venta).toLocaleDateString('es-AR')}`, { align: 'center' })
           .moveDown(2);

        // ========== LÍNEA DIVISORIA ==========
        doc.strokeColor('#D4AF37')
           .lineWidth(3)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown(2);

        // ========== CUADRO DE MONTO ==========
        const boxY = doc.y;
        doc.roundedRect(50, boxY, 495, 80, 10)
           .fillAndStroke('#2D5016', '#D4AF37')
           .lineWidth(2);

        doc.fontSize(12)
           .fillColor('#FFFFFF')
           .text('MONTO TOTAL DE LA OPERACIÓN', 60, boxY + 15, { width: 475, align: 'center' });

        doc.fontSize(32)
           .fillColor('#D4AF37')
           .text(`$${(venta.monto_total || 0).toLocaleString('es-AR')}`, 60, boxY + 35, { width: 475, align: 'center' });

        doc.moveDown(6);

        // ========== DATOS DEL COMPRADOR ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('DATOS DEL COMPRADOR', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Nombre completo: ${venta.Cliente?.Usuario?.nombre || 'N/A'}`)
           .text(`Documento de identidad: ${venta.Cliente?.documento_identidad || 'N/A'}`)
           .text(`Email: ${venta.Cliente?.Usuario?.email || 'N/A'}`)
           .text(`Teléfono: ${venta.Cliente?.telefono || 'N/A'}`)
           .moveDown(1.5);

        // ========== DATOS DEL INMUEBLE ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('DATOS DEL INMUEBLE ADQUIRIDO', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Dirección: ${venta.Propiedad?.direccion || 'N/A'}`)
           .text(`Descripción: ${venta.Propiedad?.descripcion || 'Sin descripción'}`)
           .text(`Superficie: ${venta.Propiedad?.tamaño || 'N/A'} m²`)
           .text(`Precio de venta: $${(venta.monto_total || 0).toLocaleString('es-AR')}`)
           .moveDown(1.5);

        // ========== DATOS DE LA TRANSACCIÓN ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('DETALLES DE LA TRANSACCIÓN', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#000000')
           .text(`Fecha de operación: ${new Date(venta.fecha_venta).toLocaleDateString('es-AR', { 
               weekday: 'long', 
               year: 'numeric', 
               month: 'long', 
               day: 'numeric' 
           })}`)
           .text(`Estado: ${venta.estado.toUpperCase()}`)
           .text(`Agente responsable: ${venta.Usuario?.nombre || 'N/A'}`)
           .moveDown(2);

        // ========== CONDICIONES ==========
        doc.fontSize(14)
           .fillColor('#2D5016')
           .text('CONDICIONES DE LA VENTA', { underline: true })
           .moveDown(0.5);

        doc.fontSize(9)
           .fillColor('#000000')
           .text('• El comprador declara haber recibido conforme el inmueble descrito en este documento.', { align: 'justify' })
           .moveDown(0.3)
           .text('• El vendedor garantiza que el inmueble se encuentra libre de gravámenes y deudas.', { align: 'justify' })
           .moveDown(0.3)
           .text('• La transferencia de dominio se realizará según las normativas legales vigentes.', { align: 'justify' })
           .moveDown(0.3)
           .text('• Este recibo constituye comprobante válido de la operación de compra-venta.', { align: 'justify' })
           .moveDown(2.5);

        // ========== PIE DE PÁGINA CON FIRMAS ==========
        const finalY = doc.page.height - 150;
        doc.y = finalY;

        doc.fontSize(10)
           .fillColor('#000000')
           .text('_________________________', 100, doc.y, { width: 150, align: 'center' })
           .text('Firma del Vendedor', 100, doc.y + 20, { width: 150, align: 'center' });

        doc.text('_________________________', 345, finalY, { width: 150, align: 'center' })
           .text('Firma del Comprador', 345, finalY + 20, { width: 150, align: 'center' });

        doc.moveDown(2);
        doc.fontSize(8)
           .fillColor('#8B6F3F')
           .text('Este documento es un comprobante legal de compra-venta. Conserve para sus registros.', { align: 'center' });

        // Finalizar PDF
        doc.end();

    } catch (error) {
        console.error('Error al generar recibo de venta:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al generar recibo de venta', 
            error: error.message 
        });
    }
};

module.exports = {
    generarContratoAlquiler,
    generarReciboVenta
};