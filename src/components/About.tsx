import React from "react";
import { DetailsHandling } from "../types/components"
import { pageInfo } from "../utils/pages"
import { PageInfo, Pages } from "../types/pages"

interface AboutArgs {
  detailsHandling: DetailsHandling
}

const AboutComp: React.FC<AboutArgs> = ({ detailsHandling }: AboutArgs) => {
  let thisPageInfo: PageInfo = pageInfo[Pages.About]

  const Details = (
    <>
      <div style={{ backgroundColor: "cornflowerblue" }} className="card">
        Details
      </div>
    </>
  )
  return (
    <div key={thisPageInfo.key}>
      <h3>{thisPageInfo.title}</h3>
      <button onClick={() => detailsHandling.detailsSetter(Details)}>Click me</button>
    </div>
  )
}

export {
  AboutComp
}