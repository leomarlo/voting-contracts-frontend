
import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";
import { bootstrapColors } from "../utils/bootstrap";
import Select, { SingleValue } from 'react-select'

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
  EncodeDecode,
  Deadline,
  GetDeadline,
  SupportsInterface,
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
  deadline?: boolean,
  quorum?: boolean,
  doubleVotingGuard?: boolean
}

const createVotingContract: () => JSX.Element = () => {
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
      [ContentKeys.EncodeDecode]: { rows: [], visible: false },
      [ContentKeys.Deadline]: { rows: [], visible: false },
      [ContentKeys.GetDeadline]: { rows: [], visible: false },
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
  const [votingParamOptions, setVotingParamOptions] = useState<VotingParamOptions>({})
  const [functionInspection, setFunctionInspection] = useState<{ option?: string, function?: string }>({})

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

  const getTextFromContentRows: ((content: ContentMappingForContractCode) => string) = (content) => {
    let dependencies = []
    let hasDependencies = dependencies.length > 0 ? "is" : "{"

    let end = "\n}"

    let text = Object.keys(content).map((c: any) => {
      console.log(c)
      if (content[c as ContentKeys].visible) {
        if (c == ContentKeys.Name) {
          return `contract ${content[ContentKeys.Name].rows[0].text} ${hasDependencies}\n`
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
    let votingParamOptionsTemp = { ...votingParamOptions }
    if (typeOfVotingParam == "deadline") {
      // handling the checkbox status
      votingParamOptionsTemp.deadline = event.target.checked
      setVotingParamOptions(votingParamOptionsTemp)

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
          "DeadlineHasNotPassed(uint256 identifier, uint256 deadline);"
        ]
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
        // delete the rows with deadline in them
        for (let contentKey of contractCodeTemp.reverseLookup["deadline"]) {
          contractCodeTemp.content[contentKey].rows = contractCodeTemp.content[contentKey].rows.filter(r => {
            return r.info != "deadline"
          })
          contractCodeTemp.content[contentKey].visible = false
        }

        // delete the deadline variables, errors, events, functions and modifiers
        contractCodeTemp.variables["deadline"] = []
        contractCodeTemp.variables["errors"] = []
        contractCodeTemp.variables["events"] = []
        contractCodeTemp.variables["functions"] = []
        contractCodeTemp.variables["modifiers"] = []

      }

      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, contractCodeTemp.allowEditing)
      setContractCode(contractCodeTemp)


    }
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
        <h5>Voting Parameters</h5>
        <div style={{
          display: "block",
          width: "50%",
          padding: "5px"
        }}>
          <input
            type="checkbox"
            checked={votingParamOptions.deadline}
            value={"chooseDeadline"}
            id="chooseDeadline"
            onChange={(event) => handleChooseVotingParams(event, "deadline")}>
          </input><div style={{ display: "inline", marginLeft: "20px" }}> add deadline option </div>
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
              return (
                <>
                  {"// " + key}<br />
                  {contractCode.variables[key].map(v => { return <>{v}</> })}
                  <br />
                </>
              )

            })}
          </div>

          <h6 style={{ margin: "5px", padding: "5px" }}>Available Functions <span style={{ color: "red" }}>{(contractCode.allowEditing ? "\t(EDITING ENABLED. CANNOT TRACK VARIABLES!)" : "")}</span></h6>
          <div style={{ fontFamily: "monospace", backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa" }}>
            {Object.keys(contractCode.functions).map((key: any) => {
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