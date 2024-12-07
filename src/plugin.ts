import { Group, Shape } from "@penpot/plugin-types";
import { getContrast, hexToRgb, rgbToHex } from "./utils";

penpot.ui.open("Tints and Shades", `?theme=${penpot.theme}`, {
  width: 280,
  height: 160
});

const RECTANGLE_WIDTH = 200;
const RECTANGLE_HEIGHT = 80;

const createTextElement = (text: string, box: Shape) => {
  const textElement = penpot.createText(text);

  if (textElement) {
    // TEXT
    const textColor = getContrast(text);

    textElement.name = text;
    textElement.align = 'center';
    textElement.x = box.x + (box.width / 10);
    textElement.y = box.y + (box.height / 2.5);
    textElement.fills = [{ fillOpacity: 1, fillColor: textColor }];

    return textElement;
  }
}

const generateTints = (color: string, amount: number): string[] => {
  const tints: string[] = [];
  const baseColor = hexToRgb(color);

  for (let i = 1; i <= amount; i++) {
    const tint = rgbToHex(
      Math.min(255, baseColor.r + (255 - baseColor.r) * (i / 10)),
      Math.min(255, baseColor.g + (255 - baseColor.g) * (i / 10)),
      Math.min(255, baseColor.b + (255 - baseColor.b) * (i / 10))
    );
    tints.push(tint);
  }
  return tints;
}

const generateShades = (color: string, amount: number): string[] => {
  const shades: string[] = [];
  const baseColor = hexToRgb(color);

  for (let i = 1; i <= amount; i++) {
    const shade = rgbToHex(
      Math.max(0, baseColor.r * (1 - i / 10)),
      Math.max(0, baseColor.g * (1 - i / 10)),
      Math.max(0, baseColor.b * (1 - i / 10))
    );
    shades.push(shade);
  }
  return shades;
}

const createColorRectangles = (color: string, tints: string[], shades: string[]) => {
  const startColor = penpot.createRectangle();

  let baseGroup: any = [];

  if (startColor) {
    // RECTANGLE
    startColor.resize(RECTANGLE_WIDTH, Math.floor(RECTANGLE_HEIGHT * 2));
    startColor.name = color;
    startColor.x = 0;
    startColor.y = 0;
    startColor.fills = [{ fillOpacity: 1, fillColor: color }]

    // TEXT
    const colorText = createTextElement(color, startColor);

    if (colorText) {
      const group = penpot.group([startColor, colorText]);

      if (group) {
        group.name = 'Base color'
        baseGroup = group;
      }
    }
  }

  const tintsArray: Group[] = [];

  tints.forEach((tint, index) => {
    const rectangle = penpot.createRectangle();

    if (rectangle) {
      // RECTANGLE COLOR
      rectangle.resize(RECTANGLE_WIDTH, RECTANGLE_HEIGHT);
      rectangle.name = tint;
      rectangle.x = startColor.x;
      rectangle.y = -RECTANGLE_HEIGHT + -(RECTANGLE_HEIGHT * index);

      rectangle.fills = [{ fillOpacity: 1, fillColor: tint }];

      // TEXT
      const text = createTextElement(tint, rectangle);

      if (text) {
        const group = penpot.group([rectangle, text]);

        if (group) {
          group.name = `Tint ${tint}`
          tintsArray.push(group);
        }
      }
    }
  })

  const shadesArray: Group[] = [];

  shades.forEach((shade, index) => {
    const rectangle = penpot.createRectangle();

    if (rectangle) {
      // RECTANGLE
      rectangle.resize(RECTANGLE_WIDTH, RECTANGLE_HEIGHT);
      rectangle.name = shade;
      rectangle.x = startColor.x;
      rectangle.y = startColor.height + (RECTANGLE_HEIGHT * index);
      rectangle.fills = [{ fillOpacity: 1, fillColor: shade }];

      // TEXT
      const text = createTextElement(shade, rectangle);

      if (text) {
        const group = penpot.group([rectangle, text]);

        if (group) {
          group.name = `Shade ${shade}`
          shadesArray.push(group);
        }
      }
    }
  })

  // GROUP SHADES, TINTS, AND BASE COLOR
  const group = penpot.group([...tintsArray, baseGroup, ...shadesArray]);

  if (group) {
    group.name = `${color} tints and shades`
    penpot.selection = [group];
  }
}

penpot.ui.onMessage<any>((message) => {
  if (message.msg === "generate") {
    const selection = penpot.selection;

    if (selection) {
      selection.forEach(element => {
        const fills = element.fills;
        if (Array.isArray(fills)) {
          fills.forEach(fill => {
            if (fill['fillColor']) {
              const baseColor = fill['fillColor'];
              const tints = generateTints(baseColor, message.tintAmount);
              const shades = generateShades(baseColor, message.shadeAmount);

              createColorRectangles(baseColor, tints, shades)
            }
          })
        }
      })
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
