import { SearchIcon } from '@chakra-ui/icons'
import { Box, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import React from 'react'

export interface SearchProps {
  value?: string
  onChangeValue?: (value: string) => void
  placeholder?: string
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChangeValue,
  placeholder = 'Código ou nome da disciplina',
}) => {
  return (
    <Box>
      <InputGroup>
        <Input
          h='64px'
          px={6}
          pr={14}
          borderWidth={2}
          borderColor='transparent'
          bgColor='gray.100'
          placeholder={placeholder}
          value={value}
          onChange={event => onChangeValue?.(event.target.value)}
          _focus={{ borderWidth: 2, borderColor: 'primary.500' }}
        />
        <InputRightElement h='100%' color='gray.500' mr={4}>
          <SearchIcon />
        </InputRightElement>
      </InputGroup>
    </Box>
  )
}
