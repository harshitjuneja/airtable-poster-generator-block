import React, { useState } from "react";
import { SelectButtons } from "@airtable/blocks/ui";

const fontSizeOptions = [
  { value: "20pt", label: "Small" },
  { value: "30pt", label: "Medium" },
  { value: "40pt", label: "Large" },
  { value: "50pt", label: "Extra Large" },
];

const FontSizeSelector = ({ parentCallback }) => {
  //set Medium as the default font size
  const [value, setValue] = useState(fontSizeOptions[1].value);
  return (
    <SelectButtons
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        parentCallback(newValue, "fontSize");
      }}
      options={fontSizeOptions}
      width="100%"
    />
  );
};

export default FontSizeSelector;
