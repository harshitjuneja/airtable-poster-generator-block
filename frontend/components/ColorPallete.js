import React, { useState } from "react";
import { ColorPalette, colors, colorUtils } from "@airtable/blocks/ui";

const allowedColors = [
  colors.BLUE,
  colors.BLUE_DARK_1,
  colors.BLUE_LIGHT_1,

  colors.CYAN,
  colors.CYAN_DARK_1,
  colors.CYAN_LIGHT_1,

  colors.ORANGE,
  colors.ORANGE_DARK_1,
  colors.ORANGE_LIGHT_1,

  colors.GREEN,
  colors.GREEN_DARK_1,
  colors.GREEN_LIGHT_1,

  colors.PINK,
  colors.PINK_DARK_1,
  colors.PINK_LIGHT_1,

  colors.RED,
  colors.RED_DARK_1,
  colors.RED_LIGHT_1,

  colors.YELLOW,
  colors.YELLOW_DARK_1,
  colors.YELLOW_LIGHT_1,
];

const TextColorPalette = ({ parentCallback }) => {
  const [color, setColor] = useState(allowedColors[0]);
  return (
    <ColorPalette
      color={color}
      onChange={(newColor) => {
        setColor(newColor);
        parentCallback(colorUtils.getHexForColor(newColor), "color");
      }}
      allowedColors={allowedColors}
      width="460px"
    />
  );
};

export default TextColorPalette;
