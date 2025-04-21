import React from 'react'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import QRCode from 'react-qr-code'

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  title: string
  subtitle?: string
  onCopy: () => void
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  value,
  title,
  subtitle,
  onCopy,
}) => {
  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const subFontColor = useColorModeValue('grey.500', 'grey.300')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const qrCodeBg = useColorModeValue('white', 'white')
  const qrCodeFg = useColorModeValue('black', 'black')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} color={fontColor}>
        <ModalHeader bg={bgColor} borderTopRadius="md">
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pt={6} pb={6}>
          <Flex direction="column" align="center" justify="center">
            <Box p={4} bg={qrCodeBg} borderRadius="md">
              <QRCode
                value={value}
                size={220}
                bgColor={qrCodeBg}
                fgColor={qrCodeFg}
              />
            </Box>
            <Text
              mt={4}
              fontWeight="medium"
              fontSize="sm"
              wordBreak="break-all"
              textAlign="center"
              onClick={onCopy}
              cursor="pointer"
              p={1}
              border="1px solid transparent"
              borderRadius="md"
              _hover={{
                borderColor: bgColorHover,
                borderRadius: 'md',
              }}
            >
              {value}
            </Text>
            {subtitle && (
              <Text
                mt={2}
                fontSize="xs"
                color={subFontColor}
                textAlign="center"
              >
                {subtitle}
              </Text>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default QrCodeModal
