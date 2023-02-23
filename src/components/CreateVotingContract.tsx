
import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import { bootstrapColors } from "../utils/bootstrap";
import Select, { SingleValue } from 'react-select'
import { DetailsHandling } from "../types/components";
import { ContractInterfaceInfo } from "./ContractInterfaceInfo";

const licenseOptions = [
  "GPL-3.0",
  "MIT",
  "UNLICENSED"
]

const pragmaOptions = [
  "^0.8.13",
  "^0.8.12"
]

enum ContentKeys {
  License,
  Pragma,
  Imports,
  Info,
  Name,
  Constructor,
  EncodeDecodeVotingParams,
  Start,
  Vote,
  Implement,
  Main,
  SupportsInterface,
}

interface VotingContractsArgs {
  detailsHandling: DetailsHandling
}

type ContentMappingForContractCode = {
  [name in ContentKeys]: {
    rows: Array<{ text: string, info: string }>
    visible: boolean
  }
}

interface ContractCode {
  text: string,
  content: ContentMappingForContractCode,
  totalRows: number,
  reverseLookup: { [key: string]: Array<ContentKeys> },
  variables: { [key: string]: Array<string> },
  events: { [key: string]: Array<string> },
  errors: { [key: string]: Array<string> },
  functions: { [key: string]: Array<{ name: string, content: Array<string> }> },
  modifiers: { [key: string]: Array<{ name: string, content: Array<string> }> },
  allowEditing: boolean
}

interface VotingParamOptions {
  options: {
    deadline?: boolean,
    quorum?: boolean,
    doubleVotingGuard?: boolean,
    bareBonesImplement?: boolean
  }
  allDisabled: boolean
}

