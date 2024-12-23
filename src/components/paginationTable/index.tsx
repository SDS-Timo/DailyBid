import React, { useState, useEffect } from 'react'

import { SearchIcon, RepeatIcon } from '@chakra-ui/icons'
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Input,
  IconButton,
  Flex,
  Box,
  Text,
  HStack,
  Checkbox,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiArrowDownCircle,
  FiArrowUpCircle,
} from 'react-icons/fi'
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
  Column,
  TableOptions,
  TableState,
  TableInstance,
  Row,
  Cell,
  HeaderGroup,
  UseSortByColumnOptions,
} from 'react-table'

interface PaginationTableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  hiddenColumns?: string[]
  searchBy?: boolean
  sortBy?: any[]
  tableSize?: string
  fontSize?: string
  bgColor: string
  fontColor: string
  emptyMessage: string
  pgSize: number
  onClick: (values: T) => void
  onClickAllMarkets: (value: boolean) => void
  onClickRefresh: () => void
}

interface ExtendedHeaderGroup<T extends object> extends HeaderGroup<T> {
  getSortByToggleProps: (props?: any) => any
  isSorted: boolean
  isSortedDesc: boolean
}

interface ExtendedTableInstance<T extends object> extends TableInstance<T> {
  setPageSize: (pageSize: number) => void
}

interface GlobalFilterProps {
  globalFilter: any
  setGlobalFilter: (filterValue: any) => void
  onClickAllMarkets: (value: boolean) => void
  onClickRefresh: () => void
}

export type ColumnWithSorting<T extends object> = Column<T> &
  UseSortByColumnOptions<T>

export function pgSizeDinamic() {
  const screenSize = useBreakpointValue({
    base: 'base',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  })

  switch (screenSize) {
    case 'base':
    case 'sm':
    case '2xl':
      return 10
    case 'xl':
      return 4
    case 'md':
    case 'lg':
      return 3
    default:
      return 3
  }
}

function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  onClickAllMarkets,
  onClickRefresh,
}: GlobalFilterProps) {
  const [value, setValue] = useState(globalFilter)
  const onChange = (value: any) => {
    setGlobalFilter(value || '')
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onClickAllMarkets(e.target.checked)
    onChange('')
    setValue('')
  }

  return (
    <HStack justifyContent="space-between" mb={4}>
      <Checkbox onChange={handleCheckboxChange}>
        <Text fontSize="14px">Show all markets</Text>
      </Checkbox>
      <Flex justifyContent="flex-end" alignItems="center">
        <InputGroup size="xs" width="auto">
          <Input
            placeholder="Search"
            value={value || ''}
            onChange={(e) => {
              setValue(e.target.value)
              onChange(e.target.value)
            }}
            pr="2.5rem"
          />
          <InputLeftElement>
            <SearchIcon />
          </InputLeftElement>
        </InputGroup>

        <IconButton
          aria-label="Reset"
          icon={<RepeatIcon />}
          onClick={() => {
            setValue('')
            onChange('')
            onClickRefresh()
          }}
          size="xs"
          ml="4px"
          variant="ghost"
          borderRadius="0px"
        />
      </Flex>
    </HStack>
  )
}

