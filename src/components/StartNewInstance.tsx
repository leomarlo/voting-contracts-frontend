import React, { Dispatch } from "react"
import { StartNewInstanceArgs } from "../types/components"



const StartNewInstance: React.FC<StartNewInstanceArgs> = ({
  detailsHandling,
  initialNewInstanceValues,
  initialNewInstanceValuesSetter
}: StartNewInstanceArgs) => {

  const closeDetails = (event: any) => {
    detailsHandling.focusOnDetailsSetter(false)
    detailsHandling.detailsSetter(<></>)
  }
  return (
    <div>
      {JSON.stringify(initialNewInstanceValues)}
      {/* TargetId: {initialNewInstanceValues.targetId}<br /> */}
      <br />
      <button onClick={(e) => closeDetails(e)} className="btn btn-success">Hide Details</button>
    </div>

  )
}

export {
  StartNewInstance
}