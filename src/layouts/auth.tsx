import React, { ReactNode } from 'react'

import { Container, Flex } from '@chakra-ui/react'

import Main from '../components/main'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Main>
      <Flex justifyContent="center" alignItems="center" h="100vh">
        <Container maxW="100%" display="flex" justifyContent="center">
          {children}
        </Container>
      </Flex>
    </Main>
  )
}

export default AuthLayout
