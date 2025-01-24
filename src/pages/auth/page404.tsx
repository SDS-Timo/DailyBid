import React from 'react'

import { Button, Heading, Text, Box } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const Page404: React.FC = () => {
  return (
    <Box textAlign="center">
      <Helmet title="404 Error" />
      <Heading as="h1" size="2xl" fontWeight="bold" mb={4}>
        404
      </Heading>
      <Text fontSize="xl" fontWeight="normal" mb={4}>
        Page not found.
      </Text>
      <Text fontSize="lg" fontWeight="normal" mb={8}>
        The page you are looking for might have been removed.
      </Text>
      <Link to="/">
        <Button colorScheme="blue" size="lg">
          Return to website
        </Button>
      </Link>
    </Box>
  )
}

export default Page404
