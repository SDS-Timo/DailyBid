import React, { useState } from 'react'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'

import IdentityComponent from './auth/identity'
import MnemonicComponent from './auth/mnemonic'
import NfidComponent from './auth/nfid'
import SeedComponent from './auth/seed'
import WalletComponent from './wallet'
import { RootState } from '../../store'
import { logout } from '../../store/auth'

interface AccountComponentProps {
  isOpen: boolean
  onClose: () => void
}

const AccountComponent: React.FC<AccountComponentProps> = ({
  isOpen,
  onClose,
}) => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const handleLogout = () => {
    dispatch(logout())
    onClose()
  }

  const handleAccordionChange = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index)
  }

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton
            _hover={{
              bg: bgColorHover,
            }}
          />
          {isAuthenticated ? (
            <DrawerHeader>Account details</DrawerHeader>
          ) : (
            <DrawerHeader>Log in to Auction with</DrawerHeader>
          )}

          <DrawerBody>
            {isAuthenticated ? (
              <WalletComponent />
            ) : (
              <Box>
                <Box>
                  <IdentityComponent
                    onClose={onClose}
                    currentIndex={activeIndex}
                    onAccordionChange={() => handleAccordionChange(0)}
                  />
                </Box>
                <Box mt={4}>
                  <NfidComponent
                    onClose={onClose}
                    currentIndex={activeIndex}
                    onAccordionChange={() => handleAccordionChange(1)}
                  />
                </Box>
                <Box mt={4}>
                  <SeedComponent
                    onClose={onClose}
                    currentIndex={activeIndex}
                    onAccordionChange={() => handleAccordionChange(2)}
                  />
                </Box>
                <Box mt={4}>
                  <MnemonicComponent
                    onClose={onClose}
                    currentIndex={activeIndex}
                    onAccordionChange={() => handleAccordionChange(3)}
                  />
                </Box>
              </Box>
            )}
          </DrawerBody>

          <DrawerFooter>
            {isAuthenticated && (
              <Box flex="1" textAlign="right">
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AccountComponent
