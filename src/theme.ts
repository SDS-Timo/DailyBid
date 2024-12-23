import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

interface ThemeProps {
  theme: ThemeConfig & { breakpoints?: Record<string, string> }
}

const activeLabelStyles = {
  transform: 'scale(0.85) translateY(-24px)',
  opacity: 0.8,
  fontSize: '13px',
  top: '7px',
}

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  fonts: {
    heading: 'var(--font-opensans)',
    body: 'var(--font-opensans)',
  },
  colors: {
    blue: {
      '50': '#edf8ff',
      '100': '#d6edff',
      '200': '#b5e1ff',
      '300': '#83d0ff',
      '400': '#48b5ff',
      '500': '#1e91ff',
      '600': '#0670ff',
      '700': '#005afa',
      '800': '#0847c5',
      '900': '#0d409b',
    },
    grey: {
      '25': '#ffffff',
      '50': '#efefef',
      '100': '#dadada',
      '200': '#c6c6c6',
      '250': '#b2b2b2',
      '300': '#9e9e9e',
      '400': '#8a8a8a',
      '450': '#757575',
      '500': '#616161',
      '600': '#4d4d4d',
      '700': '#343434',
      '800': '#1A1A1A',
      '900': '#101010',
    },
    yellow: {
      '50': '#FDFDF6',
      '100': '#F9F8E1',
      '200': '#F2F0BB',
      '300': '#EAE894',
      '400': '#E3DF6E',
      '500': '#DCD649',
      '600': '#C5BF26',
      '700': '#96921D',
      '800': '#626013',
      '900': '#33320A',
    },
    red: {
      '50': '#fff0f0',
      '100': '#ffdddd',
      '200': '#ffc0c0',
      '300': '#ff9494',
      '400': '#ff5757',
      '500': '#B81C1C',
      '600': '#991b1b',
      '700': '#7f1d1d',
      '800': '#681818',
      '900': '#5c1414',
    },
  },
  styles: {
    global: (props: ThemeProps) => ({
      body: {
        bg: mode('grey.25', 'grey.900')(props),
        color: mode('grey.900', 'grey.200')(props),
      },
      button: {
        color: 'inherit',
      },
    }),
  },
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles,
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label':
              {
                ...activeLabelStyles,
              },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'transparent',
              pointerEvents: 'none',
              mx: 3,
              my: 4,
              transformOrigin: 'left top',
              transition: 'opacity 0.1s',
            },
          },
        },
      },
    },
    Drawer: {
      baseStyle: (props: ThemeProps) => ({
        dialog: {
          bg: mode('grey.25', 'grey.900')(props),
        },
      }),
    },
    Checkbox: {
      baseStyle: (props: ThemeProps) => ({
        control: {
          borderColor: mode('grey.400', 'grey.600')(props),
          _hover: {
            borderColor: mode('grey.800', 'grey.200')(props),
          },
          _focus: {
            borderColor: mode('grey.700', 'grey.200')(props),
          },
        },
      }),
    },
    Input: {
      variants: {
        outlineCustom: (props: ThemeProps) => ({
          field: {
            ...theme.components.Input.variants.outline(props).field,
            borderColor: mode('grey.400', 'grey.600')(props),
            _hover: {
              borderColor: mode('grey.800', 'grey.200')(props),
            },
            _focus: {
              borderColor: mode('grey.700', 'grey.200')(props),
            },
            _placeholder: {
              color: mode('grey.500', 'grey.500')(props),
            },
          },
        }),
      },
      defaultProps: {
        variant: 'outlineCustom',
      },
    },
  },
})

export default theme
