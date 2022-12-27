// 	Menu.tsx

import React, { CSSProperties, useEffect, useState } from "react"

import { SelectedPageOptions } from "../types/components"
import { PageInfo, Pages, pageInfo, PageSetter } from "../utils/pages"

interface MenuArgs {
  changeSelectedPage: PageSetter
}

interface MenuItemArgs extends MenuArgs {
  item: Pages
}

const menuItemStyle: CSSProperties = {
  padding: "3px",
  marginTop: "30px",
  marginLeft: "4px",
  marginRight: "4px",
  borderColor: "#aaa",
  borderStyle: "solid",
  borderRadius: "4px",
  borderWidth: "2px",
  cursor: "pointer",
  fontSize: "14pt"
}



const MenuItem: React.FC<MenuItemArgs> = ({ changeSelectedPage, item }: MenuItemArgs) => {
  const [overItem, setOverItem] = useState<boolean>(false)

  let thisItemInfo: PageInfo = pageInfo[item]

  return (
    <div
      style={{
        ...menuItemStyle,
        backgroundColor: overItem == true ? "#ddd" : "#bbb"
      }}
      key={thisItemInfo.key + '-item'}
      onClick={() => changeSelectedPage(item)}
      onMouseLeave={() => setOverItem(false)}
      onMouseEnter={() => setOverItem(true)}>
      {thisItemInfo.title}
    </div>
  )
}

const Menu: React.FC<MenuArgs> = ({ changeSelectedPage }: MenuArgs) => {
  // const MenuItemsTemp = Object.values(Pages)
  // console.log('Pages', Pages["VotingContractIntegration"])





  const MenuItems = Object.keys(Pages)
    .filter((v) => isNaN(Number(v)))
    .map((page) => {
      return <MenuItem item={Pages[page as keyof typeof Pages]} changeSelectedPage={changeSelectedPage} />
    })
  return (
    <>
      {MenuItems}
    </>
  )
}

export {
  Menu
}