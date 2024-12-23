import { Flex, Icon, Tooltip } from '@chakra-ui/react'
import { FiArrowDownLeft, FiArrowUpRight, FiArrowLeft } from 'react-icons/fi'

interface ActionIconProps {
  action: 'deposit' | 'withdrawal' | 'withdrawalRollback'
}

const getActionText = (
  action: 'deposit' | 'withdrawal' | 'withdrawalRollback',
): string => {
  switch (action) {
    case 'deposit':
      return 'Deposit'
    case 'withdrawal':
      return 'Withdrawal'
    case 'withdrawalRollback':
      return 'Withdrawal Rollback'
    default:
      return ''
  }
}

const ActionIcon: React.FC<ActionIconProps> = ({ action }) => {
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center">
      <Tooltip label={getActionText(action)} fontSize="md">
        <Flex>
          <Icon
            data-testid="icon"
            as={
              action === 'deposit'
                ? FiArrowDownLeft
                : action === 'withdrawal'
                  ? FiArrowUpRight
                  : FiArrowLeft
            }
            boxSize={6}
          />
        </Flex>
      </Tooltip>
    </Flex>
  )
}

export default ActionIcon
