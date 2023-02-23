import React from "react"
import { DetailsHandling } from "../types/components";
import { closeDetails } from "./details/details";


interface ContractInterfaceInfoArgs {
  whichContract: string,
  detailshandling: DetailsHandling
}

const turnStringToElement: (text: string) => JSX.Element = (text: string) => {
  let tab = "\t"
  let newLine = "\n"
  let tabRegex = new RegExp(`[${tab}]*`)
  let commentRegex = new RegExp(`^[\s]*///`)
  let textLines = text.split(newLine)
  console.log(textLines)
  let lineElements = textLines.map((row) => {
    let indentationsMatch = row.match(tabRegex)
    let isComment = row.match(commentRegex)

    if (row == '') {
      return <><br /></>
    } else {
      return (
        <>
          {indentationsMatch ?
            <div style={{
              display: "inline-block",
              marginLeft: `${indentationsMatch[0].length * (10 * 4)}px`,
              color: (isComment ? "green" : "black")
            }}>
              {row}
            </div> :
            <div style={{ display: "inline-block" }}>
              {row}
            </div>
          }
        </>
      )
    }
  })
  return (
    <div style={{ fontFamily: "monospace" }}>
      {lineElements}
    </div>
  )
}


let IVotingContract: () => JSX.Element = () => {
  return turnStringToElement(
    `//SPDX-License-Identifier: GPL-3.0\n
    pragma solidity ^0.8.13;\n
    \n
    import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";\n
    \n
    \n
    /// @title Configurable Voting Contract Interface\n
    /// @author Leonhard Horstmeyer <leomarlo.eth@gmail.com>\n
    /// @dev A Voting Contract is an implementations of a particular type of voting mechanism. \n
    ///      It can be thought of as a standalone contract that handles the entire life-cycle of voting, \n
    ///      from the initialization, via the casting of votes to the retrieval of results. Optionally it can\n
    ///      be extended by the functionality of triggering the outcome of the vote through a call whose calldata is already passsed at the initialization.\n 
    ///      The standard allows for a great deal of versatility and modularity. Versatility stems from the fact that \n
    ///      the standard doesn't prescribe any particular way of defining the votes and the status of the vote. But it does\n
    ///      define a universal interface used by them all.  \n
    \n
    \n
    \n
    interface IVotingContract is IERC165{\n
        \t///  Note: the ERC-165 identifier for this interface is 0x9452d78d.\n
        \t///  0x9452d78d ===\n
        \t///         bytes4(keccak256('start(bytes,bytes)')) ^\n
        \t///         bytes4(keccak256('vote(uint256,bytes)')) ^\n
        \t///         bytes4(keccak256('result(uint256)'));\n
        \t///\n
        \t\n
        \t/// @notice The states first three statuses are recommended to be\n 
        \t///         'inactive', 'completed' and 'failed'.\n
        \tenum VotingStatus {inactive, completed, failed, active}\n
        \t\n
        \t/// @notice When a new instance is started this event gets triggered.\n
        \tevent VotingInstanceStarted(uint256 indexed identifier, address caller);\n
        \t\n
        \t/// @notice starts a new voting instance.\n
        \t/// @param votingParams byte-encoded parameters that configure the voting instance\n
        \t/// @param callback calldata that gets executed when the motion passes\n
        \t/// @return identifier the instance identifier that needs to be referenced to vote on this motion.\n
        \tfunction start(bytes memory votingParams, bytes calldata callback) external returns(uint256 identifier);\n 
        \t\n
        \t/// @notice casts a vote on a voting instance referenced by the identifier\n
        \t/// @param identifier unique identifier of the voting instance on which one would like to cast a vote\n
        \t/// @param votingData carries byte-encoded information about the vote\n
        \t/// @return status information for the caller, whether the vote has triggered any changes to the status\n
        \tfunction vote(uint256 identifier, bytes calldata votingData) external returns(uint256 status);\n
        \t\n
        \t/// @notice returns the result of the voting instance\n
        \t/// @dev The result can be the byte-encoded version of an address, an integer or a pointer to a mapping that contains the entire result.\n
        \t/// @param identifier unique identifier for which one would like to know the result\n
        \t/// @return resultData byte-encoded data that encodes the result.\n
        \tfunction result(uint256 identifier) external view returns(bytes memory resultData);\n
        \t\n
    }\n
    \n
    `
  )
}


const ContractInterfaceInfo: React.FC<ContractInterfaceInfoArgs> = ({ whichContract, detailshandling }: ContractInterfaceInfoArgs) => {

  if (whichContract == "votingContractStandard") {
    return (
      <div style={{ overflowY: "scroll", maxHeight: "90vh", paddingBottom: "40px" }}>
        <button onClick={(e) => closeDetails(e, detailshandling)} className="btn btn-success">Hide Details</button>
        <hr />
        <div
          style={{ backgroundColor: "#ccc", margin: "20px", padding: "10px" }}>
          {
            IVotingContract()
          }
        </div>
      </div>
    )
  }
  else {
    return <></>
  }
}


export {
  ContractInterfaceInfo
}