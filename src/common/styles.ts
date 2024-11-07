import { useTheme, useColorMode } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { CSSObject } from '@emotion/react'

// bymax-react-select component styles

interface OptionState {
  isFocused: boolean
  isSelected: boolean
  isDisabled: boolean
}

interface ProvidedStyle {
  [key: string]: CSSObject | undefined
}

interface CustomStyles {
  [key: string]:
    | CSSObject
    | ((
        provided: ProvidedStyle,
        state: OptionState,
      ) => CSSObject | (() => CSSObject) | undefined)
}

const customStyles: CustomStyles = {
  control: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      backgroundColor: mode(
        theme.colors.grey['50'],
        theme.colors.grey['900'],
      )({ theme, colorMode }),

      borderColor: mode(
        theme.colors.grey['400'],
        theme.colors.grey['600'],
      )({ theme, colorMode }),
    }
  },
  option: (provided: ProvidedStyle, state: OptionState) => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['25']
          : theme.colors.grey['700'],
      backgroundColor: state.isFocused
        ? colorMode === 'dark'
          ? theme.colors.grey['600']
          : theme.colors.grey['200']
        : state.isSelected
          ? colorMode === 'dark'
            ? theme.colors.grey['700']
            : theme.colors.grey['300']
          : colorMode === 'dark'
            ? theme.colors.grey['900']
            : theme.colors.grey['50'],
      ':active': {
        ...provided[':active'],
        backgroundColor:
          !state.isDisabled &&
          (state.isSelected
            ? colorMode === 'dark'
              ? theme.colors.grey['800']
              : theme.colors.grey['400']
            : colorMode === 'dark'
              ? theme.colors.grey['600']
              : theme.colors.grey['200']),
      },
    }
  },
  singleValue: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['25']
          : theme.colors.grey['700'],
    }
  },
  multiValue: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      backgroundColor:
        colorMode === 'dark'
          ? theme.colors.grey['50']
          : theme.colors.grey['400'],
      color:
        colorMode === 'dark'
          ? theme.colors.grey['700']
          : theme.colors.grey['25'],
    }
  },
  multiValueLabel: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['700']
          : theme.colors.grey['25'],
    }
  },
  clearIndicator: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['600']
          : theme.colors.grey['100'],
    }
  },
  dropdownIndicator: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()

    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['600']
          : theme.colors.grey['400'],
    }
  },
  indicatorSeparator: () => {
    return {
      display: 'none',
    }
  },
  noOptionsMessage: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['300']
          : theme.colors.grey['700'],
    }
  },
  menu: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      backgroundColor:
        colorMode === 'dark'
          ? theme.colors.grey['900']
          : theme.colors.grey['50'],
      zIndex: '10',
    }
  },
  placeholder: () => {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    return {
      color:
        colorMode === 'dark'
          ? theme.colors.grey['100']
          : theme.colors.grey['900'],
    }
  },
}

export default customStyles
