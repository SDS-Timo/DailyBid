import React from 'react'

import { Button, Heading, Text, Box } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useDispatch } from 'react-redux'

import { AppDispatch } from '../../store'
import { identityAuthenticate } from '../../utils/authUtils'

const LoginII: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  const handleClick = async () => {
    await identityAuthenticate(dispatch, 'ICT')
  }

  return (
    <Box textAlign="center">
      <Helmet title="DailyBid - Internet Identity Login" />
      <Heading as="h1" size="2xl" fontWeight="bold" mb={4}>
        Internet Identity
      </Heading>
      <Text fontSize="lg" fontWeight="normal" mb={8}>
        Click the button below to log in with Internet Identity.
      </Text>
      <Button colorScheme="blue" size="lg" onClick={handleClick}>
        Login
      </Button>
    </Box>
  )
}

export default LoginII
