// Main.tsx

import React, { useState } from "react"

import { Menu } from "./Menu"
import { Content } from "./Content"
import { Details } from "./Details"
import { VotingContractsComp } from "./VotingContracts"
import { SelectedPageOptions, FocusOnDetailsVarAndSetter } from "../types/components"
import { VotingPlaygroundComp } from "./VotingPlayground"

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
  const [focusOnDetails, setFocusOnDetails] = useState<boolean>(true)
  const focusOnDetailsVarAndSetter: FocusOnDetailsVarAndSetter = {
    flag: focusOnDetails,
    setter: setFocusOnDetails
  }

  const [selectedPage, setSelectedPage] = useState<SelectedPageOptions>(
    "voting-playground"
  )

  // const changeFocusInMain = () => {
  //   focusOnDetails ? setFocusOnDetails(false) : setFocusOnDetails(true)
  // }

  const getContentDOM = () => {
    if (selectedPage == "voting-contracts") {
      return (<VotingContractsComp focusOnDetails={focusOnDetailsVarAndSetter} />)
    } else if (selectedPage == "voting-playground") {
      return (<VotingPlaygroundComp focusOnDetails={focusOnDetailsVarAndSetter} />)
    } else {
      return (<Content focusOnDetails={focusOnDetailsVarAndSetter} />)
    }
  }

  return (
    <div className="row absolute padded1" style={mainStyle}>
      <div className="col-2" style={menuStyle}>
        <div style={{ minHeight: "200px" }}></div>
        <Menu setSelectedPage={setSelectedPage} />
      </div>
      <div className={focusOnDetails ? columnWidths[0][0] : columnWidths[1][0]}>
        {getContentDOM()}

      </div>
      <div className={focusOnDetails ? columnWidths[0][1] : columnWidths[1][1]} >
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