const PaginationTable = <T extends object>({
  columns,
  data,
  hiddenColumns = [],
  searchBy = false,
  sortBy = [],
  tableSize = 'sm',
  fontSize = 'md',
  bgColor,
  fontColor,
  emptyMessage,
  pgSize,
  onClick,
  onClickAllMarkets,
  onClickRefresh,
}: PaginationTableProps<T>) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, globalFilter },
    setGlobalFilter,
  } = useTable<T>(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: pgSize, hiddenColumns, sortBy },
    } as TableOptions<T>,
    useGlobalFilter,
    useSortBy,
    usePagination,
  ) as ExtendedTableInstance<T> & {
    page: Row<T>[]
    canPreviousPage: boolean
    canNextPage: boolean
    pageOptions: number[]
    pageCount: number
    gotoPage: (updater: number | ((pageIndex: number) => number)) => void
    nextPage: () => void
    previousPage: () => void
    setGlobalFilter: (filterValue: any) => void
    state: TableState<T> & { globalFilter: any; pageIndex: number }
  }

  useEffect(() => {
    setPageSize(pgSize)
  }, [pgSize, setPageSize])

  return (
    <Box overflowX="auto">
      {searchBy && (
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          onClickAllMarkets={onClickAllMarkets}
          onClickRefresh={onClickRefresh}
        />
      )}
      <Table {...getTableProps()} size={tableSize} variant={'unstyled'}>
        <Thead>
          {headerGroups.map((headerGroup, headerGroupIndex) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key={headerGroupIndex}>
              {(headerGroup as ExtendedHeaderGroup<T>).headers.map(
                (column, columnIndex) => (
                  <Th
                    {...column.getHeaderProps(
                      (column as any).getSortByToggleProps(),
                    )}
                    key={columnIndex}
                  >
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      textAlign="center"
                    >
                      {column.render('Header')}
                      {(column as any).isSorted ? (
                        (column as any).isSortedDesc ? (
                          <FiArrowDownCircle
                            aria-label="sorted descending"
                            style={{ marginLeft: '8px' }}
                          />
                        ) : (
                          <FiArrowUpCircle
                            aria-label="sorted ascending"
                            style={{ marginLeft: '8px' }}
                          />
                        )
                      ) : null}
                    </Flex>
                  </Th>
                ),
              )}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {page.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length}>
                <Flex
                  height="50px"
                  align="center"
                  justify="center"
                  width="100%"
                  mt={3}
                >
                  {emptyMessage}
                </Flex>
              </Td>
            </Tr>
          ) : (
            page.map((row: Row<T>, rowIndex) => {
              prepareRow(row)
              return (
                <Tr
                  {...row.getRowProps()}
                  key={rowIndex}
                  onClick={() => onClick(row.original)}
                >
                  {row.cells.map((cell: Cell<T>, cellIndex) => (
                    <Td {...cell.getCellProps()} key={cellIndex}>
                      {cell.render('Cell')}
                    </Td>
                  ))}
                </Tr>
              )
            })
          )}
        </Tbody>
      </Table>
      <Flex
        mt={4}
        justifyContent="space-between"
        alignItems="center"
        fontSize={fontSize}
      >
        <Flex flexDirection="column">
          <Text>
            Page {pageIndex + 1} of{' '}
            {pageOptions.length > 0 ? pageOptions.length : 1}
          </Text>
          <Text>Total: {data.length}</Text>
        </Flex>
        <Flex>
          <IconButton
            aria-label="First Page"
            icon={<FiChevronsLeft />}
            onClick={() => gotoPage(0)}
            isDisabled={!canPreviousPage}
            size="xs"
            borderRadius="0px"
            bg={bgColor}
            color={fontColor}
          />

          <IconButton
            aria-label="Previous Page"
            icon={<FiChevronLeft />}
            onClick={() => previousPage()}
            isDisabled={!canPreviousPage}
            size="xs"
            borderRadius="0px"
            bg={bgColor}
            color={fontColor}
          />

          <IconButton
            aria-label="Next Page"
            icon={<FiChevronRight />}
            onClick={() => nextPage()}
            isDisabled={!canNextPage}
            size="xs"
            borderRadius="0px"
            bg={bgColor}
            color={fontColor}
          />

          <IconButton
            aria-label="Last Page"
            icon={<FiChevronsRight />}
            onClick={() => gotoPage(pageCount - 1)}
            isDisabled={!canNextPage}
            size="xs"
            borderRadius="0px"
            bg={bgColor}
            color={fontColor}
          />
        </Flex>
      </Flex>
    </Box>
  )
}

export default PaginationTable
