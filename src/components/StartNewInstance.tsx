import React, { Dispatch } from "react"
import { StartNewInstanceArgs } from "../types/components"



const StartNewInstance: React.FC<StartNewInstanceArgs> = ({
  initialNewInstanceValues,
  initialNewInstanceValuesSetter
}: StartNewInstanceArgs) => {
  return (
    <div>
      {JSON.stringify(initialNewInstanceValues)}
      {/* TargetId: {initialNewInstanceValues.targetId}<br /> */}
    </div>
  )
}

export {
  StartNewInstance
}