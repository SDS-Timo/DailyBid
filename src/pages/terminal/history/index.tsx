import React, { useState } from 'react'

import { Box, TabList, Tab, TabPanels, TabPanel, Tabs } from '@chakra-ui/react'

import PriceHistory from './history'
import PriceInfo from './prices'

const HistoryTabs: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <Tabs
      index={selectedTab}
      onChange={(index) => setSelectedTab(index)}
      borderColor="transparent"
    >
      <TabList>
        <Tab
          _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
          _focus={{ boxShadow: 'none' }}
          _active={{ background: 'transparent' }}
        >
          Price History
        </Tab>
        <Tab
          _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
          _focus={{ boxShadow: 'none' }}
          _active={{ background: 'transparent' }}
        >
          Price Info
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Box>
            <PriceHistory />
          </Box>
        </TabPanel>
        <TabPanel>
          <Box>
            <PriceInfo />
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export default HistoryTabs
