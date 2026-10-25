export interface ApiResponse<T> {
  items: T[];
  page: Pagination;
}

export interface Pagination {
  desde: number; // Offset de inicio
  registropp: number; // Registros por página
  total: number; // Total en la búsqueda
}

export const DEFAULT_PAGINATION: Pagination = {
  desde: 0,
  registropp: 10,
  total: 0,
};

export const mapApiData = <T>(data: T[]): ApiResponse<T> => {
  return {
    items: data,
    page: {
      ...DEFAULT_PAGINATION,
      total: data.length,
    },
  };
};

export const getDataItems = <T>(data: ApiResponse<T>): T[] => {
  return data.items;
};
