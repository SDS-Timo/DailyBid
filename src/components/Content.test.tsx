import { render } from '@testing-library/react'

import Content from './content'

describe('Content Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Content>
        <div>Auctions</div>
      </Content>,
    )

    expect(getByText('Auctions')).toBeInTheDocument()
  })
})
