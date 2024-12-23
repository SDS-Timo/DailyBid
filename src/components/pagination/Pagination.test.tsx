import { render, screen, fireEvent } from '@testing-library/react'

import Pagination from './'

describe('Pagination Component', () => {
  const mockPreviousPage = jest.fn()
  const mockNextPage = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the current page', () => {
    render(
      <Pagination
        canPreviousPage={true}
        canNextPage={true}
        previousPage={mockPreviousPage}
        nextPage={mockNextPage}
        bgColor="gray.200"
        fontColor="black"
        fontSize="14px"
        currentPage={1}
      />,
    )
    expect(screen.getByText('Page: 2')).toBeInTheDocument()
  })

  it('calls previousPage when Previous button is clicked', () => {
    render(
      <Pagination
        canPreviousPage={true}
        canNextPage={true}
        previousPage={mockPreviousPage}
        nextPage={mockNextPage}
        bgColor="gray.200"
        fontColor="black"
        fontSize="14px"
        currentPage={1}
      />,
    )

    const prevButton = screen.getByLabelText('Previous Page')
    fireEvent.click(prevButton)

    expect(mockPreviousPage).toHaveBeenCalledTimes(1)
  })

  it('calls nextPage when Next button is clicked', () => {
    render(
      <Pagination
        canPreviousPage={true}
        canNextPage={true}
        previousPage={mockPreviousPage}
        nextPage={mockNextPage}
        bgColor="gray.200"
        fontColor="black"
        fontSize="14px"
        currentPage={1}
      />,
    )

    const nextButton = screen.getByLabelText('Next Page')
    fireEvent.click(nextButton)

    expect(mockNextPage).toHaveBeenCalledTimes(1)
  })

  it('disables Previous button when canPreviousPage is false', () => {
    render(
      <Pagination
        canPreviousPage={false}
        canNextPage={true}
        previousPage={mockPreviousPage}
        nextPage={mockNextPage}
        bgColor="gray.200"
        fontColor="black"
        fontSize="14px"
        currentPage={0}
      />,
    )

    const prevButton = screen.getByLabelText('Previous Page')
    expect(prevButton).toBeDisabled()
  })

  it('disables Next button when canNextPage is false', () => {
    render(
      <Pagination
        canPreviousPage={true}
        canNextPage={false}
        previousPage={mockPreviousPage}
        nextPage={mockNextPage}
        bgColor="gray.200"
        fontColor="black"
        fontSize="14px"
        currentPage={1}
      />,
    )

    const nextButton = screen.getByLabelText('Next Page')
    expect(nextButton).toBeDisabled()
  })
})
