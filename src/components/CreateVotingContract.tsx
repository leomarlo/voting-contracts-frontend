
import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers";

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
  EncodeDecode,
  Deadline,
  GetDeadline,
  SupportsInterface,
}

type ContentMappingForContractCode = {
  [name in ContentKeys]: {
    rows: Array<{ text: string, info: string }>,
    variables: Array<{ text: string, info: string }>,
    visible: boolean
  }
}

interface ContractCode {
  text: string,
  content: ContentMappingForContractCode,
  totalRows: number,
  reverseLookup: { [key: string]: Array<ContentKeys> }
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
      [ContentKeys.License]: { rows: [], variables: [], visible: false },
      [ContentKeys.Pragma]: { rows: [], variables: [], visible: false },
      [ContentKeys.Imports]: { rows: [], variables: [], visible: false },
      [ContentKeys.Info]: { rows: [], variables: [], visible: false },
      [ContentKeys.Name]: { rows: [], variables: [], visible: false },
      [ContentKeys.EncodeDecode]: { rows: [], variables: [], visible: false },
      [ContentKeys.Deadline]: { rows: [], variables: [], visible: false },
      [ContentKeys.GetDeadline]: { rows: [], variables: [], visible: false },
      [ContentKeys.SupportsInterface]: { rows: [], variables: [], visible: false }
    },
    reverseLookup: {},
    allowEditing: false
  })
  const [chooseFreestyleEntries, setChooseFreestyleEntries] = useState<boolean>(false)
  const [contractName, setContractName] = useState<string>("")
  const [votingParamOptions, setVotingParamOptions] = useState<VotingParamOptions>({})

  const updateContractCode = (ev: any) => {
    let contractCodeTemp = { ...contractCode }
    contractCodeTemp.text = ev.target.value

    let minLength = contractCodeTemp.text.split('\n').length + 1
    // make sure its at least 36 long
    if (chooseFreestyleEntries == true) contractCodeTemp.totalRows = Math.max(36, minLength)
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
    setChooseFreestyleEntries(ev.target.checked)

    let contractCodeTemp = { ...contractCode }
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
        return content[c as ContentKeys].rows.map(r => r.text).join('\n') + "\n"
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
        rows: ["// SPDX-License-Identifier: " + event.value, ""]
          .map(t => { return { text: t, info: "license" } }),
        variables: [],
        visible: true
      }
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, chooseFreestyleEntries)

      setContractCode(contractCodeTemp)
    }
  }

  const handlePragmaOptions = (event: SingleValue<{ value: string, label: string }>) => {
    if (event) {
      let contractCodeTemp = { ...contractCode }
      contractCodeTemp.content[ContentKeys.Pragma] = {
        rows: [`pragma solidity ${event.value};`, ""]
          .map(t => { return { text: t, info: "pragma" } }),
        variables: [],
        visible: true
      }
      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, chooseFreestyleEntries)
      setContractCode(contractCodeTemp)
    }
  }

  const handleContractNameChange = (event: any) => {
    setContractName(event.target.value)
    let contractCodeTemp = { ...contractCode }
    contractCodeTemp.content[ContentKeys.Name] = {
      rows: [event.target.value]
        .map(t => { return { text: t, info: "name" } }),
      variables: [],
      visible: true
    }
    let text = getTextFromContentRows(contractCodeTemp.content)
    contractCodeTemp.text = text
    contractCodeTemp.totalRows = getTotalRows(text, chooseFreestyleEntries)
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
        contractCodeTemp.content[ContentKeys.Imports] = {
          rows: [`import { Deadline } from "@leomarlo/voting-registry-contracts/src/extensions/primitives/Deadline.sol";`]
            .map(t => { return { text: t, info: "deadline" } }),
          variables: [{ text: "mapping(uint256=>uint256) internal _deadline;", info: "deadline" }],
          visible: true
        }
        contractCodeTemp.reverseLookup["deadline"] = [ContentKeys.Imports] // change to push
      } else {
        for (let contentKey of contractCodeTemp.reverseLookup["deadline"]) {
          contractCodeTemp.content[contentKey].rows = contractCodeTemp.content[contentKey].rows.filter(r => {
            return r.info != "deadline"
          })
          contractCodeTemp.content[contentKey].variables = contractCodeTemp.content[contentKey].variables.filter(v => {
            return v.info != "deadline"
          })
          contractCodeTemp.content[contentKey].visible = false
        }
      }

      let text = getTextFromContentRows(contractCodeTemp.content)
      contractCodeTemp.text = text
      contractCodeTemp.totalRows = getTotalRows(text, chooseFreestyleEntries)
      setContractCode(contractCodeTemp)


    }
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
          checked={chooseFreestyleEntries}
          value={"choooseFromPlaygroundSelectors"}
          id="choooseFromPlaygroundSelectors"
          onChange={(event) => handleChooseFreestyleEntries(event)} />
        <label style={{ paddingLeft: "10px" }}>
          Write the code without a template
        </label>
      </div>
      <hr />
      <div style={{
        display: (chooseFreestyleEntries ? "none" : "inline-block"),
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
        <h4>Voting Parameters</h4>
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
            disabled={!(contractCode.allowEditing || chooseFreestyleEntries)}
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
          <h6 style={{ margin: "5px", padding: "5px" }}>Available Variables</h6>
          <div style={{ backgroundColor: "#ddd", margin: "5px", padding: "5px", borderStyle: "solid", borderWidth: "1px", borderColor: "#aaa" }}>
            {Object.keys(contractCode.content).map((key: any) => {
              return (
                <>
                  {contractCode.content[key as ContentKeys].variables.map((v: { text: string, info: string }) => {
                    return (
                      <>
                        {v.text + (contractCode.allowEditing ? "  (editing allowed. Cannot track variables!)" : "")}
                        <br />
                      </>
                    )
                  })}
                </>
              )

            })}
          </div>
        </div>
      </div>

    </div >
  )
}

export {
  createVotingContract
}