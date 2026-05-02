export interface ListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  search?: string
  sortBy?: string
  sortOrder?: string
  filters?: Record<string, unknown>
}

export interface ListData<T> {
  results: T[]
  total: number
  meta?: ListMeta
}
