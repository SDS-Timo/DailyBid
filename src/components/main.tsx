import React, { ReactNode } from 'react'

import classNames from 'classnames'

interface MainProps {
  className?: string
  children: ReactNode
}

const Main: React.FC<MainProps> = ({ className, children }) => (
  <div className={classNames('main', className)}>{children}</div>
)

export default Main
