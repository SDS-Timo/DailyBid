import { Button, Flex, Icon, Text } from '@chakra-ui/react'
import { FiArrowDownLeft, FiArrowUpRight } from 'react-icons/fi'

interface ActionButtonProps {
  action: 'deposit' | 'withdraw'
  text: string
  bgColor: string
  bgColorHover: string
  fontColor: string
  onClick: () => void
}

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  text,
  bgColor,
  bgColorHover,
  fontColor,
  onClick,
}) => {
  return (
    <Button
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      color={fontColor}
      width={150}
      height="80px"
      _hover={{
        bg: bgColorHover,
      }}
      onClick={onClick}
    >
      <Flex
        align="center"
        justify="center"
        borderRadius="full"
        boxSize="40px"
        bg="rgba(255, 255, 255, 0.4)"
        boxShadow="0 0 8px rgba(0, 0, 0, 0.2)"
      >
        <Icon
          data-testid="icon"
          as={action === 'deposit' ? FiArrowDownLeft : FiArrowUpRight}
          boxSize={6}
        />
      </Flex>
      <Text mt={2}>{text}</Text>
    </Button>
  )
}

export default ActionButton
