import { api } from 'services'
import { ListData, ListFilter, User } from 'types'

export const getUsers = async (filter: ListFilter): Promise<ListData<User>> => {
  const response = await api.get<ListData<User>>(`/users`, {
    params: {
      page: filter.page,
      limit: filter.limit,
      search: filter.search?.trim(),
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
    },
  })

  return {
    results: response.data.results,
    total: response.data.total,
    meta: response.data.meta,
  }
}

export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`)

  return response.data
}

export const generateInvite = async (): Promise<string> => {
  const response = await api.get('/invite/generate')

  return response.data.token
}

export const deleteUserById = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`)
}
