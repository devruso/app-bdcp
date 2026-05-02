import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import {
  Box,
  CircularProgress,
  Divider,
  Flex,
  Heading,
  HStack,
  List,
  Select,
  Text,
  VStack,
  useBreakpointValue,
  useBoolean,
} from '@chakra-ui/react'
import { debounce } from 'lodash'
import React, { useState, useEffect, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Outlet, useParams } from 'react-router-dom'

import api from 'api'
import { Search } from 'components/Search'
import { useAuth } from 'contexts/auth'
import { useDispatch, useSelector } from 'store'
import {
  cleanComponents,
  componentsAdded,
  selectAllComponents,
  selectComponentByCode,
} from 'store/components'
import { ListFilter } from 'types'

import { ComponentListItem } from './ComponentListItem'
import { ComponentPlaceholder } from './ComponentPlaceholder'

export interface ComponentListPageProps {}

interface ComponentListFilter extends ListFilter {
  page: number
  limit: number
  search?: string
}

const initialFilter: ComponentListFilter = {
  page: 0,
  limit: 10,
  sortBy: 'code',
  sortOrder: 'ASC',
}

export const ComponentListPage: React.FC<ComponentListPageProps> = () => {
  const auth = useAuth()
  const dispatch = useDispatch()
  const params = useParams()

  const componentCode = params.componentCode?.toUpperCase() || ''

  const components = useSelector(selectAllComponents)
  const totalComponents = useSelector(state => state.components.total)

  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState(componentCode)
  const [filter, setFilter] = useState<ComponentListFilter>({
    ...initialFilter,
    search: searchText,
  })
  const [sidebarOpen, setSidebarOpen] = useBoolean(true)

  const isMd = useBreakpointValue({ base: true, lg: false })
  const debouncedSetFilter = useMemo(() => debounce(setFilter, 300), [])

  const component = useSelector(state =>
    selectComponentByCode(state, componentCode)
  )

  const getComponents = async () => {
    const response = await api.component.getComponents(filter)

    if (filter.page === 0) {
      dispatch(cleanComponents())
    }

    dispatch(componentsAdded(response))
  }

  const loadMore = () => setFilter({ ...filter, page: filter.page + 1 })

  useEffect(() => {
    getComponents().finally(() => setLoading(false))
  }, [filter])

  useEffect(() => {
    if (loading) return

    setFilter({
      ...initialFilter,
      search: filter.search,
    })
  }, [auth.isAuthenticated])

  useEffect(() => {
    if (searchText === undefined) {
      return
    }

    const updatedFilter = {
      ...initialFilter,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      search: searchText || undefined,
    }

    debouncedSetFilter(updatedFilter)
  }, [searchText])

  return (
    <HStack flex={1} alignItems='stretch' overflow='hidden' spacing={0}>
      <Box
        position='relative'
        sx={{
          '.no-sidebar': {
            content: "' '",
            marginLeft: '.2rem',
          },
        }}
      >
        <Flex
          w='36px'
          h='36px'
          bgColor='gray.200'
          position='absolute'
          top='12px'
          right={sidebarOpen ? '-18px' : '-26px'}
          zIndex={100}
          borderRadius={18}
          alignItems='center'
          justifyContent='center'
          cursor='pointer'
          hidden={isMd}
          onClick={setSidebarOpen.toggle}
        >
          {sidebarOpen ? (
            <ChevronLeftIcon w='7' h='7' color='black' />
          ) : (
            <ChevronRightIcon w='7' h='7' color='black' />
          )}
        </Flex>

        <VStack
          hidden={!((isMd && !componentCode) || !isMd)}
          w={{ base: '100%', lg: '540px' }}
          h='100%'
          alignItems='stretch'
          flexShrink={0}
          spacing={0}
          transition='all 0.25s'
          marginLeft={!sidebarOpen ? '-540px' : '0px'}
        >
          <Box py={8} px={8} pb={4}>
            <Heading color='black'>Disciplinas</Heading>
            <Text color='black'>
              Encontre o conteúdo programático das disciplinas.
            </Text>
          </Box>

          <Box pt={4} py={8} px={8}>
            <VStack spacing={4} alignItems='stretch'>
              <Search value={searchText} onChangeValue={setSearchText} />

              <HStack alignItems='flex-end'>
                <Box flex={1}>
                  <Text color='gray.700' fontSize='sm' mb={2}>
                    Ordenar por
                  </Text>
                  <Select
                    size='lg'
                    variant='filled'
                    bgColor='gray.100'
                    value={filter.sortBy}
                    onChange={event =>
                      setFilter({
                        ...filter,
                        page: 0,
                        sortBy: event.target.value,
                      })
                    }
                  >
                    <option value='code'>Código</option>
                    <option value='name'>Nome</option>
                    <option value='department'>Departamento</option>
                    <option value='updatedAt'>Atualização</option>
                  </Select>
                </Box>

                <Box minW='180px'>
                  <Text color='gray.700' fontSize='sm' mb={2}>
                    Direção
                  </Text>
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
                    <option value='ASC'>Crescente</option>
                    <option value='DESC'>Decrescente</option>
                  </Select>
                </Box>
              </HStack>
            </VStack>
          </Box>

          <List
            id='component-list'
            px={8}
            pb={8}
            spacing={5}
            h='100%'
            overflowY='scroll'
          >
            <InfiniteScroll
              dataLength={components.length} // This is important field to render the next data
              next={loadMore}
              hasMore={loading || components.length < totalComponents}
              scrollThreshold={0.9}
              loader={
                <Flex py={6} flex={1} justifyContent='center'>
                  <CircularProgress color='primary.500' isIndeterminate />
                </Flex>
              }
              scrollableTarget='component-list'
              style={{ overflow: 'hidden' }}
            >
              {totalComponents > 0 ? (
                components.map(component => (
                  <ComponentListItem
                    key={component.code}
                    component={component}
                  />
                ))
              ) : (
                <Text textAlign='center'>Nenhuma disciplina encontrada.</Text>
              )}
            </InfiniteScroll>
          </List>
        </VStack>
      </Box>

      <Divider
        borderColor='gray.200'
        orientation='vertical'
        borderLeftWidth={2}
      />

      {((isMd && !!componentCode) || !isMd) && component ? (
        <Outlet
          context={{
            component,
            refreshComponent: () => setFilter({ ...filter }),
          }}
        />
      ) : (
        <ComponentPlaceholder />
      )}
    </HStack>
  )
}
