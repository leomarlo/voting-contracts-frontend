import React from "react";

interface ButtonArgs {
  buttonType: string,
  text: string,
  onClick: any,
  minWidth?: string,
  minHeight?: string,
}

const BasicButton: React.FC<ButtonArgs> = ({ buttonType, text, onClick, minWidth, minHeight }: ButtonArgs) => {

  const buttonStyle = {
    borderWidth: "3px",
    minWidth: "200px",
    minHeight: "45px"
  }
  if (minWidth) buttonStyle.minWidth = minWidth;
  if (minHeight) buttonStyle.minHeight = minHeight;


  return (
    <button
      type="button"
      className={"btn btn-outline-" + buttonType}
      style={buttonStyle}
      onClick={onClick}>
      {text}
    </button>
  )
}

export {
  BasicButton
}


