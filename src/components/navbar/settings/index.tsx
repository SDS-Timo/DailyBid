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
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import AdvancedSettings from './advanced'
import AutoClaimSettings from './autoClaimSettings'
import CanisterIdSettings from './canisterIdSettings'
import DerivationOriginSettings from './derivationOriginSettings'
import FullWithdrawalSettings from './fullWithdrawalSettings'
import LoginDurationSettings from './loginDurationSettings'
import RequireConfirmationSettings from './requireConfirmation'
import { RootState } from '../../../store'

const NavbarSettings: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bgColor = useColorModeValue('grey.100', 'grey.900')

  const [isSelectOpenAutoClaim, setIsSelectOpenAutoClaim] = useState(false)
  const [isSelectOpenLoginDuration, setIsSelectOpenLoginDuration] =
    useState(false)

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  return (
    <Flex alignItems="center" zIndex="10">
      <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
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
                    Auto Claim
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} h={isSelectOpenAutoClaim ? '280px' : ''}>
                <Box
                  w="100%"
                  onClick={() => {
                    setIsSelectOpenAutoClaim(true)
                  }}
                >
                  <AutoClaimSettings
                    onSelectBlur={() => setIsSelectOpenAutoClaim(false)}
                  />
                </Box>
              </AccordionPanel>
            </AccordionItem>

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
                    Advanced
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <AdvancedSettings />
              </AccordionPanel>
            </AccordionItem>

            {isAuthenticated && (
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Flex flex="1" textAlign="left">
                      Full Withdrawal
                    </Flex>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <FullWithdrawalSettings />
                </AccordionPanel>
              </AccordionItem>
            )}

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Flex flex="1" textAlign="left">
                    Require Confirmation
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <RequireConfirmationSettings />
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
              <AccordionPanel
                pb={4}
                h={isSelectOpenLoginDuration ? '320px' : ''}
              >
                <Box
                  w="100%"
                  onClick={() => {
                    setIsSelectOpenLoginDuration(!isAuthenticated)
                  }}
                >
                  <LoginDurationSettings
                    onSelectBlur={() => setIsSelectOpenLoginDuration(false)}
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
                <DerivationOriginSettings isMenuOpen={isOpen} />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default NavbarSettings
