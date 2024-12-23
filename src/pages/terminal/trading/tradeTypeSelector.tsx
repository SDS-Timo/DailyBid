import React from 'react'

import { Box, Grid } from '@chakra-ui/react'

interface TradeTypeSelectorProps {
  tradeType: string
  handleTradeTypeChange: (type: string) => void
}

const TradeTypeSelector: React.FC<TradeTypeSelectorProps> = ({
  tradeType,
  handleTradeTypeChange,
}) => {
  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={0}>
      <Box
        as="button"
        borderBottomWidth="2px"
        borderBottomColor={tradeType === 'buy' ? 'green.500' : 'transparent'}
        onClick={() => handleTradeTypeChange('buy')}
        textAlign="center"
        py={2}
        color="green.500"
        borderBottom="2px"
        borderColor={tradeType === 'buy' ? 'green.500' : 'transparent'}
        borderTop="none"
        borderLeft="none"
        borderRight="none"
        borderRadius="none"
      >
        BUY
      </Box>
      <Box
        as="button"
        borderBottomWidth="2px"
        borderBottomColor={tradeType === 'sell' ? 'red.500' : 'transparent'}
        onClick={() => handleTradeTypeChange('sell')}
        textAlign="center"
        py={2}
        color="red.500"
        borderBottom="2px"
        borderColor={tradeType === 'sell' ? 'red.500' : 'transparent'}
        borderTop="none"
        borderLeft="none"
        borderRight="none"
        borderRadius="none"
      >
        SELL
      </Box>
    </Grid>
  )
}

export default TradeTypeSelector
