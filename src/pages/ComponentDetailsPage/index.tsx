import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Heading,
  HStack,
  TabList,
  Tab as ChakraTab,
  TabPanels,
  TabPanel,
  Tabs,
  Text,
  VStack,
  Stack,
  StackDirection,
  useBreakpointValue,
  Switch,
  useBoolean,
  useDisclosure,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { saveAs } from 'file-saver'

import api from 'api'
import {
  ApproveModalForm,
  ApproveModalFormValues,
} from 'components/ApproveModalForm'
import { useAuth } from 'contexts/auth'
import { AppError } from 'errors'
import { useComponentAttrs } from 'hooks/useComponent'
import { Component, ComponentLog, ListData, ListFilter } from 'types'
import {
  getStudentWorkload,
  getTeacherWorkload,
  getModuleWorkload,
} from 'utils/component'

import { ComponentOverview as Overview } from './ComponentOverview'
import { ComponentHistoric as Historic } from './ComponentHistoric'

export interface ComponentLogListFilter extends ListFilter {
  type?: ComponentLog['type']
}

const initialFilter: ComponentLogListFilter = {
  page: 0,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
}

const Tab: React.FC = ({ children }) => {
  return (
    <ChakraTab
      color='gray.500'
      _selected={{
        color: 'secondary.700',
        bgColor: 'secondary.500',
      }}
    >
      {children}
    </ChakraTab>
  )
}

export const ComponentDetailsPage: React.FC = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const { component, refreshComponent } = useDetails()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isLoading, setLoading] = useState(false)
  const [publishedVersion, setPublishedVersion] = useBoolean()
  const [filter, setFilter] = useState<ComponentLogListFilter>(initialFilter)

  const [componentLogs, setComponentLogs] = useState<ListData<ComponentLog>>({
    results: [],
    total: 0,
  })

  const direction = useBreakpointValue<StackDirection>({
    base: 'column',
    md: 'row',
  })
  const isMd = useBreakpointValue({ base: true, lg: false })

  const {
    code,
    name,
    department,
    semester,
    modality,
    program,
    objective,
    syllabus,
    methodology,
    learningAssessment,
    bibliography,
    prerequeriments,
    workload,
  } = useComponentAttrs(component, publishedVersion)

  const studentWorkload = getStudentWorkload(workload)
  const teacherWorkload = getTeacherWorkload(workload)
  const moduleWorkload = getModuleWorkload(workload)

  const getComponentLogs = async () => {
    try {
      const componentLogs = await api.component.getComponentLogs(
        component!.id,
        filter
      )

      setComponentLogs({
        results: componentLogs.results,
        total: componentLogs.total,
      })
    } catch (err) {
      const error = err as AppError

      if (error.statusCode === 401) {
        navigate('/entrar')
      }
    }
  }

  const handlePublish = async (data: ApproveModalFormValues) => {
    if (!component?.draft?.id) return

    try {
      await api.componentDraft.approveComponentDraft(component?.draft?.id, {
        agreementDate: data.agreementDate,
        agreementNumber: data.agreementNumber,
      })

      toast({
        position: 'top',
        description: 'Disciplina publicada com sucesso!',
        status: 'success',
      })

      refreshComponent?.()

      onClose()
    } catch (err) {
      const error = err as AppError

      toast({
        position: 'top',
        description: error.message,
        status: 'error',
      })
    }
  }

  const exportComponent = async () => {
    if (!component?.id) return

    try {
      setLoading(true)

      const blob = await api.component.exportComponent(component.id)
      saveAs(blob, `${component.name}-${new Date().toISOString()}.pdf`)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return

    getComponentLogs().finally(() => setLoading(false))
  }, [filter])

  return (
    <VStack w='100%' h='100%' spacing={0} alignItems='stretch'>
      <Box hidden={!isMd} pt={4} px={8}>
        <ArrowBackIcon
          cursor='pointer'
          fontSize='2xl'
          onClick={() => navigate('/disciplinas')}
        />
      </Box>

      <Stack
        py={8}
        px={8}
        pb={4}
        direction={direction}
        spacing={6}
        alignItems={{ base: 'flex-start', md: 'center' }}
      >
        <Box flex={1}>
          <Heading color='black'>{code}</Heading>
          <Text color='black' fontSize='xl' fontWeight='medium'>
            {name}
          </Text>
        </Box>

        <VStack alignItems='flex-end' spacing={2}>
          <HStack>
            <Link
              hidden={!auth.isAuthenticated}
              to={`/disciplinas/${component?.code.toLowerCase()}/editar`}
            >
              <Tooltip label='Clique para editar o conteúdo desta disciplina.'>
                <Button colorScheme='yellow'>Editar</Button>
              </Tooltip>
            </Link>
            <Tooltip label='Clique para exportar o conteúdo desta disciplina.'>
              <Button
                isLoading={isLoading}
                onClick={exportComponent}
                colorScheme='red'
              >
                Exportar
              </Button>
            </Tooltip>
            <Tooltip label='Clique para publicar o conteúdo desta disciplina.'>
              <Button
                hidden={!auth.isAuthenticated}
                onClick={onOpen}
                colorScheme='primary'
              >
                Publicar
              </Button>
            </Tooltip>
          </HStack>

          <Tooltip
            label={
              !publishedVersion
                ? 'Clique para visualizar o conteúdo publicado desta disciplina.'
                : 'Clique para visualizar o conteúdo em rascunho desta disciplina.'
            }
          >
            <HStack
              hidden={!auth.isAuthenticated}
              onClick={setPublishedVersion.toggle}
            >
              <Text>Visualizar versão publicada</Text>
              <Switch
                isChecked={publishedVersion}
                onChange={setPublishedVersion.toggle}
              />
            </HStack>
          </Tooltip>
        </VStack>
      </Stack>

      <Tabs
        as={VStack}
        pt={4}
        flex={1}
        variant='soft-rounded'
        colorScheme='primary'
        spacing={4}
        display='flex'
        alignItems='stretch'
        overflow='hidden'
      >
        <TabList px={8}>
          <Tab>Visão Geral</Tab>
          {auth.isAuthenticated && <Tab>Histórico</Tab>}
        </TabList>

        <TabPanels h='100%' pb={8}>
          <TabPanel h='100%' px={8}>
            <Overview
              department={department}
              semester={semester}
              modality={modality}
              program={program}
              objective={objective}
              syllabus={syllabus}
              methodology={methodology}
              learningAssessment={learningAssessment}
              bibliography={bibliography}
              prerequeriments={prerequeriments.split(',')}
              studentWorkload={studentWorkload}
              teacherWorkload={teacherWorkload}
              moduleWorkload={moduleWorkload}
              isActive={publishedVersion === true}
            />
          </TabPanel>

          <TabPanel h='100%' px={8}>
            {!!component?.logs && (
              <Historic
                logs={componentLogs}
                currentPage={filter.page}
                totalPages={Math.ceil(componentLogs.total / filter.limit)}
                onPageChange={page => setFilter({ ...filter, page })}
                onTypeChange={type => setFilter({ ...filter, page: 0, type })}
                onSortByChange={sortBy =>
                  setFilter({ ...filter, page: 0, sortBy })
                }
                onSortOrderChange={sortOrder =>
                  setFilter({ ...filter, page: 0, sortOrder })
                }
              />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ApproveModalForm
        componentCode={component?.code || ''}
        open={isOpen}
        onClose={onClose}
        onSubmit={handlePublish}
      />
    </VStack>
  )
}

const useDetails = () =>
  useOutletContext<{
    component?: Component
    refreshComponent?: () => Promise<void>
  }>()
