import {
  Box,
  Divider,
  Heading,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { SelectInput } from 'components/SelectInput'
import { ComponentLog, ListData } from 'types'
import { formatDate } from 'utils/date'

export interface ComponentHistoricProps {
  logs: ListData<ComponentLog>
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onTypeChange: (type: ComponentLog['type']) => void
  onSortByChange: (sortBy: string) => void
  onSortOrderChange: (sortOrder: 'ASC' | 'DESC') => void
}

const logLabelMap = {
  approval: 'Aprovação',
  creation: 'Criação',
  draft_update: 'Atualização',
}

export const ComponentHistoric: React.FC<ComponentHistoricProps> = ({
  logs,
  currentPage,
  totalPages,
  onPageChange,
  onTypeChange,
  onSortByChange,
  onSortOrderChange,
}) => {
  const form = useForm({
    defaultValues: {
      type: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
  })

  const hasPreviousPage = currentPage >= 1
  const hasNextPage = currentPage + 1 < totalPages
  const selectedType = form.watch('type')
  const selectedSortBy = form.watch('sortBy')
  const selectedSortOrder = form.watch('sortOrder')

  useEffect(() => {
    onTypeChange(selectedType as ComponentLog['type'])
  }, [selectedType])

  useEffect(() => {
    onSortByChange(selectedSortBy)
  }, [selectedSortBy])

  useEffect(() => {
    onSortOrderChange(selectedSortOrder as 'ASC' | 'DESC')
  }, [selectedSortOrder])

  return (
    <Box h='full'>
      <HStack w='fit-content' mb={6} spacing={4} alignItems='flex-end'>
        <Box minW='220px'>
          <SelectInput
            name='type'
            label='Tipo de operação'
            control={form.control}
          >
            <option value=''>Todos</option>
            <option value='approval'>Aprovação</option>
            <option value='creation'>Criação</option>
            <option value='draft_update'>Atualização</option>
          </SelectInput>
        </Box>

        <Box minW='180px'>
          <SelectInput name='sortBy' label='Ordenar por' control={form.control}>
            <option value='createdAt'>Data</option>
            <option value='type'>Operação</option>
            <option value='updatedBy'>Nome</option>
          </SelectInput>
        </Box>

        <Box minW='180px'>
          <SelectInput
            name='sortOrder'
            label='Direção'
            control={form.control}
          >
            <option value='DESC'>Decrescente</option>
            <option value='ASC'>Crescente</option>
          </SelectInput>
        </Box>
      </HStack>

      <Box
        overflow='hidden'
        color='black'
        borderWidth={1}
        borderRadius={4}
        sx={{
          '.table-cell': {
            width: '150px',
          },
          '.table-row': {
            display: 'flex',
            flexFlow: 'row wrap',
          },
        }}
      >
        <Box borderBottomWidth={1} py={4} px={4} className='table-row'>
          <Heading width={300} size='sm'>
            Nome
          </Heading>
          <Heading className='table-cell' size='sm'>
            Operação
          </Heading>
          <Heading className='table-cell' size='sm'>
            Data
          </Heading>
        </Box>

        <Box maxH='300px' overflow='auto'>
          {logs.results.map(log => (
            <Box key={log.id}>
              <Box py={4} px={4} className='table-row'>
                <Box width={300}>
                  <Text>{log.user?.name}</Text>
                </Box>
                <Box className='table-cell'>
                  <Text>{logLabelMap[log.type] || 'Indefinido'}</Text>
                </Box>
                <Box className='table-cell'>
                  <Text>{formatDate(log.createdAt)}</Text>
                </Box>
              </Box>

              <Divider />
            </Box>
          ))}
        </Box>

        <Box borderTopWidth={1} px={4} py={4}>
          <HStack justifyContent='flex-end'>
            <Box>
              {totalPages > 0 && (
                <Text>
                  {currentPage + 1} de {totalPages}
                </Text>
              )}
            </Box>

            <IconButton
              disabled={!hasPreviousPage}
              icon={<MdChevronLeft />}
              aria-label='Anterior'
              onClick={() => onPageChange(currentPage - 1)}
            />
            <IconButton
              disabled={!hasNextPage}
              icon={<MdChevronRight />}
              aria-label='Próximo'
              onClick={() => onPageChange(currentPage + 1)}
            />
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}
