import { Column } from 'react-table'

interface Data {
  name: string
  age: number
}

export const columns: Column<Data>[] = [
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Age',
    accessor: 'age',
  },
]

export const data: Data[] = [
  {
    name: 'John Doe',
    age: 28,
  },
  {
    name: 'Jane Smith',
    age: 34,
  },
]
