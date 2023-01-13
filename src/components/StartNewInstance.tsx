import React, { Dispatch, useEffect, useState } from "react"
import { StartNewInstanceArgs } from "../types/components"
import { getPlaygroundMutableFunctionsFromInterface } from "../utils/web3"
import { ethers } from 'ethers'
import Select, { SingleValue } from 'react-select'


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

  const [functionSelectorOptions, setFunctionSelectorOptions] = useState<Array<{ selector: string, name: string }>>([])
  const [functionSelectorChosenFromMenu, setFunctionSelectorChosenFromMenu] = useState<string>("")
  const [chooseFromPlaygroundSelectors, setChooseFromPlaygroundSelectors] = useState<boolean>(true)
  const [functionSelector, setFunctionSelector] = useState<string>("")
  const [votingContractAddressChosenFromMenu, setVotingContractAddressChosenFromMenu] = useState<string>("")
  const [chooseFromRegisteredContracts, setChooseFromRegisteredContracts] = useState<boolean>(true)
  const [votingContractAddress, setVotingContractAddress] = useState<string>("")
  const [initialNewInstanceValuesFromPlayground, setInitialNewInstanceValuesFromPlayground] = useState<{
    targetId: string,
    votingContract: string, deadline: string
  }>({
    targetId: "",
    votingContract: "",
    deadline: ""
  })

  useEffect(() => {
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

    // set initial values
    setInitialNewInstanceValuesFromPlayground(initialNewInstanceValues)
  }, [])


  // handle selector choices

  const handleChooseFromPlaygroundSelectors = (event: any) => {
    setChooseFromPlaygroundSelectors(event.target.checked)
  }

  const handleFunctionSelectorChoicesChange = (event: SingleValue<{ value: string, label: string }>) => {
    if (event) {
      setFunctionSelectorChosenFromMenu(event.value)
      if (chooseFromPlaygroundSelectors) {
        setFunctionSelector(event.value)
        let initialNewInstanceValuesTemp = { ...initialNewInstanceValues }
        initialNewInstanceValuesTemp.targetId = event.value
        initialNewInstanceValuesTemp.votingContract = votingContractAddress
        initialNewInstanceValuesSetter(initialNewInstanceValuesTemp)
      }
    }
  }

  const handleFunctionSelector = (event: any) => {
    setFunctionSelector(event.target.value)
    let initialNewInstanceValuesTemp = { ...initialNewInstanceValues }
    initialNewInstanceValuesTemp.targetId = event.target.value
    initialNewInstanceValuesTemp.votingContract = votingContractAddress
    initialNewInstanceValuesSetter(initialNewInstanceValuesTemp)
  }

  // handle contract choices

  const handleVotingContractChoicesChange = (event: SingleValue<{ value: string, label: string }>) => {
    // console.log('event', event)
    if (event) {
      setVotingContractAddressChosenFromMenu(event.value)
      if (chooseFromRegisteredContracts) {
        setVotingContractAddress(event.value)
        let initialNewInstanceValuesTemp = { ...initialNewInstanceValues }
        initialNewInstanceValuesTemp.targetId = functionSelector
        initialNewInstanceValuesTemp.votingContract = event.value
        initialNewInstanceValuesSetter(initialNewInstanceValuesTemp)
      }
    }
  }

  const handleChooseFromRegisteredContracts = (event: any) => {
    setChooseFromRegisteredContracts(event.target.checked)
  }

  const handleVotingContractAddress = (event: any) => {
    setVotingContractAddress(event.target.value)
    let initialNewInstanceValuesTemp = { ...initialNewInstanceValues }
    initialNewInstanceValuesTemp.targetId = functionSelector
    initialNewInstanceValuesTemp.votingContract = event.target.value
    initialNewInstanceValuesSetter(initialNewInstanceValuesTemp)
  }

  return (
    <>
      <div style={{ display: "inline-block", width: "20%" }}>
        <label>
          <input
            type="checkbox"
            checked={chooseFromPlaygroundSelectors}
            value={"choooseFromPlaygroundSelectors"}
            id="choooseFromPlaygroundSelectors"
            onChange={(event) => handleChooseFromPlaygroundSelectors(event)} />
          Choose target from Playground
        </label>
      </div>
      <div style={{ display: "inline-block", width: "40%" }}>
        <Select
          onChange={(event) => handleFunctionSelectorChoicesChange(event)}
          isDisabled={!chooseFromPlaygroundSelectors}
          placeholder="Choose contract"
          options={functionSelectorOptions.map((ct) => {
            return {
              value: ct.selector,
              label: ct.name + `(${ct.selector})`
            }
          })}
          className="basic-select"
          classNamePrefix="select"
        ></Select>
      </div>
      <div style={{ display: "inline-block", width: "40%" }}>
        <input
          placeholder="Voting Contract"
          disabled={chooseFromPlaygroundSelectors}
          defaultValue={initialNewInstanceValuesFromPlayground.targetId ? initialNewInstanceValuesFromPlayground.targetId : "none"}
          value={functionSelector}
          onChange={(event) => handleFunctionSelector(event)}
        />
      </div>
      <hr />
      <div className="row">
        <div style={{ display: "inline-block", width: "20%" }}>
          <label>
            <input
              type="checkbox"
              checked={chooseFromRegisteredContracts}
              value={"chooseFromRegisteredContracts"}
              id="chooseFromRegisteredContracts"
              onChange={(event) => handleChooseFromRegisteredContracts(event)} />
            Choose from registered Contracts
          </label>
        </div>
        <div style={{ display: "inline-block", width: "40%" }}>
          <Select
            onChange={(event) => handleVotingContractChoicesChange(event)}
            isDisabled={!chooseFromRegisteredContracts}
            placeholder="Choose contract"
            options={registeredVotingContracts.map((ct) => {
              return {
                value: ct.registrationArgs.contractAddress,
                label: ct.registrationArgs.contractAddress
              }
            })}
            className="basic-select"
            classNamePrefix="select"
          ></Select>
        </div>
        <div style={{ display: "inline-block", width: "30%" }}>
          <input
            placeholder="Voting Contract"
            disabled={chooseFromRegisteredContracts}
            defaultValue={initialNewInstanceValuesFromPlayground.votingContract ? initialNewInstanceValuesFromPlayground.votingContract : "none"}
            value={votingContractAddress}
            onChange={(event) => handleVotingContractAddress(event)}
          />
        </div>
      </div>
      <div>

        {/* {JSON.stringify(initialNewInstanceValues)} */}
        {/* {functionSelectorOptions.map((f) => { */}
        {/* {registeredVotingContracts.map((f) => { */}
        <button onClick={(e) => closeDetails(e)} className="btn btn-success">Hide Details</button>
      </div>
    </>

  )
}

export {
  StartNewInstance
}