import {MODULE} from "../const.mjs";

export function _activeEffectConfig(config, html) {
const inputs = html[0].querySelectorAll(".key > [name^='changes.']");
if (!inputs.length) return;

let options = [""];
for (const type of ["character", "npc"]) {
  const object = new Actor.implementation({type, name: "Steve"}).toObject().system;
  const flattened = foundry.utils.flattenObject(object);
  const keys = Object.keys(flattened);
  for (const key of keys) options.push("system." + key);
}
options.sort((a, b) => a.localeCompare(b));
options = new Set(options);

options = options.reduce((acc, o) => {
  return acc + `<option value="${o}">${o}</option>`;
}, "");

for (const input of inputs) {
  const div = document.createElement("DIV");
  div.innerHTML = `<select data-name="${input.name}">${options}</select>`;
  div.querySelector(`[value="${input.value}"]`)?.toggleAttribute("selected");
  const select = div.querySelector("select");
  input.addEventListener("change", () => select.value = input.value);
  select.addEventListener("change", () => input.value = select.value);
  input.after(div.firstElementChild);
}
config.setPosition();
}