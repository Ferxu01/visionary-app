import { Injectable } from '@angular/core';

export interface PathologyInfo {
  name: string;
  description: string;
}

export interface EyePartDetail {
  id: string;
  name: string;
  description: string;
  pathologies: PathologyInfo[];
  images: string[];
}

@Injectable({ providedIn: 'root' })
export class EyeInfoService {
  private readonly db: Record<string, EyePartDetail> = {
    ojo: {
      id: 'ojo',
      name: 'Globo Ocular (Ojo)',
      description:
        'El globo ocular es el órgano principal del sistema visual. Recibe las imágenes del exterior y las transforma en impulsos eléctricos que se envían al cerebro a través del nervio óptico.',
      pathologies: [
        {
          name: 'Miopía',
          description: 'Anomalía del ojo que produce una visión borrosa de los objetos lejanos.',
        },
        {
          name: 'Glaucoma',
          description: 'Enfermedad del ojo caracterizada por un aumento de la presión intraocular.',
        },
      ],
      images: ['https://picsum.photos/300/200?random=1', 'https://picsum.photos/300/200?random=2'],
    },
    cornea: {
      id: 'cornea',
      name: 'Córnea',
      description: 'Capa transparente e incolora que cubre la parte delantera del ojo.',
      pathologies: [
        {
          name: 'Queratocono',
          description: 'Afección en la que la córnea se adelgaza y sobresale en forma de cono.',
        },
      ],
      images: ['https://picsum.photos/300/200?random=3'],
    },
  };

  /**
   * Obtiene la información de la parte del ojo según su ID/Nombre.
   * Si no la encuentra, retorna la información general 'ojo' por defecto.
   */
  getInfoByPartId(partId: string | null): EyePartDetail | null {
    if (!partId) return null;
    const key = partId.toLowerCase().trim();
    return this.db[key] || this.db['ojo'];
  }
}
