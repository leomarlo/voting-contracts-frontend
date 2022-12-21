// Main.tsx

import React, { useState } from "react"

import { Menu } from "./Menu"
import { Content } from "./Content"
import { Details } from "./Details"

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
  const [focusOnDetails, setFocusOnDetails] = useState(true)

  const changeFocusInMain = () => {
    focusOnDetails ? setFocusOnDetails(false) : setFocusOnDetails(true)
  }

  return (
    <div className="row absolute padded1" style={mainStyle}>
      <div className="col-2" style={menuStyle}>
        <div style={{ minHeight: "200px" }}></div>
        <Menu />
      </div>
      <div className={focusOnDetails ? columnWidths[0][0] : columnWidths[1][0]}>
        {/* <div className="col-9"> */}
        {/* {endlesstext} */}
        <Content changeFocusCallback={changeFocusInMain} />
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