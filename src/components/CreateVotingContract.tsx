
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
  Info,
  Name,
  EncodeDecode,
  Deadline,
  GetDeadline,
  SupportsInterface,
}

type ContentMappingForContractCode = {
  [name in ContentKeys]: {
    rows: Array<string>,
    variables: Array<string>,
    visible: boolean
  }
}

interface ContractCode {
  text: string,
  content: ContentMappingForContractCode,
  totalRows: number,
  allowEditing: boolean
}

const createVotingContract: () => JSX.Element = () => {
  const { chainId, library } = useWeb3React<Web3Provider>()

  const [contractCode, setContractCode] = useState<ContractCode>({
    text: "",
    totalRows: 6,
    content: {
      [ContentKeys.License]: { rows: [], variables: [], visible: false },
      [ContentKeys.Pragma]: { rows: [], variables: [], visible: false },
      [ContentKeys.Info]: { rows: [], variables: [], visible: false },
      [ContentKeys.Name]: { rows: [], variables: [], visible: false },
      [ContentKeys.EncodeDecode]: { rows: [], variables: [], visible: false },
      [ContentKeys.Deadline]: { rows: [], variables: [], visible: false },
      [ContentKeys.GetDeadline]: { rows: [], variables: [], visible: false },
      [ContentKeys.SupportsInterface]: { rows: [], variables: [], visible: false }
    },
    allowEditing: false
  })
  const [chooseFreestyleEntries, setChooseFreestyleEntries] = useState<boolean>(false)
  const [contractName, setContractName] = useState<string>("")

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

    let twoLines = "\n\n"
    let contractLine = `contract ${content[ContentKeys.Name].rows[0]} ${hasDependencies}\n`
    let end = "\n}"

    let text = (
      (content[ContentKeys.License].visible ?
        content[ContentKeys.License].rows.join('\n') + "\n" :
        "")
      +
      (content[ContentKeys.Pragma].visible ?
        content[ContentKeys.Pragma].rows.join('\n') + "\n" :
        "")
      +
      (content[ContentKeys.Info].visible ?
        twoLines + content[ContentKeys.Info].rows.join('\n') + "\n" :
        "")
      +
      (content[ContentKeys.Name].visible ?
        twoLines + contractLine :
        "")
      +
      (content[ContentKeys.EncodeDecode].visible ?
        content[ContentKeys.EncodeDecode].rows.join('\n') + "\n" :
        "")
      +
      (content[ContentKeys.Deadline].visible ?
        content[ContentKeys.Deadline].rows.join('\n') + "\n" :
        "")
      +
      (content[ContentKeys.GetDeadline].visible ?
        content[ContentKeys.GetDeadline].rows.join('\n') + "\n" :
        "")
      +
      (content[ContentKeys.SupportsInterface].visible ?
        content[ContentKeys.SupportsInterface].rows.join('\n') + "\n" :
        "")
      + (content[ContentKeys.Name].visible ?
        end :
        "")
    )
    return text
  }


  const handleAddOrRemoveLicense = (event: SingleValue<{ value: string, label: string }>) => {
    if (event) {
      let contractCodeTemp = { ...contractCode }
      contractCodeTemp.content[ContentKeys.License] = {
        rows: ["// SPDX-License-Identifier: " + event.value, ""],
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
        rows: [`pragma solidity ${event.value};`, ""],
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
      rows: [event.target.value],
      variables: [],
      visible: true
    }
    let text = getTextFromContentRows(contractCodeTemp.content)
    contractCodeTemp.text = text
    contractCodeTemp.totalRows = getTotalRows(text, chooseFreestyleEntries)
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
            type="text"
            placeholder="Please select a name ..."
            onChange={handleContractNameChange}
          ></input>
        </div>
      </div>
      {/*  Main Text Area */}
      <div
        style={{ display: "inline-block", width: "100%", padding: "5px", marginTop: "10px" }}
        key="VotingContractTextAreaDiv">
        {contractName ? <p style={{ color: "gray" }}>{`Filename: ${contractName}.sol`}</p> : <></>}
        <textarea
          style={{ fontFamily: "monospace" }}
          cols={100}
          rows={contractCode.totalRows}
          disabled={!(contractCode.allowEditing || chooseFreestyleEntries)}
          id="calldata"
          value={contractCode.text}
          onChange={updateContractCode}>
        </textarea>
      </div>
    </div>
  )
}

export {
  createVotingContract
}