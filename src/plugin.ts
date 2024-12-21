import { Shape } from "@penpot/plugin-types";
import { getContrast, hexToRgb, rgbToHex } from "./utils";

penpot.ui.open("Tints and Shades", `?theme=${penpot.theme}`, {
  width: 280,
  height: 250,
});

const RECTANGLE_WIDTH = 200;
const RECTANGLE_HEIGHT = 80;

let CREATE_TEXT: boolean = true;

const createTextElement = (text: string, box: Shape) => {
  const textElement = penpot.createText(text.toUpperCase());

  if (textElement) {
    // TEXT
    const textColor = getContrast(text);

    textElement.name = text;
    textElement.align = "center";
    textElement.x = box.x + box.width / 10;
    textElement.y = box.y + box.height / 2.5;
    textElement.fills = [{ fillOpacity: 1, fillColor: textColor }];

    //return textElement;

    const group = penpot.group([textElement, box]);

    if (group) {
      group.name = `Shade ${text}`;
    }
  }
};

const generateTints = (color: string, amount: number): string[] => {
  const tints: string[] = [];
  const baseColor = hexToRgb(color);

  for (let i = 1; i <= amount; i++) {
    const factor = (i / amount) * 0.8;

    const tint = rgbToHex(
      Math.min(255, baseColor.r + (255 - baseColor.r) * factor),
      Math.min(255, baseColor.g + (255 - baseColor.g) * factor),
      Math.min(255, baseColor.b + (255 - baseColor.b) * factor),
    );
    tints.push(tint);
  }
  return tints;
};

const generateShades = (color: string, amount: number): string[] => {
  const shades: string[] = [];
  const baseColor = hexToRgb(color);

  for (let i = 1; i <= amount; i++) {
    const factor = (i / amount) * 0.8;

    const shade = rgbToHex(
      Math.max(0, baseColor.r * (1 - factor)),
      Math.max(0, baseColor.g * (1 - factor)),
      Math.max(0, baseColor.b * (1 - factor)),
    );
    shades.push(shade);
    //shades.reverse();
  }
  return shades;
};

const createColorShowcase = (
  color: string,
  tints: string[],
  shades: string[],
) => {
  const startColor = penpot.createRectangle();

  let baseGroup: any = [];

  if (startColor) {
    // RECTANGLE
    startColor.resize(RECTANGLE_WIDTH, Math.floor(RECTANGLE_HEIGHT * 2));
    startColor.name = color;
    startColor.x = 0;
    startColor.y = 0;
    startColor.fills = [{ fillOpacity: 1, fillColor: color }];

    baseGroup = startColor;
  }

  const tintsArray: Shape[] = [];

  tints.forEach((tint, index) => {
    const rectangle = penpot.createRectangle();

    if (rectangle) {
      // RECTANGLE COLOR
      rectangle.resize(RECTANGLE_WIDTH, RECTANGLE_HEIGHT);
      rectangle.name = tint;
      rectangle.x = startColor.x;
      rectangle.y = -RECTANGLE_HEIGHT + -(RECTANGLE_HEIGHT * index);
      rectangle.fills = [{ fillOpacity: 1, fillColor: tint }];

      tintsArray.push(rectangle);
    }
  });

  const shadesArray: Shape[] = [];

  shades.forEach((shade, index) => {
    const rectangle = penpot.createRectangle();

    if (rectangle) {
      // RECTANGLE
      rectangle.resize(RECTANGLE_WIDTH, RECTANGLE_HEIGHT);
      rectangle.name = shade;
      rectangle.x = startColor.x;
      rectangle.y = startColor.height + RECTANGLE_HEIGHT * index;
      rectangle.fills = [{ fillOpacity: 1, fillColor: shade }];

      shadesArray.push(rectangle);
    }
  });

  // GROUP SHADES, TINTS, AND BASE COLOR
  const group = penpot.group([...tintsArray, baseGroup, ...shadesArray]);

  if (group) {
    group.name = `${color} tints and shades`;

    if (CREATE_TEXT) {
      group.children.forEach((child) => {
        createTextElement(child.name, child);
      });
    }

    penpot.selection = [group];
  }
};

penpot.ui.onMessage<any>((message) => {
  if (message.msg === "generate") {
    const selection = penpot.selection;

    if (selection) {
      selection.forEach((element) => {
        const fills = element.fills;
        if (Array.isArray(fills)) {
          fills.forEach((fill) => {
            if (fill["fillColor"]) {
              CREATE_TEXT = message.createText;
              const baseColor = fill["fillColor"];
              const tints = generateTints(baseColor, message.tintAmount);
              const shades = generateShades(baseColor, message.shadeAmount);

              createColorShowcase(baseColor, tints, shades);
            }
          });
        }
      });
    }
  }
});

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
