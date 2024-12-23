import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'

import { columns, data } from '../../../__mocks__/paginationTableMock'

import PaginationTable from './index'

const renderWithChakraProvider = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>)
}

describe('PaginationTable Component', () => {
  const emptyMessage = 'No data available'
  const bgColor = 'black'
  const fontColor = 'white'
  const pgSize = 10
  const onClick = jest.fn()
  const onClickAllMarkets = jest.fn()
  const onClickRefresh = jest.fn()

  it('renders table with data', () => {
    renderWithChakraProvider(
      <PaginationTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        bgColor={bgColor}
        fontColor={fontColor}
        pgSize={pgSize}
        onClick={onClick}
        onClickAllMarkets={onClickAllMarkets}
        onClickRefresh={onClickRefresh}
      />,
    )
    expect(screen.getByText(/Page \d+ of/i)).toBeInTheDocument()
    expect(screen.getByText(/Total: \d+/i)).toBeInTheDocument()
  })

  it('displays empty message when there is no data', () => {
    renderWithChakraProvider(
      <PaginationTable
        columns={columns}
        data={[]}
        emptyMessage={emptyMessage}
        bgColor={bgColor}
        fontColor={fontColor}
        pgSize={pgSize}
        onClick={onClick}
        onClickAllMarkets={onClickAllMarkets}
        onClickRefresh={onClickRefresh}
      />,
    )
    expect(screen.getByText(emptyMessage)).toBeInTheDocument()
  })

  it('triggers onClick when a row is clicked', () => {
    renderWithChakraProvider(
      <PaginationTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        bgColor={bgColor}
        fontColor={fontColor}
        pgSize={pgSize}
        onClick={onClick}
        onClickAllMarkets={onClickAllMarkets}
        onClickRefresh={onClickRefresh}
      />,
    )
    const firstRow = screen.getAllByRole('row')[1]
    fireEvent.click(firstRow)
    expect(onClick).toHaveBeenCalledWith(data[0])
  })

  it('handles global filter search', () => {
    renderWithChakraProvider(
      <PaginationTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        bgColor={bgColor}
        fontColor={fontColor}
        pgSize={pgSize}
        onClick={onClick}
        onClickAllMarkets={onClickAllMarkets}
        onClickRefresh={onClickRefresh}
        searchBy={true}
      />,
    )
    const searchInput = screen.getByPlaceholderText('Search')
    fireEvent.change(searchInput, { target: { value: 'searchTerm' } })
    expect(searchInput).toHaveValue('searchTerm')
  })

  it('handles pagination', () => {
    renderWithChakraProvider(
      <PaginationTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        bgColor={bgColor}
        fontColor={fontColor}
        pgSize={pgSize}
        onClick={onClick}
        onClickAllMarkets={onClickAllMarkets}
        onClickRefresh={onClickRefresh}
      />,
    )
    const nextButton = screen.getByLabelText('Next Page')
    fireEvent.click(nextButton)
    expect(screen.getByText(/Page \d+ of/i)).toBeInTheDocument()
  })

  it('handles sorting', () => {
    renderWithChakraProvider(
      <PaginationTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        bgColor={bgColor}
        fontColor={fontColor}
        pgSize={pgSize}
        onClick={onClick}
        onClickAllMarkets={onClickAllMarkets}
        onClickRefresh={onClickRefresh}
      />,
    )
    const firstColumnHeader = screen.getAllByRole('columnheader')[0]
    fireEvent.click(firstColumnHeader)
    const sortIcon = firstColumnHeader.querySelector(
      '[aria-label="sorted ascending"]',
    )
    expect(sortIcon).toBeInTheDocument()
  })
})
