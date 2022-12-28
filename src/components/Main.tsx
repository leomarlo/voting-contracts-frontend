// Main.tsx

import React, { useState, CSSProperties } from "react"

import { Menu } from "./Menu"
import { Content } from "./Content"
import { Details } from "./Details"
import { VotingContractsComp } from "./VotingContracts"
import { DetailsHandling, ComponentSetter } from "../types/components"
import { PlaygroundComp } from "./Playground"
import { VotingIntegrationComp } from "./VotingIntegration"
import { pageInfo } from "../utils/pages"
import { Pages, PageSetter } from "../types/pages"

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

  const columnWidths = [["col-9", "col-1"], ["col-5", "col-5"]]
  const [focusOnDetails, setFocusOnDetails] = useState<boolean>(false)
  const [selectedPage, setSelectedPage] = useState<Pages>(Pages.VotingPlayground)
  const [detailsPage, setDetailsPage] = useState<JSX.Element>(<></>)

  const detailsHandling: DetailsHandling = {
    focusOnDetails: focusOnDetails,
    focusOnDetailsSetter: setFocusOnDetails,
    detailsSetter: setDetailsPage,
    pageSetter: setSelectedPage
  }


  // const changeFocusInMain = () => {
  //   focusOnDetails ? setFocusOnDetails(false) : setFocusOnDetails(true)
  // }


  const getContentDOM = () => {
    if (selectedPage == Pages.VotingContracts) {
      return (<VotingContractsComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.VotingPlayground) {
      return (<PlaygroundComp detailsHandling={detailsHandling} />)
    } else if (selectedPage == Pages.VotingContractIntegration) {
      return (<VotingIntegrationComp detailsHandling={detailsHandling} />)
    } else {
      return (<Content detailsHandling={detailsHandling} />)
    }
  }

  return (
    <div className="row absolute padded1" style={mainStyle}>
      <div className="col-2" style={menuStyle}>
        <div style={{ minHeight: "200px" }}></div>
        <Menu detailsHandling={detailsHandling} />
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