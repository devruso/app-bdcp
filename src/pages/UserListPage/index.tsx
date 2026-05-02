import {
  Container,
  Heading,
  Text,
  Box,
  HStack,
  Select,
  Button,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

import api from 'api'
import { Search } from 'components/Search'
import { ListData, ListFilter, User } from 'types'

import { InviteModal } from './InviteModal'
import { UsersTable } from './UsersTable'

export interface UserListFilter extends ListFilter {}

const initialFilter: UserListFilter = {
  page: 0,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
}

export const UserListPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [filter, setFilter] = useState<UserListFilter>(initialFilter)

  const [users, setUsers] = useState<ListData<User>>({
    results: [],
    total: 0,
  })

  const [inviteToken, setInviteToken] = useState('')

  const { isOpen, onOpen, onClose } = useDisclosure()

  const getUsers = async () => {
    const users = await api.user.getUsers(filter)

    setUsers({
      results: users.results,
      total: users.total,
    })
  }

  const generateInvite = async () => {
    setLoading(true)

    await api.user
      .generateInvite()
      .then(setInviteToken)
      .then(onOpen)
      .finally(() => setInviting(false))
  }

  const deleteUserById = async (userId: string) => {
    await api.user.deleteUserById(userId)
    await getUsers()
  }

  useEffect(() => {
    if (loading) return

    getUsers().finally(() => setLoading(false))
  }, [filter])

  return (
    <Container maxW='container.xl'>
      <HStack alignItems='center' justifyContent='space-between'>
        <Box py={8}>
          <Heading color='black'>Usuários</Heading>
          <Text color='black'>
            Visualize todos os usuários cadastrados no sistema.
          </Text>
        </Box>

        <Box>
          <Tooltip label='Clique para gerar um convite para um usuário novo.'>
            <Button
              colorScheme='primary'
              disabled={inviting}
              isLoading={inviting}
              onClick={generateInvite}
            >
              Gerar convite
            </Button>
          </Tooltip>
        </Box>
      </HStack>

      <HStack pb={8} spacing={4} alignItems='flex-end'>
        <Box flex={1}>
          <Search
            value={filter.search}
            placeholder='Nome ou e-mail do usuário'
            onChangeValue={search =>
              setFilter({ ...filter, page: 0, search: search || undefined })
            }
          />
        </Box>

        <Box minW='220px'>
          <Text mb={2} color='gray.700' fontSize='sm'>Ordenar por</Text>
          <Select
            size='lg'
            variant='filled'
            bgColor='gray.100'
            value={filter.sortBy}
            onChange={event =>
              setFilter({ ...filter, page: 0, sortBy: event.target.value })
            }
          >
            <option value='createdAt'>Data de cadastro</option>
            <option value='name'>Nome</option>
            <option value='email'>E-mail</option>
            <option value='role'>Tipo</option>
          </Select>
        </Box>

        <Box minW='180px'>
          <Text mb={2} color='gray.700' fontSize='sm'>Direção</Text>
          <Select
            size='lg'
            variant='filled'
            bgColor='gray.100'
            value={filter.sortOrder}
            onChange={event =>
              setFilter({
                ...filter,
                page: 0,
                sortOrder: event.target.value as 'ASC' | 'DESC',
              })
            }
          >
            <option value='DESC'>Decrescente</option>
            <option value='ASC'>Crescente</option>
          </Select>
        </Box>
      </HStack>

      <UsersTable
        users={users}
        currentPage={filter.page}
        totalPages={Math.ceil(users.total / filter.limit)}
        onPageChange={page => setFilter({ ...filter, page })}
        onRemoveUser={user => deleteUserById(user.id)}
      />

      <InviteModal
        link={`http://${window.location.host}/cadastrar/${inviteToken}`}
        open={isOpen}
        onClose={onClose}
      />
    </Container>
  )
}
