import React from 'react'

import { Container, Box, Flex, Text } from '@chakra-ui/react'

//import useWindow from '../hooks/useWindow'

const Footer: React.FC = () => {
  //const { getIsTelegramApp } = useWindow()
  //const isTelegramApp = getIsTelegramApp()

  return (
    <footer className="footer">
      <Container maxW="auto">
        <Flex justifyContent="space-between" alignItems="center">
          <Box></Box>
          <Box>
            <Text fontSize="12px" textAlign="right">
              &copy; {new Date().getFullYear()} -{' '}
              <a href="/" className="text-muted">
                Daily-Bid.com
              </a>
            </Text>
          </Box>
        </Flex>
      </Container>
    </footer>
  )
}

export default Footer
