import React from 'react'

import { Button, Heading, Text, Box } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const Page500: React.FC = () => {
  return (
    <Box textAlign="center">
      <Helmet title="500 Error" />
      <Heading as="h1" size="2xl" fontWeight="bold" mb={4}>
        500
      </Heading>
      <Text fontSize="xl" fontWeight="normal" mb={4}>
        Internal server error.
      </Text>
      <Text fontSize="lg" fontWeight="normal" mb={8}>
        The server encountered something unexpected that didn&apos;t allow it to
        complete the request.
      </Text>
      <Link to="/">
        <Button colorScheme="blue" size="lg">
          Return to website
        </Button>
      </Link>
    </Box>
  )
}

export default Page500
