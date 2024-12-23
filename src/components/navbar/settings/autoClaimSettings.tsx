import React, { useEffect, useState } from 'react'

import { Box } from '@chakra-ui/react'
import { Select } from 'bymax-react-select'

import customStyles from '../../../common/styles'
import { Option } from '../../../types'

interface AutoClaimSettingsProps {
  onSelectBlur?: () => void
}

const AutoClaimSettings: React.FC<AutoClaimSettingsProps> = ({
  onSelectBlur,
}) => {
  const [selectedTime, setSelectedTime] = useState<Option | null>(null)

  const selectOptions = [
    { id: '0', value: 'disabled', label: 'Disabled' },
    { id: '1', value: '1', label: '1 min' },
    { id: '2', value: '2', label: '2 min' },
    { id: '5', value: '5', label: '5 min' },
    { id: '10', value: '10', label: '10 min' },
  ]

  const handleAutoClaimOptionChange = (option: Option | Option[] | null) => {
    const optionValue =
      Array.isArray(option) && option.length > 0
        ? option[0]
        : (option as Option | null)

    if (optionValue && optionValue !== undefined && optionValue.value) {
      localStorage.setItem('selectedTimeAutoClaimInterval', optionValue.value)
      setSelectedTime(optionValue)
    }
  }

  useEffect(() => {
    const storedTime = localStorage.getItem('selectedTimeAutoClaimInterval')

    if (storedTime) {
      const foundOption = selectOptions.find(
        (option) => option.value === storedTime,
      )

      if (foundOption) {
        setSelectedTime(foundOption)
      } else {
        setSelectedTime(null)
      }
    } else {
      setSelectedTime(null)
    }
  }, [])

  return (
    <Box>
      <Select
        id="autoClaimInterval"
        value={selectedTime}
        isMulti={false}
        isClearable={false}
        options={selectOptions}
        placeholder="Select the interval"
        noOptionsMessage="No data"
        onChange={handleAutoClaimOptionChange}
        onFormikBlur={() => {
          if (onSelectBlur) {
            onSelectBlur()
          }
        }}
        styles={customStyles as any}
      />
    </Box>
  )
}

export default AutoClaimSettings
