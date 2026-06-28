export interface ApiError {
  detail: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}