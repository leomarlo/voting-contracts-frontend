// 	Menu.tsx

import React, { CSSProperties, useEffect, useState } from "react"
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages, PageSetter } from "../types/pages"


interface MenuArgs {
  detailsHandling: DetailsHandling
  selectedPage: Pages
}

interface MenuItemArgs {
  changeSelectedPage: PageSetter,
  item: Pages,
  selectedPage: Pages
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

enum MenuBottomColors {
  ActiveHover = "#dd8",
  ActiveNoHover = "#bb8",
  InactiveHover = "#ddd",
  InactiveNoHover = "#bbb",
}



const MenuItem: React.FC<MenuItemArgs> = ({ changeSelectedPage, item, selectedPage }: MenuItemArgs) => {
  const [overItem, setOverItem] = useState<boolean>(false)

  let isSelected: boolean = item == selectedPage

  let thisItemInfo: PageInfo = pageInfo[item]

  return (
    <div
      style={{
        ...menuItemStyle,
        backgroundColor: (
          overItem == true ?
            (isSelected ? "#dda" : "#ddd") :
            (isSelected ? "#bb8" : "#bbb")
        )
      }}
      key={thisItemInfo.key + '-item'}
      onClick={() => changeSelectedPage(item)}
      onMouseLeave={() => setOverItem(false)}
      onMouseEnter={() => setOverItem(true)}>
      {thisItemInfo.title}
    </div>
  )
}

const Menu: React.FC<MenuArgs> = ({ detailsHandling, selectedPage }: MenuArgs) => {
  // const MenuItemsTemp = Object.values(Pages)
  // console.log('Pages', Pages["VotingContractIntegration"])


  const changeSelectedPage: PageSetter = (newPage: Pages) => {
    detailsHandling.pageSetter(newPage)
    detailsHandling.focusOnDetailsSetter(false)
    detailsHandling.detailsSetter(<></>)
  }


  return (
    <>
      {
        Object.keys(Pages)
          .filter((v) => isNaN(Number(v)))
          .map((page) => {
            return <MenuItem item={Pages[page as keyof typeof Pages]} selectedPage={selectedPage} changeSelectedPage={changeSelectedPage} />
          })
      }
    </>
  )
}

export {
  Menu
}