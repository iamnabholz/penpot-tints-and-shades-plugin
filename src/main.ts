import "./style.css";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

document
  .querySelector("[data-handler='generate']")
  ?.addEventListener("click", () => {
    const tints = document.getElementById("tints") as HTMLInputElement;
    const shades = document.getElementById("shades") as HTMLInputElement;
    const text = document.getElementById(
      "create-text-checkbox",
    ) as HTMLInputElement;

    parent.postMessage(
      {
        msg: "generate",
        tintAmount: tints.value,
        shadeAmount: shades.value,
        createText: text.checked,
      },
      "*",
    );
  });

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  if (event.data.source === "penpot") {
    document.body.dataset.theme = event.data.theme;
  }
});
