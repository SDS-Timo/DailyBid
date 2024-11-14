import React, { ReactNode } from 'react'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string | ReactNode
  confirmText?: string
  cancelText?: string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  description = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} color={fontColor}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Text>{description}</Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            _hover={{
              bg: bgColorHover,
              color: fontColor,
            }}
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant="ghost"
            _hover={{
              bg: bgColorHover,
              color: fontColor,
            }}
            onClick={onConfirm}
            ml={3}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmationModal
