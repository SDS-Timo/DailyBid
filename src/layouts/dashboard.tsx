import React, { ReactNode } from 'react'

import Content from '../components/content'
import Footer from '../components/footer'
import Main from '../components/main'
import Navbar from '../components/navbar'
import Wrapper from '../components/wrapper'
import Processes from '../processes'

interface DashboardProps {
  children: ReactNode
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => (
  <React.Fragment>
    <Wrapper>
      <Main>
        <Navbar />
        <Content>{children}</Content>
        <Footer />
        <Processes />
      </Main>
    </Wrapper>
  </React.Fragment>
)

export default Dashboard
