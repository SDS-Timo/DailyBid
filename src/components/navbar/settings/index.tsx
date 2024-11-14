import React, { useState } from 'react'

import { SettingsIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Flex,
  Box,
  Menu,
  MenuButton,
  MenuList,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import CanisterIdSettings from './canisterIdSettings'
import DerivationOriginSettings from './derivationOriginSettings'
import DoubleConfirmationSettings from './doubleConfirmation'
import LoginDurationSettings from './loginDurationSettings'
import { RootState } from '../../../store'

const NavbarSettings: React.FC = () => {
  const bgColor = useColorModeValue('grey.100', 'grey.900')

  const [isSelectOpen, setIsSelectOpen] = useState(false)

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  return (
    <Flex alignItems="center" zIndex="10">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Settings"
          icon={<SettingsIcon />}
          variant="unstyled"
          _hover={{ bg: 'transparent' }}
          _focus={{ outline: 'none' }}
        />
        <MenuList bg={bgColor} p={4} w="350px">
          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left">
                    Backend Canister ID
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <CanisterIdSettings />
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left">
                    Internet Identity Login Duration
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} h={isSelectOpen ? '320px' : ''}>
                <Box
                  w="100%"
                  onClick={() => {
                    setIsSelectOpen(!isAuthenticated)
                  }}
                >
                  <LoginDurationSettings
                    onSelectBlur={() => setIsSelectOpen(false)}
                  />
                </Box>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left">
                    Internet Identity Derivation Origin
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <DerivationOriginSettings />
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left">
                    Double Confirmation Settings
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <DoubleConfirmationSettings />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default NavbarSettings
