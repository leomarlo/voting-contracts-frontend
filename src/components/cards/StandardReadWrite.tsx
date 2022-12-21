import React, { useState } from "react";
import { bootstrapColors, bootstrapColorsInterface } from "../../utils/bootstrap"
import { SimpleForm, FormPrimitive } from "../forms/SimpleForm";
import { InputDataOneEntry } from "../../types/components"

interface StandardReadWriteCardArgs {
  buttonCallback: any
  headerColor: string;
  cardTitle: string;
  cardBody: string | JSX.Element;
  buttonType: string;
  buttonText?: string;
  identifier: string;
  marginTop: number;
  marginBottom: number;
}



interface FormReadWriteCardArgs extends StandardReadWriteCardArgs {
  inputData: Array<InputDataOneEntry>;
}

const StandardReadWriteCard: React.FC<StandardReadWriteCardArgs> = (
  {
    buttonCallback,
    headerColor,
    cardTitle,
    cardBody,
    buttonType,
    buttonText,
    identifier,
    marginTop,
    marginBottom
  }: StandardReadWriteCardArgs
) => {

  const buttonTextOptions = ["See Details", "Collapse Details"]
  const [buttonTextIndex, setButtonTextIndex] = useState(0)
  const cardMarginsTopAndBottom = ` mt-${marginTop.toString()} mb-${marginBottom.toString()} `

  let buttonTextDisplayed = buttonText ? buttonText : buttonTextOptions[buttonTextIndex]

  const bg = bootstrapColors[headerColor as keyof bootstrapColorsInterface]


  return (
    <div key={identifier} className={"card" + cardMarginsTopAndBottom}>
      <div className="card-header" style={{ backgroundColor: bg }}></div>
      <div className="card-body">
        <h5 className="card-title">{cardTitle}</h5>
        <div>{cardBody}</div><br />
        <a onClick={buttonCallback} className={"btn btn-" + buttonType}>{buttonTextDisplayed}</a>
      </div>
    </div>
  )
}


const FormReadWriteCard: React.FC<FormReadWriteCardArgs> = (
  {
    buttonCallback,
    headerColor,
    cardTitle,
    cardBody,
    buttonType,
    buttonText,
    identifier,
    inputData,
    marginTop,
    marginBottom
  }: FormReadWriteCardArgs
) => {

  const buttonTextOptions = ["See Details", "Collapse Details"]
  const [buttonTextIndex, setButtonTextIndex] = useState(0)
  const cardMarginsTopAndBottom = ` mt-${marginTop.toString()} mb-${marginBottom.toString()} `

  let buttonTextDisplayed = buttonText ? buttonText : buttonTextOptions[buttonTextIndex]

  const bg = bootstrapColors[headerColor as keyof bootstrapColorsInterface]


  //     < SimpleForm label = {`${inputNames[k]} (${inputTypes[k]})`
  // } key = { method.name as string } />
  let formInputs: Array<JSX.Element> = [];
  for (let i = 0; i < inputData.length; i++) {
    formInputs.push(
      <FormPrimitive
        label={`${inputData[i].label} (${inputData[i].specification})`}
        key={identifier}
        value={inputData[i].value} />)
  }


  return (
    <div key={identifier} className={"card" + cardMarginsTopAndBottom}>
      <div className="card-header" style={{ backgroundColor: bg }}></div>
      <div className="card-body">
        <h5 className="card-title">{cardTitle}</h5>
        <form>
          {formInputs}
        </form>
        <div>{cardBody}</div><br />
        <a onClick={buttonCallback} className={"btn btn-" + buttonType}>{buttonTextDisplayed}</a>
      </div>
    </div>
  )
}

export {
  FormReadWriteCard,
  FormReadWriteCardArgs,
  StandardReadWriteCard,
  StandardReadWriteCardArgs
}