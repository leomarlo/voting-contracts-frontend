import React, { useState } from "react";
import { bootstrapColors, bootstrapColorsInterface } from "../../utils/bootstrap"

interface StandardReadWriteCardArgs {
  callback: any
  headerColor: string;
  cardTitle: string;
  cardText: string;
  buttonType: string;
  marginTop: number;
  marginBottom: number;
}

const StandardReadWriteCard: React.FC<StandardReadWriteCardArgs> = (
  {
    callback,
    headerColor,
    cardTitle,
    cardText,
    buttonType,
    marginTop,
    marginBottom
  }: StandardReadWriteCardArgs
) => {

  const buttonTextOptions = ["See Details", "Collapse Details"]
  const [buttonTextIndex, setButtonTextIndex] = useState(0)
  const cardMarginsTopAndBottom = ` mt-${marginTop.toString()} mb-${marginBottom.toString()} `

  const bg = bootstrapColors[headerColor as keyof bootstrapColorsInterface]

  const changeButtonText = () => {
    (buttonTextIndex == 1) ? setButtonTextIndex(0) : setButtonTextIndex(1)
  }

  const combinedCallback = () => {
    callback()
    changeButtonText()
  }


  return (
    <div className={"card" + cardMarginsTopAndBottom}>
      <div className="card-header" style={{ backgroundColor: bg }}></div>
      <div className="card-body">
        <h5 className="card-title">{cardTitle}</h5>
        <p className="card-text">{cardText}</p>
        <a onClick={combinedCallback} className={"btn btn-" + buttonType}>{buttonTextOptions[buttonTextIndex]}</a>
      </div>
    </div>
  )
}

export {
  StandardReadWriteCard,
  StandardReadWriteCardArgs
}