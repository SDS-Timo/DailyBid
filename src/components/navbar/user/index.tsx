import React from 'react'

import {
  Flex,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Tooltip,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUserLarge } from 'react-icons/fa6'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store'

const NavbarUser: React.FC = () => {
  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const bgCircleColor = useColorModeValue('grey.25', 'grey.900')
  const borderColor = useColorModeValue('grey.900', 'grey.200')

  const userPoints = useSelector((state: RootState) => state.auth.userPoints)

  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )

  return (
    <Flex alignItems="center" mr={2} zIndex="10">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Info"
          icon={
            <Flex alignItems="center">
              <FaUserLarge />
              <Text fontSize="14px" ml={2}>
                {userPrincipal.slice(0, 4)}
              </Text>
            </Flex>
          }
          variant="unstyled"
          _hover={{ bg: 'transparent' }}
          _focus={{ outline: 'none' }}
        />
        <MenuList bg={bgColor} p={4}>
          <Box>
            <Text as="strong" fontSize="14px">
              Do not send funds here!
            </Text>
            <Text fontSize="13px">{`User principal: ${userPrincipal}`}</Text>
          </Box>
        </MenuList>
      </Menu>
      {typeof userPoints === 'number' && !isNaN(userPoints) && (
        <Box ml={4}>
          <Flex alignItems="center" justifyContent="center">
            <Tooltip label="Points balance" aria-label="Points balance tooltip">
              <Box
                px={1}
                bg={bgCircleColor}
                borderRadius="full"
                borderWidth="2px"
                borderColor={borderColor}
                borderStyle="solid"
                display="flex"
                alignItems="center"
                justifyContent="center"
                minW="23px"
              >
                <Text fontSize="13px" fontWeight="bold">
                  {userPoints.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Text>
              </Box>
            </Tooltip>
          </Flex>
        </Box>
      )}
    </Flex>
  )
}

export default NavbarUser
