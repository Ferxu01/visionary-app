import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { EyeInfoService, EyePartDetail, PathologyInfo } from './eye-info.service';
// import infoPartesOjo from 'assets/json/infoPartesOjo.json';

// interface PathologyData {
//   name?: string;
//   description?: string;
//   symptoms?: string[];
//   causas_y_tratamiento?: {
//     causas?: string[];
//     tratamiento?: string;
//   };
//   images?: string[];
// }

// interface PartInfoData {
//   description?: string;
//   pathologies?: PathologyData[];
//   images?: string[];
//   corteHistologico?: string[];
// }

@Injectable({ providedIn: 'root' })
export class ExportInfoService {
  private readonly eyeInfoService = inject(EyeInfoService);

  /**
   * Genera un reporte en PDF con la información anatómica y descarga un ZIP con las imágenes asociadas.
   * @param partName Nombre o identificador de la parte del ojo.
   */
  async downloadInfoAsPDFAndZip(partName: string): Promise<void> {
    const normalizedName = partName.trim().toLowerCase().replace(/_\d+$/, '');

    const info = this.eyeInfoService.getInfoByPartId(partName);
    if (!info) return alert('No hay información para descargar.');

    // 1. Generar y guardar PDF
    const pdf = this.buildPDF(info, normalizedName);
    pdf.save(`${normalizedName || 'informacion_ojo'}.pdf`);

    // 2. Generar y guardar ZIP de imágenes
    await this.downloadImagesZip(info, normalizedName);
  }

  /**
   * Construye el documento PDF formateado.
   */
  private buildPDF(info: EyePartDetail, titleName: string): jsPDF {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxLineWidth = pageWidth - 2 * margin;

    let y = 20;

    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Información sobre la parte del ojo', margin, y);

    y += 10;
    doc.setFontSize(12);
    doc.text(info.name || titleName || 'Desconocido', margin, y);

    y += 10;
    doc.setFont('helvetica', 'normal');

    // Descripción
    if (info.description) {
      y = this.addTextGroup(
        doc,
        `Descripción: ${info.description}`,
        margin,
        y,
        maxLineWidth,
        pageHeight,
      );
      y += 5;
    }

    // Sección de Patologías
    if (info.pathologies?.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Patologías:', margin, y);
      y += 8;

      info.pathologies.forEach((pathology, idx) => {
        y = this.renderPathologyItem(doc, pathology, idx + 1, margin, y, maxLineWidth, pageHeight);
      });
    } else {
      doc.text('No hay patologías disponibles.', margin, y);
    }

    return doc;
  }

  /**
   * Renderiza una patología individual comprobando el límite vertical de la página.
   */
  private renderPathologyItem(
    doc: jsPDF,
    pathology: PathologyInfo,
    index: number,
    margin: number,
    startY: number,
    maxWidth: number,
    pageHeight: number,
  ): number {
    let y = startY;

    // Nombre patología
    doc.setFont('helvetica', 'bold');
    y = this.addTextGroup(doc, `${index}. ${pathology.name}`, margin, y, maxWidth, pageHeight);

    // Descripción
    doc.setFont('helvetica', 'normal');
    if (pathology.description) {
      y = this.addTextGroup(
        doc,
        `Descripción: ${pathology.description}`,
        margin,
        y,
        maxWidth,
        pageHeight,
      );
    }

    return y + 5;
  }

  /**
   * Escribe bloques de texto en el PDF calculando si se requiere agregar una nueva página.
   */
  private addTextGroup(
    doc: jsPDF,
    text: string,
    margin: number,
    yPos: number,
    maxWidth: number,
    pageHeight: number,
  ): number {
    const lines = doc.splitTextToSize(text, maxWidth);
    const textHeight = lines.length * 6;

    if (yPos + textHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(lines, margin, yPos);
    return yPos + textHeight;
  }

  /**
   * Compila todas las imágenes en carpetas organizadas en un archivo ZIP.
   */
  private async downloadImagesZip(info: EyePartDetail, folderName: string): Promise<void> {
    const zip = new JSZip();
    const tasks: Promise<void>[] = [];

    // Galería principal
    if (info.images?.length) {
      const imgFolder = zip.folder(`${folderName}/imagenes`);
      this.appendImagesToFolder(imgFolder, info.images, 'imagen', tasks);
    }

    // Imágenes de patologías
    info.pathologies?.forEach((pathology, idx) => {
      const pathName = (pathology.name || `patologia_${idx + 1}`)
        .replace(/\s+/g, '_')
        .toLowerCase();
      // Si la patología contiene imágenes

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pathologyImages = (pathology as any).images as string[] | undefined;
      if (pathologyImages?.length) {
        const pathFolder = zip.folder(`${folderName}/patologias/${pathName}`);
        this.appendImagesToFolder(pathFolder, pathologyImages, 'patologia', tasks);
      }
    });

    if (!tasks.length) return;

    await Promise.all(tasks);

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${folderName || 'imagenes_ojo'}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Helper para descargar imágenes remotas e insertarlas dentro del ZIP.
   */
  private appendImagesToFolder(
    folder: JSZip | null,
    urls: string[],
    prefix: string,
    tasks: Promise<void>[],
  ): void {
    if (!folder) return;

    urls.forEach((url, i) => {
      const task = fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          folder.file(`${prefix}_${i + 1}.jpg`, blob);
        })
        .catch((err) => console.error(`Error descargando imagen desde ${url}:`, err));

      tasks.push(task);
    });
  }
}
