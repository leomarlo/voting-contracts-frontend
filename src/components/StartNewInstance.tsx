import React, { Dispatch, useEffect, useState } from "react"
import { StartNewInstanceArgs } from "../types/components"
import { getPlaygroundMutableFunctionsFromInterface } from "../utils/web3"
import { ethers } from 'ethers'


const StartNewInstance: React.FC<StartNewInstanceArgs> = ({
  playground,
  registeredVotingContracts,
  detailsHandling,
  initialNewInstanceValues,
  initialNewInstanceValuesSetter
}: StartNewInstanceArgs) => {

  const closeDetails = (event: any) => {
    detailsHandling.focusOnDetailsSetter(false)
    detailsHandling.detailsSetter(<></>)
  }

  const [functionSelectorOptions, setFunctionSelectorOptions] = useState<Object[]>([])

  useEffect(() => {
    // create contract 


    // set initial options for the 
    getPlaygroundMutableFunctionsFromInterface(false).then(
      (result: Array<{ name: string }>) => {
        const mutableFunctionsIfc = new ethers.utils.Interface(result)
        let hashes = result.map((f) => {
          let name: string = f.name //f["name" as keyof typeof f] as string
          return {
            selector: mutableFunctionsIfc.getSighash(name),
            name: name
          }
        })
        setFunctionSelectorOptions(hashes)
      }
    )
  }, [])


  return (
    <div>
      {/* {JSON.stringify(initialNewInstanceValues)} */}
      {functionSelectorOptions.map((f) => {
        return (
          <div>
            {JSON.stringify(f)}
          </div>
        )
      })}
      {/* TargetId: {initialNewInstanceValues.targetId}<br /> */}
      <br />
      {registeredVotingContracts.map((f) => {
        return (
          <div>
            {JSON.stringify(f)}
          </div>
        )
      })
      }
      <button onClick={(e) => closeDetails(e)} className="btn btn-success">Hide Details</button>
    </div>

  )
}

export {
  StartNewInstance
}