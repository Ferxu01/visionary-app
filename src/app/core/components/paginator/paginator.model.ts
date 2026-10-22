export interface PageEvent {
  pageIndex: number; // Página actual (basada en índice 0)
  pageSize: PageSize; // Cantidad de elementos por página
  length: number; // Total de elementos en la BD
}

export type PageSize = 5 | 10 | 25 | 50;
