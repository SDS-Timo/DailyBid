import React, { useState } from 'react'

import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
} from '@chakra-ui/react'

type CustomSliderProps = {
  values: number[]
  currentValue: number
  defaultValue?: number
  isDisabled?: boolean
  step?: number
  unit?: string
  colorScheme?: string
  tooltipBgColor?: string
  tooltipTextColor?: string
  fontSize?: string
  onChangeValue: (value: number) => void
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  values,
  currentValue,
  defaultValue = 0,
  isDisabled = false,
  step = 1,
  unit = '',
  colorScheme = 'teal',
  tooltipBgColor = 'teal.500',
  tooltipTextColor = 'white',
  fontSize = 'sm',
  onChangeValue,
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const min = Math.min(...values)
  const max = Math.max(...values)

  const handleChange = (value: number) => {
    if (onChangeValue) {
      onChangeValue(value)
    }
  }

  return (
    <Slider
      isDisabled={isDisabled}
      min={min}
      max={max}
      step={step}
      value={currentValue}
      defaultValue={defaultValue}
      colorScheme={colorScheme}
      onChange={handleChange}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {values.map((value, index) => (
        <SliderMark
          key={index}
          value={value}
          mt="1"
          ml="-2.5"
          fontSize={fontSize}
        >
          {value}
          {unit}
        </SliderMark>
      ))}

      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        data-testid="slider-tooltip"
        hasArrow
        bg={tooltipBgColor}
        color={tooltipTextColor}
        placement="top"
        isOpen={showTooltip}
        label={`${currentValue}${unit}`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  )
}

export default CustomSlider
