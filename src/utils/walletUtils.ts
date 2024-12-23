import { Result } from '../types'

/**
 * Gets a user-friendly error message for a notify deposit error.
 *
 * @param error - An object representing the notify deposit error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageNotifyDeposits = (error: Result): string => {
  const errorMessages: { [key: string]: string } = {
    NotAvailable: '',
    CallLedgerError: 'Call Ledger Error',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}

/**
 * Gets a user-friendly error message for a withdraw error.
 *
 * @param error - An object representing the withdraw error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageWithdraw = (error: Result): string => {
  const errorMessages: { [key: string]: string } = {
    AmountBelowMinimum: 'Amount Below Minimum',
    InsufficientCredit: 'Insufficient Credit',
    CallLedgerError: 'Call Ledger Error',
    BadFee: 'Badfee. Please retry.',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}

/**
 * Gets a user-friendly error message for a deposit error.
 *
 * @param error - An object representing the withdraw error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageDeposit = (error: Result): string => {
  const errorMessages: { [key: string]: string | ((err: any) => string) } = {
    TransferError: (err) => (err?.message ? err.message : 'Transfer Error'),
    AmountBelowMinimum: 'Amount Below Minimum',
    CallLedgerError: 'Call Ledger Error',
    BadFee: 'Badfee. Please retry.',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      const messageOrFunction = errorMessages[key]

      if (typeof messageOrFunction === 'function') {
        return messageOrFunction(error[key])
      }

      return messageOrFunction as string
    }
  }

  return 'Something went wrong'
}

/**
 * Formats a wallet address by displaying the first 4 characters,
 * followed by ellipsis (...), and the last 3 characters.
 *
 * @param address - The wallet address to format.
 * @returns The formatted wallet address.
 */
export function formatWalletAddress(address: string): string {
  if (address.length <= 9) {
    return address
  }
  return `${address.slice(0, 5)}...${address.slice(-3)}`
}
