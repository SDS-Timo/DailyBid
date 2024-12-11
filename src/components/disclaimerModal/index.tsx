import React, { useState } from 'react'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Checkbox,
  Button,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

interface DisclaimerProps {
  isOpen: boolean
  onClose: () => void
}

const Disclaimer: React.FC<DisclaimerProps> = ({ isOpen, onClose }) => {
  const bgColor = useColorModeValue('grey.50', 'grey.900')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const bgColorButton = useColorModeValue('grey.100', 'grey.800')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const [accepted, setAccepted] = useState(false)

  const handleAcceptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccepted(e.target.checked)
  }

  const handleClose = () => {
    if (accepted) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(6px)"
        data-testid="chakra-modal__overlay"
      />
      <ModalContent bg={bgColor}>
        <ModalHeader textAlign="center">Welcome to DailyBid</ModalHeader>
        <ModalBody>
          <Text mb={4} textAlign="center">
            Please note: This is an early access alpha version.
          </Text>
          <Text mb={6} textAlign="center">
            By proceeding, you acknowledge that this is a alpha release and
            accept responsibility for any potential loss of funds due to bugs or
            errors.
          </Text>
          <Checkbox isChecked={accepted} onChange={handleAcceptChange}>
            I acknowledge that this is an early access alpha and accept
            responsibility for any loss of funds due to bugs.
          </Checkbox>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            bg={bgColorButton}
            _hover={{
              bg: bgColorHover,
              color: fontColor,
            }}
            isDisabled={!accepted}
            onClick={handleClose}
          >
            Accept & Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default Disclaimer
