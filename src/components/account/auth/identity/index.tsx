import React from 'react'

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Box,
  Flex,
  Button,
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux'

import useWindow from '../../../../hooks/useWindow'
import { AppDispatch } from '../../../../store'
import {
  identityAuthenticate,
  generatePublicKey,
} from '../../../../utils/authUtils'

interface IdentityComponentProps {
  onClose: () => void
  currentIndex: number | null
  onAccordionChange: (index: number) => void
}

const IdentityComponent: React.FC<IdentityComponentProps> = ({
  onClose,
  currentIndex,
  onAccordionChange,
}) => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.900', 'grey.25')
  const borderColor = useColorModeValue('grey.300', 'grey.700')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')

  const { getIsTelegramApp } = useWindow()
  const { isTelegram, isTelegramWeb } = getIsTelegramApp()
  const dispatch = useDispatch<AppDispatch>()

  const handleClick = async () => {
    if (isTelegram && !isTelegramWeb) {
      const { identity, publicKey } = generatePublicKey()
      localStorage.setItem('identity', JSON.stringify(identity.toJSON()))

      window.Telegram.WebApp.openLink(
        //window.open(
        `${process.env.ENV_LOGIN_II_PROXY_PAGE_LINK}?sessionKey=${publicKey}`,
      )
    } else {
      await identityAuthenticate(dispatch, 'IC')
    }
    onClose()
  }

  return (
    <Accordion
      allowToggle
      index={currentIndex === 0 ? [0] : []}
      onChange={() => onAccordionChange(0)}
    >
      <AccordionItem border="none">
        <Box
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          <h2>
            <AccordionButton _expanded={{ bg: bgColor, color: fontColor }}>
              <Box as="span" flex="1" textAlign="left">
                Internet Identity
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel p={4}>
            <Flex direction="column">
              <Button
                background={bgColor}
                variant="solid"
                h="58px"
                color={fontColor}
                _hover={{
                  bg: bgColorHover,
                  color: fontColor,
                }}
                isDisabled={false}
                onClick={handleClick}
              >
                Log in
              </Button>
            </Flex>
          </AccordionPanel>
        </Box>
      </AccordionItem>
    </Accordion>
  )
}

export default IdentityComponent
