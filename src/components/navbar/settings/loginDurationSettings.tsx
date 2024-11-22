import React, { useEffect, useState } from 'react'

import { Box, Tooltip } from '@chakra-ui/react'
import { Select } from 'bymax-react-select'
import { useSelector } from 'react-redux'

import customStyles from '../../../common/styles'
import { RootState } from '../../../store'
import { Option } from '../../../types'

interface LoginDurationSettingsProps {
  onSelectBlur?: () => void
}

const LoginDurationSettings: React.FC<LoginDurationSettingsProps> = ({
  onSelectBlur,
}) => {
  const [selectedTime, setSelectedTime] = useState<Option | null>(null)

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const selectOptions = [
    { id: '1', value: '1', label: '1h' },
    { id: '3', value: '3', label: '3h' },
    { id: '12', value: '12', label: '12h' },
    { id: '24', value: '24', label: '1d' },
    { id: '168', value: '168', label: '7d' },
    { id: '720', value: '720', label: '30d' },
  ]

  const handleLoginDurationOptionChange = (
    option: Option | Option[] | null,
  ) => {
    const optionValue =
      Array.isArray(option) && option.length > 0
        ? option[0]
        : (option as Option | null)

    if (optionValue && optionValue !== undefined && optionValue.value) {
      localStorage.setItem(
        'selectedTimeLoginDurationInterval',
        optionValue.value,
      )
      setSelectedTime(optionValue)
    }
  }

  useEffect(() => {
    const storedTime = localStorage.getItem('selectedTimeLoginDurationInterval')

    if (storedTime) {
      const selectedOption = selectOptions.find(
        (option) => option.value === storedTime,
      )
      setSelectedTime(selectedOption || null)
    } else {
      setSelectedTime(null)
    }
  }, [])

  return (
    <>
      <Tooltip
        label="Log out to change"
        isDisabled={!isAuthenticated}
        aria-label="Log out to change"
      >
        <Box>
          <Select
            id="loginDuration"
            value={selectedTime}
            isMulti={false}
            isClearable={false}
            options={selectOptions}
            isLocked={isAuthenticated}
            placeholder="Select the login duration"
            noOptionsMessage="No data"
            onChange={handleLoginDurationOptionChange}
            onFormikBlur={() => {
              if (onSelectBlur) {
                onSelectBlur()
              }
            }}
            styles={customStyles as any}
          />
        </Box>
      </Tooltip>
    </>
  )
}

export default LoginDurationSettings
