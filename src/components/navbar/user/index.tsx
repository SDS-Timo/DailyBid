import React from 'react'

import {
  Flex,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUserLarge } from 'react-icons/fa6'
import { useSelector } from 'react-redux'

import { RootState } from '../../../store'

const NavbarUser: React.FC = () => {
  const bgColor = useColorModeValue('grey.100', 'grey.900')
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
    </Flex>
  )
}

export default NavbarUser
