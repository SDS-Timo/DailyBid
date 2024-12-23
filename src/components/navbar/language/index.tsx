import React from 'react'

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Image,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { LANGUAGES_OPTIONS } from '../../../constants/languages'
import { AppDispatch, RootState } from '../../../store'
import { setLanguage } from '../../../store/language'

type LanguagesOptionsType = typeof LANGUAGES_OPTIONS

const NavbarLanguages: React.FC = () => {
  const { t } = useTranslation()
  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')

  const selectedLanguageKey = useSelector((state: RootState) =>
    state.language.language?.substring(0, 2),
  )

  const selectedLanguage =
    LANGUAGES_OPTIONS[selectedLanguageKey as keyof LanguagesOptionsType]

  const dispatch: AppDispatch = useDispatch()

  const handleLanguageChange = (language: string) => {
    dispatch(setLanguage(language))
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        _hover={{ bg: 'transparent' }}
        _expanded={{ bg: 'transparent' }}
      >
        <Image
          src={selectedLanguage.icon}
          alt={selectedLanguage.name}
          style={{ width: '20px', height: '15px' }}
        />
      </MenuButton>
      <MenuList bg={bgColor} zIndex="10">
        {Object.keys(LANGUAGES_OPTIONS).map((key) => (
          <MenuItem
            key={LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].lng}
            _hover={{ bg: bgColorHover }}
            background={{ bg: bgColor }}
            fontSize="sm"
            onClick={() =>
              handleLanguageChange(
                LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].lng,
              )
            }
          >
            <Image
              src={LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].icon}
              alt={LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].name}
              style={{ width: '20px' }}
              mr={2}
            />
            {t(LANGUAGES_OPTIONS[key as keyof LanguagesOptionsType].name)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default NavbarLanguages
