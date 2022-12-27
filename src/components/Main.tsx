// Main.tsx

import React, { useState } from "react"

import { Menu } from "./Menu"
import { Content } from "./Content"
import { Details } from "./Details"
import { VotingContractsComp } from "./VotingContracts"
import { SelectedPageOptions, FocusOnDetailsVarAndSetter } from "../types/components"
import { PlaygroundComp } from "./Playground"
import { VotingIntegrationComp } from "./VotingIntegration"
import { PageInfo, Pages, pageInfo, PageSetter } from "../utils/pages"

const mainStyle = {
  zIndex: 2,
  width: "100vw",
  minHeight: "90%",
  maxHeight: "90%",
  top: "10%",
  overflow: "hidden",
  left: 0
}

const menuStyle = {
  zIndex: 2,
  paddingLeft: "24px",
  paddingRight: "14px",
  paddingTop: "54px",
  paddingBottom: "14px",
}


const Main: React.FC = () => {

  const columnWidths = [["col-9", "col-1"], ["col-2", "col-8"]]
  const [focusOnDetails, setFocusOnDetails] = useState<boolean>(false)
  const focusOnDetailsVarAndSetter: FocusOnDetailsVarAndSetter = {
    flag: focusOnDetails,
    setter: setFocusOnDetails
  }

  const [selectedPage, setSelectedPage] = useState<Pages>(Pages.VotingPlayground)

  const changeSelectedPage: PageSetter = (newPage: Pages) => {
    setSelectedPage(newPage)
    setFocusOnDetails(false)
  }
  // const changeFocusInMain = () => {
  //   focusOnDetails ? setFocusOnDetails(false) : setFocusOnDetails(true)
  // }

  const getContentDOM = () => {
    if (selectedPage == Pages.VotingContracts) {
      return (<VotingContractsComp focusOnDetails={focusOnDetailsVarAndSetter} />)
    } else if (selectedPage == Pages.VotingPlayground) {
      return (<PlaygroundComp focusOnDetails={focusOnDetailsVarAndSetter} changeSelectedPage={changeSelectedPage} />)
    } else if (selectedPage == Pages.VotingContractIntegration) {
      return (<VotingIntegrationComp focusOnDetails={focusOnDetailsVarAndSetter} />)
    } else {
      return (<Content focusOnDetails={focusOnDetailsVarAndSetter} />)
    }
  }

  return (
    <div className="row absolute padded1" style={mainStyle}>
      <div className="col-2" style={menuStyle}>
        <div style={{ minHeight: "200px" }}></div>
        <Menu changeSelectedPage={changeSelectedPage} />
      </div>
      <div className={focusOnDetails ? columnWidths[1][0] : columnWidths[0][0]}>
        {getContentDOM()}

      </div>
      <div className={focusOnDetails ? columnWidths[1][1] : columnWidths[0][1]} >
        {/* <div className="col-1"> */}
        {/* {endlesstext} */}
        <Details />
      </div>
    </div >
  )
}

export {
  Main
}