const createVotingContract: (votingContractsArgs: VotingContractsArgs) => JSX.Element =
  ({ detailsHandling }: VotingContractsArgs) => {
    const { chainId, library } = useWeb3React<Web3Provider>()

    const [contractCode, setContractCode] = useState<ContractCode>({
      text: "",
      totalRows: 6,
      content: {
        [ContentKeys.License]: { rows: [], visible: false },
        [ContentKeys.Pragma]: { rows: [], visible: false },
        [ContentKeys.Imports]: { rows: [], visible: false },
        [ContentKeys.Info]: { rows: [], visible: false },
        [ContentKeys.Name]: { rows: [], visible: false },
        [ContentKeys.Constructor]: { rows: [], visible: false },
        [ContentKeys.EncodeDecodeVotingParams]: { rows: [], visible: false },
        [ContentKeys.Start]: { rows: [], visible: false },
        [ContentKeys.Vote]: { rows: [], visible: false },
        [ContentKeys.Implement]: { rows: [], visible: false },
        [ContentKeys.Main]: { rows: [], visible: false },
        [ContentKeys.SupportsInterface]: { rows: [], visible: false },
      },
      reverseLookup: {},
      variables: {},
      events: {},
      errors: {},
      functions: {},
      modifiers: {},
      allowEditing: false
    })
    const [contractName, setContractName] = useState<string>("")
    const [votingParamOptions, setVotingParamOptions] = useState<VotingParamOptions>({ options: {}, allDisabled: true })
    const [functionInspection, setFunctionInspection] = useState<{ option?: string, function?: string }>({})
    const [useBareBonesVotingContract, setUseBareBonesVotingContract] = useState<boolean>(false)

    const updateContractCode = (ev: any) => {
      let contractCodeTemp = { ...contractCode }
      contractCodeTemp.text = ev.target.value

      let minLength = contractCodeTemp.text.split('\n').length + 1
      // make sure its at least 36 long
      if (contractCode.allowEditing == true) contractCodeTemp.totalRows = Math.max(36, minLength)
      // Should be at least 6 long
      else contractCodeTemp.totalRows = Math.max(6, minLength)

      setContractCode(contractCodeTemp)
    }

    const getTotalRows = (text: string, freestyle: boolean) => {
      let minLength = text.split('\n').length + 1
      // make sure its at least 36 long
      if (freestyle) return Math.max(36, minLength)
      // Should be at least 6 long
      else return Math.max(6, minLength)

    }

    const handleChooseFreestyleEntries = (ev: any) => {


      let contractCodeTemp = { ...contractCode }

      contractCodeTemp.allowEditing = ev.target.checked
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(contractCodeTemp.text, ev.target.checked)

      setContractCode(contractCodeTemp)


    }

    const deleteFromContractCode = (contractCode: ContractCode, whichOption: string) => {
      // delete the rows with deadline in them
      for (let contentKey of contractCode.reverseLookup[whichOption]) {
        contractCode.content[contentKey].rows = contractCode.content[contentKey].rows.filter(r => {
          return r.info != whichOption
        })
        contractCode.content[contentKey].visible = false
      }

      // delete the deadline variables, errors, events, functions and modifiers
      contractCode.variables[whichOption] = []
      contractCode.errors[whichOption] = []
      contractCode.events[whichOption] = []
      contractCode.functions[whichOption] = []
      contractCode.modifiers[whichOption] = []
    }

    const getTextFromContentRows: ((content: ContentMappingForContractCode) => string) = (content) => {
      let dependencies = []
      let hasDependencies = dependencies.length > 0 ? "is" : "{"

      let end = "\n}"

      let text = Object.keys(content).map((c: any) => {
        if (content[c as ContentKeys].visible) {
          if (c == ContentKeys.Name) {
            return `contract ${content[ContentKeys.Name].rows[0].text} ${hasDependencies}\n\n`
          }
          return content[c as ContentKeys].rows.map(r => r.text).join('\n') + "\n\n"
        }
        return ""
      }).join("") + (content[ContentKeys.Name].visible ? end : "");

      // let text = "hallo"
      return text
    }


    const handleAddOrRemoveLicense = (event: SingleValue<{ value: string, label: string }>) => {
      if (event) {
        let contractCodeTemp = { ...contractCode }
        contractCodeTemp.content[ContentKeys.License] = {
          rows: ["// SPDX-License-Identifier: " + event.value]
            .map(t => { return { text: t, info: "license" } }),
          visible: true
        }
        let text = getTextFromContentRows(contractCodeTemp.content)
        contractCodeTemp.text = text
        contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)

        setContractCode(contractCodeTemp)
      }
    }

    const handlePragmaOptions = (event: SingleValue<{ value: string, label: string }>) => {
      if (event) {
        let contractCodeTemp = { ...contractCode }
        contractCodeTemp.content[ContentKeys.Pragma] = {
          rows: [`pragma solidity ${event.value};`]
            .map(t => { return { text: t, info: "pragma" } }),
          visible: true
        }
        let text = getTextFromContentRows(contractCodeTemp.content)
        contractCodeTemp.text = text
        contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
        setContractCode(contractCodeTemp)
      }
    }

    const handleContractNameChange = (event: any) => {
      setContractName(event.target.value)
      let contractCodeTemp = { ...contractCode }
      contractCodeTemp.content[ContentKeys.Name] = {
        rows: [event.target.value]
          .map(t => { return { text: t, info: "name" } }),
        visible: true
      }
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
      setContractCode(contractCodeTemp)
    }


    const handleChooseVotingParams = (event: any, typeOfVotingParam: string) => {
      // TODO: also change disableChooseBareBonesContractTemplate
      let votingParamOptionsTemp = { ...votingParamOptions }
      if (typeOfVotingParam == "deadline") {
        // handling the checkbox status
        votingParamOptionsTemp.options.deadline = event.target.checked
        console.log('options', votingParamOptionsTemp.options)
        // handling the info
        let contractCodeTemp = { ...contractCode }
        if (event.target.checked) {
          // add the content whereever it is needed
          contractCodeTemp.content[ContentKeys.Imports] = {
            rows: [`import { Deadline } from "@leomarlo/voting-registry-contracts/src/extensions/primitives/Deadline.sol";`]
              .map(t => { return { text: t, info: "deadline" } }),
            visible: true
          }
          contractCodeTemp.variables["deadline"] = ["mapping(uint256=>uint256) internal _deadline;"]
          contractCodeTemp.errors["deadline"] = [
            "DeadlineHasPassed(uint256 identifier, uint256 deadline);",
            "DeadlineHasNotPassed(uint256 identifier, uint256 deadline);"]
          contractCodeTemp.functions["deadline"] = [
            {
              name: "function _setDeadline(uint256 identifier, uint256 duration) internal;",
              content: [
                "function _setDeadline(uint256 identifier, uint256 duration) internal {",
                "\t_deadline[identifier] = block.timestamp + duration;",
                "}"
              ]
            },
            {
              name: "function _deadlineHasPassed(uint256 identifier) internal view returns(bool hasPassed);",
              content: [
                "function _deadlineHasPassed(uint256 identifier) internal view returns(bool hasPassed) {",
                "\thasPassed = block.timestamp > _deadline[identifier];",
                "}"
              ]
            }
          ]
          contractCodeTemp.reverseLookup["deadline"] = [ContentKeys.Imports] // change to push
        } else {
          deleteFromContractCode(contractCodeTemp, "deadline")
        }

        let text = getTextFromContentRows(contractCodeTemp.content)
        contractCodeTemp.text = text
        contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
        setContractCode(contractCodeTemp)


      }

      // handling allDisabled field
      let allDisabled = Object.keys(votingParamOptionsTemp.options).every(k => !votingParamOptionsTemp.options[k as keyof typeof votingParamOptionsTemp.options])
      votingParamOptionsTemp.allDisabled = allDisabled
      console.log('allDisabled', votingParamOptionsTemp)
      // set voting params options
      setVotingParamOptions(votingParamOptionsTemp)

    }


    const handleSeeFunction = (event: any, option: string, func: string) => {
      let tempFunctionInspection = { ...functionInspection }
      if (functionInspection.option == option) {
        tempFunctionInspection.option = undefined
        tempFunctionInspection.function = undefined

      } else {

        tempFunctionInspection.option = option
        tempFunctionInspection.function = func
      }
      setFunctionInspection(tempFunctionInspection)
    }

    const handleBareBonesVotingContracts = (event: any) => {
      // set the boolean variable
      setUseBareBonesVotingContract(event.target.checked ? true : false)

      // depending on whether its checked or not add the template from bare bones or from contract with hooks
      let contractCodeTemp = { ...contractCode }
      if (event.target.checked) {
        // delete all the base template code first
        // TODO:


        // add the bare bones contract
        contractCodeTemp.content[ContentKeys.Imports] = {
          rows: [`import { IVotingContract } from "@leomarlo/voting-registry-contracts/src/votingContractStandard.sol";`]
            .map(t => { return { text: t, info: "bareBones" } }),
          visible: true
        }
        contractCodeTemp.content[ContentKeys.Start] = {
          rows: [
            `/// @dev starts a new voting instance.`,
            `/// @param votingParams byte-encoded parameters that configure the voting instance`,
            `/// @param callback calldata that gets executed when the motion passes`,
            `/// @return identifier the instance identifier that needs to be referenced to vote on this motion.`,
            `function start(bytes memory votingParams, bytes calldata callback)`,
            `public`,
            `override(IVotingContract)`,
            `returns(uint256 identifier) {`,
            ``,
            `    // your code goes here`,
            ``,
            `}`,
            ``
          ]
            .map(t => { return { text: t, info: "bareBones" } }),
          visible: true
        }
        contractCodeTemp.content[ContentKeys.Vote] = {
          rows: [
            `/// @dev casts a vote on a voting instance referenced by the identifier`,
            `/// @param identifier unique identifier of the voting instance on which one would like to cast a vote`,
            `/// @param votingData carries byte-encoded information about the vote`,
            `/// @return status information for the caller, whether the vote has triggered any changes to the status`,
            `function vote(uint256 identifier, bytes calldata votingData) `,
            `public `,
            `override(IVotingContract) `,
            `returns (uint256 status) {`,
            ``,
            `    // your code goes here`,
            ``,
            `}`,
            ``
          ]
            .map(t => { return { text: t, info: "bareBones" } }),
          visible: true
        }

        contractCodeTemp.reverseLookup["bareBones"] = [ContentKeys.Start, ContentKeys.Vote] // change to push
      } else {
        deleteFromContractCode(contractCodeTemp, "bareBones")
      }

      // set the new contract code
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
      setContractCode(contractCodeTemp)


    }

    return (
      <div>
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <p>
            Here you can create your own voting contracts either from templates or freestyle.
          </p>
        </div>
        <hr />
        {/*  Input Freestyle or from Template */}
        <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
          <input
            type="checkbox"
            checked={contractCode.allowEditing}
            value={"choooseFromPlaygroundSelectors"}
            id="choooseFromPlaygroundSelectors"
            onChange={(event) => handleChooseFreestyleEntries(event)} />
          <label style={{ paddingLeft: "10px" }}>
            Write the code without a template <span style={{ color: bootstrapColors.danger }}>{contractCode.allowEditing ? "(You will loose your edited changes if you uncheck! Will be fixed in the next version!)" : ""}</span>
          </label>
        </div>
        <hr />
        <div style={{
          display: (contractCode.allowEditing ? "none" : "inline-block"),
          width: "100%"
        }}>
          <div style={{
            display: "block",
            width: "50%",
            padding: "5px"
          }}>
            <Select
              onChange={(event) => handleAddOrRemoveLicense(event)}
              isDisabled={false}
              // defaultValue={licenseOptions[0]}
              placeholder="Select License ..."
              options={licenseOptions.map((opt) => {
                return {
                  value: opt,
                  label: opt
                }
              })}
              className="basic-select"
              classNamePrefix="select"
            ></Select>
          </div>

          <div style={{
            display: "block",
            width: "50%",
            padding: "5px"
          }}>
            <Select
              onChange={(event) => handlePragmaOptions(event)}
              isDisabled={false}
              // defaultValue={licenseOptions[0]}
              placeholder="Select Solidity Compiler Version ..."
              options={pragmaOptions.map((opt) => {
                return {
                  value: opt,
                  label: opt
                }
              })}
              className="basic-select"
              classNamePrefix="select"
            ></Select>
          </div>
          <div style={{
            display: "block",
            width: "50%",
            padding: "5px"
          }}>
            <input
              value={contractName}
              key="ContractNameSelection"
              size={50}
              type="text"
              placeholder="Please select a name ..."
              onChange={handleContractNameChange}
            ></input>
          </div>
          <hr />
          <h5>Template choice</h5>
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            <input
              type="checkbox"
              checked={useBareBonesVotingContract}
              value={"useBareBones"}
              id="useBareBones"
              disabled={!votingParamOptions.allDisabled}
              onChange={(event) => handleBareBonesVotingContracts(event)} />
            <label style={{ paddingLeft: "10px" }}>
              <div style={{ display: "inline", color: (!votingParamOptions.allDisabled ? "gray" : "black") }}>
                Use bare bones Voting Contract template
                <span style={{ color: bootstrapColors.danger }}>
                  {contractCode.allowEditing ? "(You will loose your edited changes if you uncheck! Will be fixed in the next version!)" : ""}
                </span>
              </div>
            </label>
          </div>
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            <span
              onClick={() => {
                // focus on details
                detailsHandling.focusOnDetailsSetter(true)
                // open new details page
                detailsHandling.detailsSetter(<ContractInterfaceInfo whichContract="votingContractStandard" detailshandling={detailsHandling} />)
              }}
              style={{ color: "coral" }}>{"View Voting Contract Standard.      \u261B"}</span>
          </div>
          <div style={{ display: "inline-block", width: "100%", padding: "5px" }}>
            <span style={{ color: "coral" }}>{"View Plain Voting Contract Implementation with basic hooks.      \u261B"}</span>
          </div>
          <hr />
          <div style={{
            display: (useBareBonesVotingContract ? "none" : "block")
          }}>
            <h5>Voting Parameters</h5>
            <div style={{
              display: "block",
              width: "100%",
              padding: "5px",

            }}>
              <input
                type="checkbox"
                checked={votingParamOptions.options.deadline}
                value={"chooseDeadline"}
                id="chooseDeadline"
                onChange={(event) => handleChooseVotingParams(event, "deadline")}>
              </input><div style={{ display: "inline", marginLeft: "20px" }}> add deadline option </div>
            </div>
          </div>

        </div>
        <hr />
        {/*  Main Text Area */}
        <div className="row">
          <div
            className="col-12"
            style={{ padding: "5px", marginTop: "10px" }}
            key="VotingContractTextAreaDiv">
            {contractName ? <p style={{ color: "gray" }}>{`Filename: ${contractName}.sol`}</p> : <></>}
            <textarea
              style={{ fontFamily: "monospace" }}
              cols={120}
              rows={contractCode.totalRows}
              disabled={!(contractCode.allowEditing)}
              id="calldata"
              value={contractCode.text}
              onChange={updateContractCode}>
            </textarea>
          </div>
        </div>
        <div className="row">
          <div
            className="col-12"
            style={{ padding: "5px", marginTop: "10px" }}
            key="VotingContractVariablesDiv">
            <h6 style={{ margin: "5px", padding: "5px" }}>Available Variables <span style={{ color: "red" }}>{(contractCode.allowEditing ? "\t(EDITING ENABLED. CANNOT TRACK VARIABLES!)" : "")}</span></h6>
            <div style={{ fontFamily: "monospace", backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa" }}>
              {Object.keys(contractCode.variables).map((key: any) => {
                console.log('contractCodeVariables', key)
                if (contractCode.variables[key].length > 0) {
                  return (
                    <>
                      {"// " + key}<br />
                      {contractCode.variables[key].map(v => { return <>{v}</> })}
                      <br />
                    </>
                  )
                } else {
                  return <></>
                }


              })}
            </div>

            <h6 style={{ margin: "5px", padding: "5px" }}>Available Functions (you may click on them for inspection) <span style={{ color: "red" }}>{(contractCode.allowEditing ? "\t(EDITING ENABLED. CANNOT TRACK VARIABLES!)" : "")}</span></h6>
            <div style={{ fontFamily: "monospace", backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa" }}>
              {Object.keys(contractCode.functions).map((key: any) => {
                if (contractCode.functions[key].length > 0) {
                  return (
                    <>
                      {"// " + key}<br />
                      {contractCode.functions[key].map(v => {
                        return (
                          <>
                            <span onClick={(event) => handleSeeFunction(event, key, v.name)}>
                              {v.name}
                            </span>
                            <br />
                          </>)
                      })}
                      <br />
                    </>
                  )
                } else {
                  return <></>
                }

              })}
            </div>
            <div style={{
              display: functionInspection.option ? "inline-block" : "none"
            }}>
              <h6 style={{ margin: "5px", padding: "5px" }}>Inspect Function </h6>
              <div
                style={{
                  fontFamily: "monospace",
                  backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa"
                }}>

                {
                  functionInspection.option ?
                    contractCode.functions[functionInspection.option].filter(f => {
                      return (f.name == functionInspection.function)
                    })[0].content.map(row => {
                      let tab = "\t"
                      let indentationsMatch = row.match(RegExp(`[${tab}]*`))
                      return (
                        <>
                          {indentationsMatch ?
                            <div style={{ color: "darkgoldenrod", display: "inline", marginLeft: `${indentationsMatch[0].length * (10 * 4)}px` }}>
                              {row}
                            </div> :
                            <div style={{ color: "darkgoldenrod", display: "inline" }}>
                              {row}
                            </div>
                          }
                          <br />
                        </>
                      )
                    }) :
                    ""
                }
              </div>
            </div>

          </div>
        </div>

      </div >
    )
  }

export {
  createVotingContract
}