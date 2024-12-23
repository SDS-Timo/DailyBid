import React, { useState } from 'react'

import {
  Box,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai'
import { useSelector, useDispatch } from 'react-redux'

import OpenOrders from './openOrders'
import TradeHistory from './tradeHistory'
import { RootState, AppDispatch } from '../../../store'
import { setIsResizeUserData } from '../../../store/uiSettings'

const UserData: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const dispatch = useDispatch<AppDispatch>()

  const isResizeUserData = useSelector(
    (state: RootState) => state.uiSettings.isResizeUserData,
  )

  const bgColor = useColorModeValue('grey.200', 'grey.700')
  const fontColor = useColorModeValue('grey.700', 'grey.25')

  return (
    <Box>
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
            Open Orders
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Trade History
          </Tab>
          <IconButton
            aria-label="Resize"
            onClick={() => dispatch(setIsResizeUserData())}
            icon={
              isResizeUserData ? (
                <AiOutlineFullscreenExit size="20px" />
              ) : (
                <AiOutlineFullscreen size="20px" />
              )
            }
            size="sm"
            variant="ghost"
            position="absolute"
            right={0}
            top={0}
            borderRadius="0"
            _hover={{
              bg: bgColor,
              color: fontColor,
            }}
          />
        </TabList>
        <TabPanels>
          <TabPanel>
            <OpenOrders />
          </TabPanel>
          <TabPanel>
            <TradeHistory />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default UserData
