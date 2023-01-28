// Main.tsx

import React, { useState, CSSProperties } from "react"

import { Menu } from "./Menu"
import { Content } from "./Content"
import { Details } from "./Details"
import { AboutComp } from "./About"
import { VotingContractsComp } from "./VotingContracts"
import { DetailsHandling, ComponentSetter } from "../types/components"
import { PlaygroundComp } from "./Playground"
import { VotingIntegrationComp } from "./VotingIntegration"
import { RegistrySystemComp } from "./RegistrySystem"
import { DocumentationComp } from "./Docs"
import { pageInfo } from "../utils/pages"
import { Pages, PageSetter } from "../types/pages"
// import { VotingContractsLogo } from "./icons/Logo"

const mainStyle = {
  zIndex: 2,
  margin: "0px",
  width: "100vw",
  minHeight: "90vh",
  maxHeight: "90vh",
  top: "10vh",
  overflow: "hidden",
  left: 0,
  // backgroundColor: "coral"
}

const menuStyle = {
  zIndex: 2,
  paddingLeft: "24px",
  paddingRight: "14px",
  paddingTop: "54px",
  paddingBottom: "14px",
}


const contentContainerStyle: CSSProperties = {
  minHeight: "90vh",
  height: "90vh",
  maxHeight: "90vh",
  // backgroundColor: "greenyellow"
}

const Main: React.FC = () => {

  const columnWidths = [["col-9", "col-1"], ["col-4", "col-6"]]
  const [focusOnDetails, setFocusOnDetails] = useState<boolean>(false)
  /* CHANGE SELECTED PAGE HERE */
  const [selectedPage, setSelectedPage] = useState<Pages>(Pages.VotingContracts)
  const [detailsPage, setDetailsPage] = useState<JSX.Element>(<></>)

  const detailsHandling: DetailsHandling = {
    focusOnDetails: focusOnDetails,
    focusOnDetailsSetter: setFocusOnDetails,
    detailsSetter: setDetailsPage,
    pageSetter: setSelectedPage
  }


  const getContentDOM = () => {
    if (selectedPage == Pages.About) {
      return (<AboutComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.VotingContracts) {
      return (<VotingContractsComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.VotingContractIntegration) {
      return (<VotingIntegrationComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.VotingRegistrySystem) {
      return (<RegistrySystemComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.Documentation) {
      return (<DocumentationComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.VotingPlayground) {
      return (<PlaygroundComp detailsHandling={detailsHandling} />)
    } else {
      return (<AboutComp detailsHandling={detailsHandling} />)
    }
  }

  // console.log('Selected page in main is ', selectedPage)

  return (
    <div className="row absolute padded1" style={mainStyle}>
      <div className="col-2" style={menuStyle}>
        <div style={{ minHeight: "200px" }}>
          {/* <VotingContractsLogo width="100%" /> */}
        </div>
        <Menu detailsHandling={detailsHandling} selectedPage={selectedPage} />
      </div>
      <div className={focusOnDetails ? columnWidths[1][0] : columnWidths[0][0]} style={contentContainerStyle} >
        {getContentDOM()}

      </div>
      <div className={focusOnDetails ? columnWidths[1][1] : columnWidths[0][1]} >
        {/* <div className="col-1"> */}
        {/* {endlesstext} */}
        {/* <Details content={details} /> */}
        {detailsPage}
      </div>
    </div >
  )
}

export {
  Main
}