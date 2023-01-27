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
import {
  isBytesN,
  type2RegexTest,
  isBytes,
  isBytes4,
  isAddress,
  isUint
} from "../utils/format"
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

interface CalldataInputValues { value: string, name: string, type: string, test: RegExp }

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
    votingContract: string,
    deadline: string
  }>({
    targetId: "",
    votingContract: "",
    deadline: ""
  })

  const [deadline, setDeadline] = useState<string>("")
  const [votingParams, setVotingParams] = useState<VotingParams>({ active: false })
  const [votingMetaparameters, setVotingMetaparameters] = useState<undefined | { minQuorum: string, minDuration: string, token: string }>(undefined)
  const [calldataInputValues, setCalldataInputValues] = useState<Array<CalldataInputValues>>([])
  const [calldata, setCalldata] = useState<string>("0x")
  const [calldataEncodingMessage, setCalldataEncodingMessage] = useState<Array<string>>([])
  const [blockscannerApiKey, setBlockscannerApiKey] = useState<string>("")
  const [displayTypeOfInputFields, setDisplayTypeOfInputFields] = useState<"inherit" | "none">("none")
  const [encodedVotingParameters, setEncodedVotingParameters] = useState<string>("")

  const [contractIsFixedByTargetChoice, setContractIsFixedByTargetChoice] = useState<boolean>(false)
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
  const setInitialCalldataInputValuesFromSelector = (value: string) => {
    let fnct = playground.interface.getFunction(value)
    console.log('function is', fnct)
    if (fnct) {
      let _calldataInputValues: Array<CalldataInputValues> = fnct.inputs.map((inp) => {
        return {
          name: inp.name,
          type: inp.type,
          test: type2RegexTest(inp.type),
          value: ""
        }
      })
      setCalldataInputValues(_calldataInputValues)
    }
  }

  const handleChooseFromPlaygroundSelectors = (event: any) => {
    setChooseFromPlaygroundSelectors(event.target.checked)
  }

  const fetchVotingMetaparameters = async (selector: string) => {
    let vmp = await playground.votingMetaParams(selector)
    console.log('vmp', vmp)

    return {
      minDuration: vmp.minDuration.toString(),
      minQuorum: vmp.minQuorum.toString(),
      token: vmp.token
    }
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
      setInitialCalldataInputValuesFromSelector(event.value)

      setCalldata(event.value)
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
          if (contract == ethers.constants.AddressZero) {
            setContractIsFixedByTargetChoice(false)
            setVotingContractAddress("")
          }
          else {
            setContractIsFixedByTargetChoice(true)
            setVotingContractAddress(contract)
          }
        })
      }

      // set the metaparameter for the function selector
      fetchVotingMetaparameters(event.value).then((parameters) => {
        setVotingMetaparameters(parameters)
      })

    }
  }

  const handleFunctionSelector = (event: any) => {
    // set the function selector
    setFunctionSelector(event.target.value)
    // set also the remote initial instance value setter, so that the data is not lost, when
    // the details page is closed (collapsed/hidden)
    let initialNewInstanceValuesTemp = { ...initialNewInstanceValues }
    initialNewInstanceValuesTemp.targetId = event.target.value
    initialNewInstanceValuesTemp.votingContract = votingContractAddress
    initialNewInstanceValuesSetter(initialNewInstanceValuesTemp)
    // set calldataInputValues
    if (event.target.value.match(isBytes4)) {
      try {
        setInitialCalldataInputValuesFromSelector(event.target.value)
      } catch (err) {
        console.log('Got error setting initial calldata input values', err)
      }
    }
    // set calldata until here
    setCalldata(event.target.value)
  }

  // handle calldata input values

  const handleCalldataInputValues = (ev: { target: { id: string, value: string } }) => {
    let hasNumber = ev.target.id.match(/\d+/)
    if (hasNumber !== null) {
      // if hasNumber.length > 0
      let index = parseInt(hasNumber[0]);
      let calldataInputValuesTemp = [...calldataInputValues]
      calldataInputValuesTemp[index].value = ev.target.value
      setCalldataInputValues(calldataInputValuesTemp)
    }

  }

  const handleCalldataUpdate = (ev: any) => {
    setCalldata(ev.target.value)
  }

  const handleCalldataEncoding = (ev: any) => {
    let message: Array<string> = []
    let formatCondition = true;
    for (const input of calldataInputValues) {
      if (input.value.match(input.test) == null) {
        message.push(`Input for ${input.name} does not match the format.`)
        formatCondition = false
      }
    }
    setCalldataEncodingMessage(message)
    if (formatCondition) {
      console.log('Hurray, lets encode')
      let functionName = playground.interface.getFunction(functionSelector).name
      let encoded = playground.interface.encodeFunctionData(functionName, calldataInputValues.map(inp => inp.value))
      setCalldata(encoded)
    }
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


  const submitCreateVotingInstance = async (event: any) => {
    if (library) {
      // library.getSigner().estimateGas.start(encodedVotingParameters,
      //   calldata)
      let tx = await playground.connect(library.getSigner()).start(
        encodedVotingParameters,
        calldata
      )
      console.log('Transaction', tx)
      let receipt = await tx.wait()
      console.log('Receipt:', receipt)
    }

  }


  const defaultEnterAPIKeyMessage = (chainId: number) => {
    if (chainId == 137 || chainId == 80001) {
      return "Enter Polygonscan API key"
    } else if (chainId == 42161 || chainId == 421613) {
      return "Enter Arbiscan API key"
    } else {
      return "Enter Etherscan API key"
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
        <h3> Set Calldata</h3>
        Please enter the calldata that you wish to be executed upon a successful outcome of this voting instance.
        The calldata consists of a selector, which encodes the function that ought to be called, together with the encoded arguments.
        In principle any function can be called on any contract. However, the playground contract has certain guards in place. Some Functions
        can only be executed from a certain voting contract.
        <br />
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
              label: ct.name + ` (${ct.selector})`
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
      <div style={{
        display: calldataInputValues.length == 0 ? "none" : "inline-block",
        width: "100%",
        padding: "5px"
      }}>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          {calldataInputValues.map((inp, j) => {
            return (
              <div key={`New div calldata input field ${j}`} style={{ paddingTop: "4px", paddingBottom: "2px" }}>
                <div style={{ textAlign: "right", display: "inline-block", width: "58%", padding: "5px" }}>
                  {`${inp.name} (${inp.type}):  `}
                </div>
                <input
                  style={{ fontFamily: "monospace", textAlign: "left", display: "inline-block", width: "42%", padding: "5px" }}
                  key={`New calldata input field ${j}`}
                  id={`New calldata input field ${j}`}
                  value={inp.value}
                  onChange={handleCalldataInputValues}
                ></input>
              </div>
            )
          })}
        </div>
        <div style={{
          display: (calldataEncodingMessage.length == 0 ? "none" : "block"),

          margin: "5px",
          borderRadius: "5px",
          padding: "5px",
          backgroundColor: bootstrapColors.warning
        }}>
          {calldataEncodingMessage.map((sentence) => { return (<>{sentence}<br /></>) })}
        </div>
        <div
          className="btn btn-primary"
          style={{
            display: "inline-block", minWidth: "100%", width: "100%",
            padding: "15px"
          }}
          onClick={handleCalldataEncoding}>Encode</div>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          Calldata:
        </div>
        <textarea
          style={{ fontFamily: "monospace" }}
          cols={63}
          rows={4}
          id="calldata"
          value={calldata}
          onChange={handleCalldataUpdate}>
        </textarea>
      </div>
      <hr />
      <div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>

          <input
            type="checkbox"
            checked={chooseFromRegisteredContracts}
            disabled={contractIsFixedByTargetChoice}
            value={"chooseFromRegisteredContracts"}
            id="chooseFromRegisteredContracts"
            onChange={(event) => handleChooseFromRegisteredContracts(event)} />
          <label style={{ paddingLeft: "10px", color: (contractIsFixedByTargetChoice ? "gray" : "black") }}>
            Choose voting contract from registered contracts
          </label>
        </div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <Select
            onChange={(event) => handleVotingContractChoicesChange(event)}
            isDisabled={!chooseFromRegisteredContracts || contractIsFixedByTargetChoice}
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
          <h3> Set Voting Parameters</h3>
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
            placeholder={defaultEnterAPIKeyMessage(chainId as number)}
            disabled={false}
            value={blockscannerApiKey}
            onChange={(event) => handleChangeBlockscannerApiKey(event)}
          />
          <span style={{ paddingLeft: "10px" }}>ⓘ</span>
        </div>
      </div>
      <hr />
      <div style={{ display: (votingMetaparameters ? "block" : "none") }}>
        {
          votingMetaparameters ?
            <table style={{ verticalAlign: "middle", tableLayout: "fixed" }} className="table">
              <tbody>
                <tr>
                  <th>Min Duration</th>
                  <td>{votingMetaparameters.minDuration}</td>
                </tr>
                <tr>
                  <th>Min Quorum</th>
                  <td>{votingMetaparameters.minQuorum}</td>
                </tr>
                <tr>
                  <th>Token</th>
                  <td>{votingMetaparameters.token}</td>
                </tr>
              </tbody>
            </table>
            :
            <></>
        }
      </div>
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
      <div style={{ marginBottom: "10px" }}>
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
      <hr />
      <div style={{ marginBottom: "20px" }}>
        <button
          className="btn btn-success"
          onClick={submitCreateVotingInstance}
        >
          Create Voting Instance
        </button>
      </div>

    </div >

  )
}

export {
  StartNewInstance
}