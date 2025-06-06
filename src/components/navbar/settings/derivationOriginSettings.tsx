import React, { useEffect, useCallback } from 'react'

import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  Button,
  Spinner,
  Text,
  useToast,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import * as Yup from 'yup'

import { RootState } from '../../../store'
import { getInternetIdentityDerivationOrigin } from '../../../utils/canisterUtils'

const DerivationOriginSettings: React.FC<{ isMenuOpen: boolean }> = ({
  isMenuOpen,
}) => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const buttonBgColor = useColorModeValue('grey.500', 'grey.600')
  const fontColor = useColorModeValue('grey.25', 'grey.25')
  const { t } = useTranslation()
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const validateAndFormatInput = useCallback((input: string) => {
    const canisterIdRegex =
      /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3}$/
    const fullUrlRegex =
      /^https:\/\/([a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3})\.icp0\.io(\/.*)?$/

    if (canisterIdRegex.test(input)) {
      return { url: `https://${input}.icp0.io`, canisterId: input }
    }

    const match = input.match(fullUrlRegex)
    if (match) {
      const canisterId = match[1]
      const hasPath = !!match[2]

      return {
        url: input,
        canisterId: hasPath ? input : canisterId,
      }
    }

    throw new Error(
      t('Invalid input. Please provide a valid canister ID or a full URL.'),
    )
  }, [])

  const initialValues = {
    canisterId: '',
    submit: false,
  }

  const validationSchema = Yup.object().shape({
    canisterId: Yup.string()
      .required(t('Canister ID or full URL is required'))
      .test('is-valid-canister-id', 'Invalid Canister ID', function (value) {
        if (!value) return false
        try {
          validateAndFormatInput(value)
          return true
        } catch {
          return false
        }
      })
      .typeError(t('Invalid Canister ID format')),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        const { url } = validateAndFormatInput(values.canisterId)
        localStorage.setItem('auctionDerivationOrigin', url)

        toast({
          title: t('Internet Identity Derivation Origin'),
          description: t('Saved successfully'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        setStatus({ success: true })
        setSubmitting(false)
      } catch (error) {
        setStatus({ success: false })
        setSubmitting(false)

        formik.setFieldError('canisterId', t('Canister ID save error'))
      }
    },
  })

  useEffect(() => {
    if (isMenuOpen) {
      const localStorageCanisterId = getInternetIdentityDerivationOrigin()
      const { canisterId } = validateAndFormatInput(localStorageCanisterId)
      formik.setFieldValue('canisterId', canisterId)
    }
  }, [isMenuOpen])

  return (
    <>
      <Tooltip
        label={t('Log out to change')}
        isDisabled={!isAuthenticated}
        aria-label="Log out to change"
      >
        <InputGroup>
          <FormControl variant="floating">
            <Input
              h="58px"
              placeholder=" "
              name="canisterId"
              sx={{
                borderRadius: '5px',
                paddingRight: '60px',
              }}
              isInvalid={
                !!formik.errors.canisterId && formik.touched.canisterId
              }
              isReadOnly={isAuthenticated}
              value={formik.values.canisterId}
              onChange={(e) => formik.handleChange(e)}
            />
            <FormLabel color="grey.500" fontSize="15px">
              {t('Canister ID or full URL')}
            </FormLabel>
          </FormControl>
          <InputRightElement h="100%" w="45px" p="0">
            <Flex direction="column" h="100%" w="100%">
              <Button
                h="100%"
                fontSize="11px"
                borderRadius="0 5px 5px 0"
                bgColor="grey.500"
                color="grey.25"
                _hover={{ bg: 'grey.400', color: 'grey.25' }}
                isDisabled={isAuthenticated}
                onClick={() => {
                  const { canisterId } = validateAndFormatInput(
                    `${process.env.ENV_AUTH_DERIVATION_ORIGIN}`,
                  )
                  formik.setFieldValue('canisterId', canisterId)
                }}
              >
                {t('Default')}
              </Button>
            </Flex>
          </InputRightElement>
        </InputGroup>
      </Tooltip>
      {!!formik.errors.canisterId && formik.touched.canisterId && (
        <Text color="red.500" fontSize="12px">
          {formik.errors.canisterId}
        </Text>
      )}
      {!isAuthenticated && (
        <Flex direction="column" mt={4}>
          <Button
            background={buttonBgColor}
            variant="solid"
            h="58px"
            color={fontColor}
            _hover={{
              bg: bgColorHover,
              color: fontColor,
            }}
            isDisabled={formik.isSubmitting || isAuthenticated}
            onClick={() => formik.handleSubmit()}
          >
            {formik.isSubmitting ? (
              <>
                {t('Save')} <Spinner ml={2} size="sm" color={fontColor} />
              </>
            ) : (
              t('Save')
            )}
          </Button>
        </Flex>
      )}
    </>
  )
}

export default DerivationOriginSettings
