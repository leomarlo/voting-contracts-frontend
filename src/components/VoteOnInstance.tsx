import React, { useState } from "react"
import { ethers } from "ethers"
import {
  VotingInstanceInfo,
  DoubleVotingGuard,
  TokenInfo,
  ErcInterfaceFlags,
  InstanceInternalInfo,
  VotingInstanceExternalInfo,
  InstanceInternalInfoAndPointer
} from "../utils/web3"

// interface ErcInterfaceFlags {
//   erc165: boolean,
//   erc721: boolean,
//   erc1155: boolean,
// }

// interface TokenInfo {
//   name: string,
//   symbol: string,
//   address: string,
//   interfaces: ErcInterfaceFlags
// }
// enum DoubleVotingGuard { none, onSender, onVotingData }

// interface VotingInstanceExternalInfo {
//   votingContract: ethers.Contract,
//   identifier: ethers.BigNumber,
//   deadline: string | undefined,
//   ttl: number | undefined,
//   status: string | undefined,
//   token: TokenInfo | undefined,
//   doubleVotingGuard: DoubleVotingGuard | undefined,
//   quorum: { value: string, inUnitsOf: string } | undefined
// }

// interface TargetInterface {
//   id: string | undefined,
//   name?: string,
//   isFunction: boolean
// }

// interface InstanceInternalInfo {
//   index: number,
//   sender: string | undefined,
//   target: TargetInterface
// }

// interface InstancePointer {
//   identifier: ethers.BigNumber,
//   votingContractAddress: string
// }

// type InstanceInternalInfoAndPointer = InstanceInternalInfo & InstancePointer;

// type VotingInstanceInfo = InstanceInternalInfo & InstancePointer & VotingInstanceExternalInfo;



interface VoteOnInstanceArgs {
  instance: VotingInstanceInfo
}

const VoteOnInstance: React.FC<VoteOnInstanceArgs> = ({ instance }: VoteOnInstanceArgs) => {

  const [votingDataOption, setVotingDataOption] = useState(ethers.constants.HashZero)
  let calldata = instance.target.calldata
  let CalldataRows: Array<string> = []
  if (instance.target.isFunction) {
    CalldataRows.push(calldata.slice(0, 10))
    for (let k = 0; k < Math.ceil((calldata.length - 10) / 64); k++) {
      CalldataRows.push(calldata.slice(10 + k * (64), Math.min(10 + (k + 1) * 64, calldata.length)))
    }
  }

  const handleVotingDataSelection = (event: any) => {
    if (event.target.value == "no") {
      setVotingDataOption(ethers.constants.HashZero)
    } else if (event.target.value == "yes") {
      setVotingDataOption(ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 32))
    } else {
      setVotingDataOption(ethers.constants.HashZero)
    }
  }

  return (
    <div>
      <h3> Details about the Voting Instance</h3>
      <p>
        This is instance number {`#${instance.index.toString()}`} of the Playground App. It was instantiated by {instance.sender}.
        {/* It targets the function {instance.target.id} {instance.target.isFunction ? `(${instance.target.name})` : ""}. */}
      </p>
      <hr></hr>
      <table className="table">
        <tbody>
          <tr>
            <th scope="col" >Voting Contract</th>
            <td>
              {`${instance.votingContractAddress}`}
            </td>
          </tr>
          <tr>
            <th scope="col" >Instance Identifier</th>
            <td>
              {`#${instance.identifier.toString()}`}
            </td>
          </tr>
          <tr>
            <th scope="col" >Deadline</th>
            <td>
              {`${instance.deadline}   (${instance.ttl} seconds left)`}
            </td>
          </tr>

          <tr>
            <th scope="col" >Tokend Weighted</th>
            <td>
              {instance.token ? `${instance.token.name} (${instance.token.symbol})` : "No"}
            </td>
          </tr>
          {instance.token ? (<tr>
            <th scope="col" >Token Address</th>
            <td>
              {`${instance.token.address}`}
            </td>
          </tr>) : <></>}
          <tr>
            <th scope="col" >Calldata</th>
            <td style={{ fontFamily: "monospace", maxHeight: "30px", overflowY: "scroll" }}>
              {CalldataRows.join(' ')}
            </td>
          </tr>
        </tbody>
      </table>
      <hr></hr>
      <h4>Vote</h4>
      <div onChange={(event) => handleVotingDataSelection(event)} style={{ width: "70%", padding: "4px", display: "inline-block" }}>
        <div style={{ width: "50%", padding: "4px", display: "inline-block" }}>
          <input type="radio" id="no" name="votingData" value="no" checked={true} /> No
        </div>
        <div style={{ width: "50%", padding: "4px", display: "inline-block" }}>
          <input type="radio" id="yes" name="votingData" value="yes" /> Yes
        </div>
      </div>
      <div style={{ width: "30%", padding: "4px", display: "inline-block" }}>
        <button onClick={(event) => {
          console.log('votingDataOption', votingDataOption)
        }} className="btn btn-success" style={{ width: "100%" }}>Submit</button>
      </div>
    </div>
  )
}

export {
  VoteOnInstance
}