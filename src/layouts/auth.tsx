import React, { ReactNode } from 'react'

import { Container, Flex } from '@chakra-ui/react'

import Main from '../components/main'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Main>
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Container>{children}</Container>
      </Flex>
    </Main>
  )
}

export default AuthLayout
