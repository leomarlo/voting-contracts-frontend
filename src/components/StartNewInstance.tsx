import React, { Dispatch, useEffect, useState, CSSProperties } from "react"
import { StartNewInstanceArgs } from "../types/components"
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import {
  getPlaygroundMutableFunctionsFromInterface,
  getBlockexplorerBaseUrlFromChainId,
  getContractABIFromEtherscan,
  getGeneralVotingInterface
} from "../utils/web3"
import { ethers } from 'ethers'
import Select, { SingleValue } from 'react-select'
import { bootstrapColors } from "../utils/bootstrap"

interface VotingParams {
  active: boolean,
  address?: string,
  abi?: Array<Object>,
  inputs?: Array<{
    name: string,
    type: string,
    internalType: string,
    value: string
  }>
}

const StartNewInstance: React.FC<StartNewInstanceArgs> = ({
  playground,
  registeredVotingContracts,
  registeredVotingContractsSetter,
  detailsHandling,
  initialNewInstanceValues,
  initialNewInstanceValuesSetter
}: StartNewInstanceArgs) => {

  const { chainId, library } = useWeb3React<Web3Provider>()

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

  const [deadline, setDeadline] = useState<string>("")
  const [votingParams, setVotingParams] = useState<VotingParams>({ active: false })
  const [blockscannerApiKey, setBlockscannerApiKey] = useState<string>("")
  const [displayTypeOfInputFields, setDisplayTypeOfInputFields] = useState<"inherit" | "none">("none")
  const [encodedVotingParameters, setEncodedVotingParameters] = useState<string>("")
  const isAddress = new RegExp(`^0x[0-9A-Fa-f]{40}$`)

  const linkStyle: CSSProperties = { color: 'lightcoral', fontWeight: "bold" }

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

    // set initial values directly
    setFunctionSelector(initialNewInstanceValues.targetId)
    setVotingContractAddress(initialNewInstanceValues.votingContract)
    setDeadline(initialNewInstanceValues.deadline)
  }, [])


  const closeDetails = (event: any) => {
    detailsHandling.focusOnDetailsSetter(false)
    detailsHandling.detailsSetter(<></>)
  }
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
      if (library) {
        playground.connect(library.getSigner()).getAssignedContract(event.value).then((contract: string) => {
          // console.log('The chosen selector has the following contract', res)
          let registeredVotingContractsTemp = [...registeredVotingContracts]
          for (const registeredContract of registeredVotingContractsTemp) {
            if (registeredContract.registrationArgs.contractAddress == contract) {
              registeredContract.instantiation.chosenSelector = event.value
              registeredContract.instantiation.disabledForTheChosenSelector = false
            } else {
              registeredContract.instantiation.disabledForTheChosenSelector = true
            }
          }
          registeredVotingContractsSetter(registeredVotingContractsTemp)
          setVotingContractAddress(contract)
        })
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

  const fetchVotingParameters = (event: any) => {
    if (blockscannerApiKey.length != 34) {
      setBlockscannerApiKey("Needs to have 34 characters!")
      return
    }
    setDisplayTypeOfInputFields("inherit")
    getContractABIFromEtherscan(
      votingContractAddress,
      blockscannerApiKey,
      chainId ? chainId : 1
    ).then(
      (data) => {
        // console.log('inside get ABI and the result is')

        for (const fnc of data) {
          console.log('function is', fnc)
          if (fnc["name" as keyof typeof fnc] == "encodeParameters") {
            // console.log("We found the encode Parameters function", fnc)
            // console.log("The inputs are", fnc["inputs" as keyof typeof fnc])
            let votingParams: VotingParams = {
              active: true,
              address: votingContractAddress,
              inputs: fnc["inputs" as keyof typeof fnc].map((inp: { [key: string]: string }) => {
                return {
                  value: "",
                  name: inp.name ? inp.name : "unknown name",
                  type: inp.type,
                  internalType: inp.internalType
                }
              })
            }
            if (typeof data !== "string") {
              console.log('Type of data is', typeof data)
              votingParams.abi = data
            }
            setVotingParams(votingParams)
          }
        }
      }
    )
  }

  const handleChangeBlockscannerApiKey = (event: any) => {
    setBlockscannerApiKey(event.target.value)
  }

  const handleVotingParamsUpdate = (ev: { target: { id: string, value: string } }) => {
    let hasNumber = ev.target.id.match(/\d+/)
    if (hasNumber !== null) {
      // if hasNumber.length > 0
      let index = parseInt(hasNumber[0]);
      // console.log('Index is:', index)
      let votingParamsTemp = { ...votingParams }
      if (votingParamsTemp.inputs) {
        votingParamsTemp.inputs[index].value = ev.target.value
        if (votingParamsTemp.inputs[index].name == "duration" || votingParamsTemp.inputs[index].name == "deadline") {
          let initialNewInstanceValuesTemp = { ...initialNewInstanceValues }
          initialNewInstanceValuesTemp.deadline = ev.target.value
          initialNewInstanceValuesSetter(initialNewInstanceValuesTemp)
        }
      }
      setVotingParams(votingParamsTemp)
    }
  }

  const handleEncodedParametersChange = (event: any) => {
    setEncodedVotingParameters(event.target.value)
  }

  function getInstanceParameters(): [Array<string>, boolean] {
    if (votingParams.inputs === undefined) return [[], false]
    // TODO: check inputs
    return [votingParams.inputs.map((inp) => inp.value), true]

  }

  const handleEncodeParameters = async (event: any) => {
    // let ifc = await getGeneralVotingInterface(false)
    const [parameters, valid] = getInstanceParameters()
    if (votingParams.abi && library && valid) {
      let votingContract = new ethers.Contract(votingContractAddress, votingParams.abi)
      let encoded = ""
      try {
        let signer = library.getSigner()
        encoded = await votingContract.connect(signer).encodeParameters(...parameters)
        console.log('encoded', encoded)
      } catch (err) {
        console.log('encoding error', err)
      }
      try {
        setEncodedVotingParameters(encoded.toString())
      } catch (err) {
        console.log('setting error', err)
      }
    }
  }

  return (
    <div style={{ overflowY: "scroll", maxHeight: "90vh" }}>
      <div style={{ textAlign: "right" }}>

        {/* {JSON.stringify(initialNewInstanceValues)} */}
        {/* {functionSelectorOptions.map((f) => { */}
        {/* {registeredVotingContracts.map((f) => { */}
        <button onClick={(e) => closeDetails(e)} className="btn btn-success">Hide Details</button>
      </div>
      <hr />
      <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>

        <input
          type="checkbox"
          checked={chooseFromPlaygroundSelectors}
          value={"choooseFromPlaygroundSelectors"}
          id="choooseFromPlaygroundSelectors"
          onChange={(event) => handleChooseFromPlaygroundSelectors(event)} />
        <label style={{ paddingLeft: "10px" }}>
          Choose target selector from available targets on the playground
        </label>
      </div>
      <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
        <Select
          onChange={(event) => handleFunctionSelectorChoicesChange(event)}
          isDisabled={!chooseFromPlaygroundSelectors}
          placeholder="Choose function selector"
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
      <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
        <input
          placeholder="Function Selector"
          disabled={chooseFromPlaygroundSelectors}
          defaultValue={initialNewInstanceValuesFromPlayground.targetId ? initialNewInstanceValuesFromPlayground.targetId : "none"}
          value={functionSelector}
          onChange={(event) => handleFunctionSelector(event)}
        />
      </div>
      <hr />
      <div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>

          <input
            type="checkbox"
            checked={chooseFromRegisteredContracts}
            value={"chooseFromRegisteredContracts"}
            id="chooseFromRegisteredContracts"
            onChange={(event) => handleChooseFromRegisteredContracts(event)} />
          <label style={{ paddingLeft: "10px" }}>
            Choose voting contract from registered contracts
          </label>
        </div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <Select
            onChange={(event) => handleVotingContractChoicesChange(event)}
            isDisabled={!chooseFromRegisteredContracts}
            placeholder="Choose contract"
            options={registeredVotingContracts.map((ct) => {
              return {
                value: ct.registrationArgs.contractAddress,
                label: ct.registrationArgs.contractAddress,
                disabled: ct.instantiation.disabledForTheChosenSelector
              }
            })}
            className="basic-select"
            classNamePrefix="select"
          ></Select>
        </div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <input
            placeholder="Voting Contract"
            disabled={chooseFromRegisteredContracts}
            defaultValue={initialNewInstanceValuesFromPlayground.votingContract ? initialNewInstanceValuesFromPlayground.votingContract : "none"}
            value={votingContractAddress}
            onChange={(event) => handleVotingContractAddress(event)}
          />
        </div>
      </div>
      <hr />
      <div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          The voting parameters configure the voting instance. Typical fields include the duration
          of the poll, the token address that should be used or the quorum that makes a poll valid.
          Ideally the voting contract is verified on a blockscanner, or the maintainers of the voting
          contract explain how to configure their voting contract in their docs.
        </div>
        <div style={{ display: "inline-block", width: "40%", padding: "5px" }}>
          <button
            disabled={(blockscannerApiKey.length == 0) || chainId == 1337}
            onClick={fetchVotingParameters}
            className="btn btn-primary">
            Encode voting parameters
          </button>
        </div>
        <div style={{ display: "inline-block", width: "60%", padding: "5px", textAlign: "right" }}>
          <input
            width="60%"
            placeholder={(chainId == 137 || chainId == 80001) ? "Enter Polygonscan API key" : "Enter Etherscan API key"}
            disabled={false}
            value={blockscannerApiKey}
            onChange={(event) => handleChangeBlockscannerApiKey(event)}
          />
          <span style={{ paddingLeft: "10px" }}>ⓘ</span>
        </div>
      </div>
      <hr />
      <div style={{ display: displayTypeOfInputFields }}>
        {votingParams.address ?
          <span
            style={linkStyle}
            onClick={() => {
              let baseurl = getBlockexplorerBaseUrlFromChainId(chainId ? chainId : 0, false)
              window.open(baseurl + "/address/" + votingParams.address, "_blank");
            }}>
            See {votingParams.address} on the block explorer.
          </span>
          :
          <></>
        }

        <div >
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            {votingParams.inputs ?
              votingParams.inputs.map((inp, j) => {
                return (
                  <div key={`New div input field ${j}`} style={{ paddingTop: "4px", paddingBottom: "2px" }}>
                    <div style={{ textAlign: "right", display: "inline-block", width: "58%", padding: "5px" }}>
                      {`${inp.name} (${inp.type}):  `}
                    </div>
                    <input
                      style={{ fontFamily: "monospace", textAlign: "left", display: "inline-block", width: "42%", padding: "5px" }}
                      key={`New instance input field ${j}`}
                      id={`New instance input field ${j}`}
                      value={inp.value}
                      onChange={handleVotingParamsUpdate}
                    ></input>
                  </div>
                )
              })
              :
              <></>}
          </div>
        </div>
        <div>
          <div
            className="btn btn-primary"
            style={{
              display: "inline-block", minWidth: "100%", width: "100%",
              padding: "15px"
            }}
            onClick={handleEncodeParameters}>Encode</div>

        </div>
        <hr />

      </div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          Bytes-encoded Voting Parameters:
        </div>
        <textarea
          style={{ fontFamily: "monospace" }}
          cols={63}
          rows={4}
          id="votingParameters"
          value={encodedVotingParameters}
          onChange={handleEncodedParametersChange}>
        </textarea>
      </div>

    </div>

  )
}

export {
  StartNewInstance
}