import React, { ChangeEventHandler, CSSProperties, useState } from "react"

interface SimpleFormArgs {
  label: string,
  id: string,
  value: string,
  type: "text" | "number",
  defaultValue?: string | number,
  placeholder?: string,
  onChange?: ChangeEventHandler<HTMLInputElement>,
  minLabelWidth?: string,
  minInputWidth?: string,
}

const FormPrimitive: React.FC<SimpleFormArgs> = ({ label, id, value, type, defaultValue, placeholder, minLabelWidth, minInputWidth, onChange }: SimpleFormArgs) => {
  // let id: string = label + (key ? key : "")
  const formStyle: CSSProperties = {
    minWidth: (minLabelWidth ? minLabelWidth : "20%"),
    textAlign: "right",
    padding: "3px"
  }
  // console.log('inside primitive form and min width is:', minInputWidth)
  const minWidth = (minInputWidth ? minInputWidth : "70%")
  const inputStyle: CSSProperties = {
    minWidth: minWidth,
    textAlign: "left"
  }
  return (
    <div style={{ padding: "2px" }}>
      <label htmlFor={id} style={formStyle}>{label + ":  "}</label>
      <input
        width={minWidth}
        style={inputStyle}
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        onChange={onChange} />
    </div>
  )
}


const SimpleForm: React.FC<SimpleFormArgs> = ({ label, id, value, type, defaultValue, placeholder, minLabelWidth }: SimpleFormArgs) => {
  // let id: string = label + (key ? key : "")

  return (
    <form style={{ margin: "2px" }}>
      < FormPrimitive label={label} id={id} type={type} defaultValue={defaultValue} placeholder={placeholder} value={value} minLabelWidth={minLabelWidth} />
    </form>
  )
}

interface MultipleInputsFormsArgs {
  inputFields: Array<SimpleFormArgs>
}


const multipleInputsForms: React.FC<MultipleInputsFormsArgs> = ({ inputFields }: MultipleInputsFormsArgs) => {

  return (
    <div>
      {inputFields.map((input) => {
        return (
          < FormPrimitive
            label={input.label}
            id={input.id}
            type={input.type}
            defaultValue={input.defaultValue}
            placeholder={input.placeholder}
            value={input.value}
            minLabelWidth={input.minLabelWidth}
            minInputWidth={input.minInputWidth}
            onChange={input.onChange} />
        )
      })}
    </div>
  )
}



export {
  SimpleForm,
  FormPrimitive,
  multipleInputsForms,
  MultipleInputsFormsArgs,
  SimpleFormArgs
}