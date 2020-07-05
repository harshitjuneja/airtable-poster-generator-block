import React, { useState } from "react";
import { Select } from "@airtable/blocks/ui";

const options = [
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
];

const FontSelector = ({ parentCallback }) => {
  const [value, setValue] = useState(options[2].value);
  return (
    <Select
      options={options}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        parentCallback(newValue, "font");
      }}
      width="100%"
    />
  );
};

export default FontSelector;
