import React, { useState } from "react";
import { bootstrapColors, bootstrapColorsInterface } from "../../utils/bootstrap"
import { SimpleForm, FormPrimitive } from "../forms/SimpleForm";
import { InputDataOneEntry, FormSubmissionCallbackType } from "../../types/components"


interface StandardReadWriteCardArgs {
  buttonCallback: FormSubmissionCallbackType;
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
        <a onClick={(e) => buttonCallback([""], "")} className={"btn btn-" + buttonType}>{buttonTextDisplayed}</a>
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
        defaultValue={inputData[i].defaultValue}
        value={inputData[i].defaultValue} />)
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
        <a onClick={() => buttonCallback([""], "")} className={"btn btn-" + buttonType}>{buttonTextDisplayed}</a>
      </div>
    </div>
  )
}


const FormReadWriteCardTest: React.FC<FormReadWriteCardArgs> = (
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
  const [inputValues, setInputValues] = useState(inputData.map((e) => ""))
  const cardMarginsTopAndBottom = ` mt-${marginTop.toString()} mb-${marginBottom.toString()} `

  let buttonTextDisplayed = buttonText ? buttonText : buttonTextOptions[buttonTextIndex]

  const bg = bootstrapColors[headerColor as keyof bootstrapColorsInterface]


  const handleFormChange = (index: number, event: any) => {
    let data = [...inputValues];
    data[index] = event.target.value
    setInputValues(data)
  }

  let formInputs: Array<JSX.Element> = [];
  for (let i = 0; i < inputData.length; i++) {
    formInputs.push(
      <FormPrimitive
        label={`${inputData[i].label} (${inputData[i].specification})`}
        key={identifier}
        value={inputValues[i]}
        defaultValue={inputData[i].defaultValue}
        onChange={event => handleFormChange(i, event)} />)
  }

  const testfnc = () => {
    for (let j = 0; j < inputValues.length; j++) {
      console.log(`The ${j}-th input value is ${inputValues[j]}`)
    }
  }

  // TODO: Maybe treat cardTitle and functionName differently.
  return (
    <div key={identifier} className={"card" + cardMarginsTopAndBottom}>
      <div className="card-header" style={{ backgroundColor: bg }}></div>
      <div className="card-body">
        <h5 className="card-title">{cardTitle}</h5>
        <form>
          {formInputs}
        </form>
        <div>{cardBody}</div><br />
        <a onClick={(e) => buttonCallback(inputValues, cardTitle)} className={"btn btn-" + buttonType}>{buttonTextDisplayed}</a>
      </div>
    </div>
  )
}

export {
  FormReadWriteCardTest,
  FormReadWriteCard,
  FormReadWriteCardArgs,
  StandardReadWriteCard,
  StandardReadWriteCardArgs
}