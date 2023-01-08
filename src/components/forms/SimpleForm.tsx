import React, { ChangeEventHandler, CSSProperties, useState } from "react"

interface SimpleFormArgs {
  label: string,
  key?: string,
  value: string,
  type: "text" | "number",
  defaultValue?: string | number,
  placeholder?: string,
  onChange?: ChangeEventHandler<HTMLInputElement>,
  minLabelWidth?: string
}

const FormPrimitive: React.FC<SimpleFormArgs> = ({ label, key, value, type, defaultValue, placeholder, minLabelWidth, onChange }: SimpleFormArgs) => {
  let id: string = label + (key ? key : "")
  const formStyle: CSSProperties = {
    minWidth: (minLabelWidth ? minLabelWidth : "280px"),
    textAlign: "right",
    padding: "3px"
  }
  return (
    <div>
      <label htmlFor={id} style={formStyle}>{label + ":  "}</label>
      <input
        key={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        onChange={onChange} />
    </div>
  )
}


const SimpleForm: React.FC<SimpleFormArgs> = ({ label, key, value, type, defaultValue, placeholder, minLabelWidth }: SimpleFormArgs) => {
  let id: string = label + (key ? key : "")

  return (
    <form style={{ margin: "2px" }}>
      < FormPrimitive label={label} key={key} type={type} defaultValue={defaultValue} placeholder={placeholder} value={value} minLabelWidth={minLabelWidth} />
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
            key={input.key}
            type={input.type}
            defaultValue={input.defaultValue}
            placeholder={input.placeholder}
            value={input.value}
            minLabelWidth={input.minLabelWidth}
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