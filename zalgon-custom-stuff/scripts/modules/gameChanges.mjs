import {MODULE} from "../const.mjs";
import {STATUS_EFFECTS} from "../../sources/conditions.mjs";

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
N
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

export function _conditions() {
  // these are gotten from a different file, combined, and then sorted.
  const statusEffects = STATUS_EFFECTS.sort((a, b) => {
    return a.sort - b.sort;
  });
  CONFIG.statusEffects = statusEffects;
} 

export async function _itemStatusCondition(sheet, html) {
  if (!sheet.isEditable) return;
  const list = html[0].querySelector(".items-list.effects-list");
  if (!list) return;

  const options = CONFIG.statusEffects.filter(s => {
    return !sheet.document.effects.find(e => e.statuses.has(s.id));
  }).sort((a, b) => a.name.localeCompare(b.name)).reduce(function(acc, s) {
    return acc + `<option value="${s.id}">${game.i18n.localize(s.name)}</option>`;
  }, "");

  if (!options.length) return;

  const div = document.createElement("DIV");
  div.innerHTML = await renderTemplate("modules/zalgon-custom-stuff/templates/statusConditionSelect.hbs");
  list.append(...div.children);

  const add = html[0].querySelector("[data-effect-type='statusCondition'] a[data-action='statusCondition']");
  if (add) add.addEventListener("click", async function() {
    const id = sheet.document.uuid.replaceAll(".", "-") + "-" + "add-status-condition";
    const effId = await Dialog.wait({
      title: "Add Status Condition",
      content: `
      <form class="dnd5e">
        <div class="form-group">
          <label>Status Condition:</label>
          <div class="form-fields">
            <select autofocus>${options}</select>
          </div>
        </div>
      </form>`,
      buttons: {
        ok: {
          label: "Add",
          icon: '<i class="fa-solid fa-check"></i>',
          callback: (html) => html[0].querySelector("select").value
        }
      },
      default: "ok"
    }, {id});
    if (!effId) return;
    const eff = foundry.utils.deepClone(CONFIG.statusEffects.find(e => e.id === effId));
    const data = foundry.utils.mergeObject(eff, {
      statuses: [eff.id],
      transfer: false,
      origin: sheet.document.uuid,
      "flags.effective-transferral.transferrable.self": false,
      "flags.effective-transferral.transferrable.target": true,
      name: game.i18n.localize(eff.name)
    });
    return sheet.document.createEmbeddedDocuments("ActiveEffect", [data]);
  });
}