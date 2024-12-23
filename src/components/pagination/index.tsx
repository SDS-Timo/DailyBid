import { Flex, IconButton, Text } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface PaginationProps {
  canPreviousPage: boolean
  canNextPage: boolean
  previousPage: () => void
  nextPage: () => void
  bgColor: string
  fontColor: string
  fontSize: string
  currentPage: number
}

const Pagination: React.FC<PaginationProps> = ({
  canPreviousPage,
  canNextPage,
  previousPage,
  nextPage,
  bgColor,
  fontColor,
  fontSize,
  currentPage,
}) => {
  return (
    <Flex
      mt={4}
      justifyContent="space-between"
      alignItems="center"
      fontSize={fontSize}
    >
      <Text mr={4}>Page: {currentPage + 1}</Text>
      <Flex alignItems="center">
        <IconButton
          aria-label="Previous Page"
          icon={<FiChevronLeft />}
          onClick={previousPage}
          isDisabled={!canPreviousPage}
          size="xs"
          borderRadius="0px"
          bg={bgColor}
          color={fontColor}
        />
        <IconButton
          aria-label="Next Page"
          icon={<FiChevronRight />}
          onClick={nextPage}
          isDisabled={!canNextPage}
          size="xs"
          borderRadius="0px"
          bg={bgColor}
          color={fontColor}
        />
      </Flex>
    </Flex>
  )
}

export default Pagination
