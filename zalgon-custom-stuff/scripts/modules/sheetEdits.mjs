import {MODULE} from "../const.mjs";
import {EXHAUSTION} from "./zalgon_functions.mjs";

export function _performSheetEdits(sheet, html) {
  if (!sheet.sheetEdits) {
    const edits = new SheetEdits();
    sheet.sheetEdits = edits;
    edits.sheet = sheet;
    edits.html = html;
  } else {
    sheet.sheetEdits.html = html;
  }
  const e = sheet.sheetEdits;
  e.render(html);
}

export class SheetEdits {
  async render(html) {
    if (this.sheet.document.type !== "group") this._setHealthColor();
    if (this.sheet.document.type === "character") this._renameRestLabels(html);
    if (this.sheet.document.type === "character") this._removeResources(html);
    if (this.sheet.document.type === "character") this._createNewDay();
    if (this.sheet.document.type === "character") this._createInspirationToggle();
    if (this.sheet.document.type === "character") this._createExhaustion();
    if (["character", "npc"].includes(this.sheet.document.type)) this._createDots();
    if (this.sheet.document.type === "character") this._setMagicItemsColor();
  }

  /** Set the color of the health attributes by adding a css class. */
  _setHealthColor() {
    const hp = this.sheet.document.system.attributes.hp;
    const a = (hp.value ?? 0) + (hp.temp ?? 0);
    const b = (hp.max ?? 0) + (hp.tempmax ?? 0);
    if (!b) return;
    const nearDeath = a / b < 0.33;
    const bloodied = a / b < 0.66 && !nearDeath;

    const node = this.html[0].querySelector(
      "[name='system.attributes.hp.value']"
    );
    node.classList.toggle("near-death", nearDeath);
    node.classList.toggle("bloodied", bloodied);
  }
  
  /** Rename Rest Labels */
  _renameRestLabels(html) {
    const SR = html[0].querySelector(".sheet-header .attributes a.rest.short-rest");
    const LR = html[0].querySelector(".sheet-header .attributes a.rest.long-rest");
    if (SR) SR.innerHTML = "SR";
    if (LR) LR.innerHTML = "LR";
  }
  
  /** Remove Resources Under Attributes */
  _removeResources(html) {
    const resources = html[0].querySelector("section > form > section > div.tab.attributes.flexrow > section > ul");
    if (resources) resources.remove();
  }

   /** Create 'New Day' button after Short and Long rest buttons.*/
   _createNewDay() {
    const lr = this.html[0].querySelector(".rest.long-rest");
    const div = document.createElement("DIV");
    div.innerHTML = "<a class='rest new-day' data-tooltip='DND5E.NewDay'>Day</a>";
    div.querySelector(".new-day").addEventListener("click", this._onClickNewDay.bind(this.sheet));
    lr.after(div.firstChild);
  }

    /**
   * Roll limited uses recharge of all items that recharge on a new day.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Item5e[]}              The array of updated items.
   */
    async _onClickNewDay(event) {
      const conf = await Dialog.confirm({
        title: "New Day",
        content: "Would you like to recharge all items that regain charges on a new day?",
        options: {id: `${this.document.uuid.replaceAll(".", "-")}-new-day-confirm`}
      });
      if (!conf) return;
      const updates = await this.document._getRestItemUsesRecovery({
        recoverShortRestUses: false,
        recoverLongRestUses: false,
        recoverDailyUses: true,
        rolls: []
      });
      return this.document.updateEmbeddedDocuments("Item", updates);
    }

    /** Make 'Inspiration' a toggle. */
  _createInspirationToggle() {
    const insp = this.html[0].querySelector(".inspiration h4");
    insp.classList.add("rollable");
    insp.dataset.action = "inspiration";
    insp.addEventListener("click", this._onClickInspiration.bind(this.sheet));
  }

  /**
   * Toggle inspiration on or off when clicking the 'label'.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Actor}                 The updated actor.
   */
  async _onClickInspiration(event) {
    return this.document.update({"system.attributes.inspiration": !this.document.system.attributes.inspiration});
  }

 /** Disable the exhaustion input and add a listener to the label. */
 _createExhaustion() {
  this.html[0].querySelector(".counter.flexrow.exhaustion .counter-value input").disabled = true;
  const header = this.html[0].querySelector(".counter.flexrow.exhaustion h4");
  header.classList.add("rollable");
  header.setAttribute("data-action", "updateExhaustion");
  header.addEventListener("click", this._onClickExhaustion.bind(this.sheet));
}

/**
 * Handle clicking the exhaustion label.
 * @param {PointerEvent} event      The initiating click event.
 */
_onClickExhaustion(event) {
  const actor = this.document;
  const level = actor.system.attributes.exhaustion;
  const effect = {
    0: "You are not currently exhausted.",
    1: "You currently have 1 level of exhaustion.",
  }[level] ?? `You currently have ${level} levels of exhaustion.`;
  const buttons = {
    up: {
      icon: "<i class='fa-solid fa-arrow-up'></i>",
      label: "Gain a Level",
      callback: () => EXHAUSTION.increaseExhaustion(actor)
    },
    down: {
      icon: "<i class='fa-solid fa-arrow-down'></i>",
      label: "Down a Level",
      callback: () => EXHAUSTION.decreaseExhaustion(actor)
    }
  };
  if (level < 1) delete buttons.down;
  if (level > 10) delete buttons.up;

  return new Dialog({
    title: `Exhaustion: ${actor.name}`,
    content: `<p>Adjust your level of exhaustion.</p><p>${effect}</p>`,
    buttons
  }, {
    id: `${MODULE}-exhaustion-dialog-${actor.id}`,
    classes: [MODULE, "exhaustion", "dialog"]
  }).render(true);
}

 /** Set the color of magic items by adding css classes to them. */
 _setMagicItemsColor() {
  this.html[0].querySelectorAll(".items-list .item").forEach(item => {
    const id = item.dataset.itemId;
    const rarity = this.sheet.document.items.get(id)?.system.rarity;
    if (rarity) item.classList.add(rarity.slugify().toLowerCase());
  });
}

 /** Handle creating dots for spell slots and items with limited uses. */
 _createDots() {
  const sheet = this.sheet;
  const actor = sheet.document;

  if (this.settings.showSpellSlots) {
    Object.entries(actor.system.spells).forEach(([key, {value, max}]) => {
      const _max = this.html[0].querySelector(`.spell-max[data-level=${key}]`);
      const dotContainer = document.createElement("DIV");
      dotContainer.classList.add(MODULE, "dot-container");
      if (!max || !_max) return;
      const beforeThis = _max.closest(".spell-slots");
      beforeThis.before(dotContainer);
      const q = 10;
      for (let i = 0; i < Math.min(q, max); i++) {
        const span = document.createElement("SPAN");
        dotContainer.appendChild(span);
        const le = i < (q - 1) || max <= q;
        const cls = le ? (i < value ? ["dot"] : ["dot", "empty"]) : (value < max ? ["dot", "empty", "has-more"] : ["dot", "has-more"]);
        span.classList.add(...cls);
        span.setAttribute("data-action", "toggleDot");
        span.setAttribute("data-idx", i);
        span.setAttribute("data-spell-level", key);
      }
    });
  }

  if (this.settings.showLimitedUses) {
    actor.items.filter(i => !!i.hasLimitedUses).forEach(item => {
      const uses = item.system.uses;
      if (!uses.max) return;
      const itemHTML = this.html[0].querySelector(`.item[data-item-id="${item.id}"]`);
      // skip if item is hidden via filter.
      if (!itemHTML) return;
      const position = (item.type === "spell") ? "beforeBegin" : "afterEnd";
      const adjacent = (item.type === "spell") ? itemHTML.querySelector(".item-detail.spell-uses") : itemHTML.querySelector(".item-name");

      if (item.type !== "spell") {
        const dotContainer = document.createElement("DIV");
        dotContainer.classList.add(MODULE, "dot-container");
        const q = 10;
        const max = Math.min(q, uses.max);
        dotContainer.innerHTML = Array.fromRange(max).reduce((acc, e, i) => {
          const le = e < (q - 1) || uses.max <= q;
          const cls = le ? (e < uses.value ? "dot" : "dot empty") : (uses.value < uses.max ? "dot empty has-more" : "dot has-more");
          return acc + `<span class="${cls}" data-action="toggleDot" data-item-id="${item.id}" data-idx="${i}"></span>`;
        }, "");
        adjacent.insertAdjacentElement(position, dotContainer);
      } else {
        const dotContainer = document.createElement("DIV");
        dotContainer.classList.add(MODULE, "dot-container");
        const q = 5;
        dotContainer.innerHTML = Array.fromRange(Math.min(q, uses.max)).reduce((acc, e, i) => {
          const le = e < (q - 1) || uses.max <= q;
          const cls = le ? (e < uses.value ? "dot" : "dot empty") : (uses.value < uses.max ? "dot empty has-more" : "dot has-more");
          return acc + `<span class="${cls}" data-action="toggleDot" data-item-id="${item.id}" data-idx="${i}"></span>`;
        }, "");
        adjacent.insertAdjacentElement(position, dotContainer);
      }
    });
    // items with spells
    actor.items.filter(i => {
      const f = i.flags["items-with-spells-5e"]?.["item-spells"]?.length;
      const u = i.hasLimitedUses;
      return f && u;
    }).forEach(item => {
      const header = [...this.html[0].querySelectorAll(".items-header.spellbook-header > .item-name > h3")].find(h => {
        return (h.innerText.trim() === item.name) && !h.dataset.itemId;
      });
      if (!header) return;
      header.setAttribute("data-item-id", item.id);
      const div = document.createElement("DIV");
      div.classList.add(MODULE, "dot-container");
      const q = 10;
      const uses = item.system.uses;
      div.innerHTML = Array.fromRange(Math.min(q, uses.max)).reduce((acc, e, i) => {
        const le = e < (q - 1) || uses.max <= q;
        const cls = le ? (e < uses.value ? "dot" : "dot empty") : (uses.value < uses.max ? "dot empty has-more" : "dot has-more");
        return acc + `<span class="${cls}" data-action="toggleDot" data-item-id="${item.id}" data-idx="${i}"></span>`;
      }, "");
      header.after(div);
    });
  }

  this.html[0].querySelectorAll("[data-action='toggleDot']").forEach(n => n.addEventListener("click", this._onClickDot.bind(this.sheet)));
  this.html[0].querySelectorAll(".dot.has-more").forEach(n => n.addEventListener("wheel", this._onWheelDot.bind(this.sheet)));
}

/**
 * Handle clicking a dot.
 * @param {PointerEvent} event      The initiating click event.
 * @returns {Actor5e|Item5e}        The updated actor or item.
 */
async _onClickDot(event) {
  const {dataset: data, classList: list} = event.currentTarget;
  const target = this.document.items.get(data.itemId) ?? this.document;
  const path = data.spellLevel ? `system.spells.${data.spellLevel}.value` : "system.uses.value";
  const current = foundry.utils.getProperty(target, path);

  let value;
  if (list.contains("has-more")) value = current + (list.contains("empty") ? 1 : -1);
  else value = Number(data.idx) + (list.contains("empty") ? 1 : 0);

  return target.update({[path]: value});
}

/**
 * Handle using the mouse wheel when hovering over the "has more" dot.
 * @param {WheelEvent} event      The initiating mouse wheel event.
 * @returns {Actor|Item}          The updated actor or item.
 */
async _onWheelDot(event) {
  const data = event.currentTarget.dataset;
  const target = this.document.items.get(data.itemId) ?? this.document;
  const path = data.spellLevel ? `system.spells.${data.spellLevel}` : "system.uses";
  const current = foundry.utils.getProperty(target, path);
  const value = Math.clamped(current.value + Math.round(event.deltaY / (-100)), 0, current.max);
  return target.update({[`${path}.value`]: value});
}
}

/**
 * Refreshes the style sheet when a user changes their color settings for various sheet colors
 * such as limited uses, prepared spells, and the color of rarities on magic items.
 */
export function refreshColors() {
  const colors = game.settings.get(MODULE, "colorSettings");
  const rarities = game.settings.get(MODULE, "rarityColorSettings");

  const root = document.querySelector(":root")
  const cssSheet = Object.values(root.parentNode.styleSheets).find(s => {
    return s.href.includes("zalgon-custom-stuff/styles/sheetEdits.css");
  });

  const styleMap = game.settings.get('zalgon-custom-stuff', 'styleMap');
  if (styleMap) {
    for (let [selector, style] of Object.entries(styleMap)) {
      if (newStyles[style]) {
        newStyles[selector] = newStyles[style];
      }
    }

  for (const key of Object.keys(colors)) {
    if (typeof colors[key] === "string") map.set(`--${key}`, colors[key]);
  }

  for (const key of Object.keys(rarities)) {
    if (typeof rarities[key] === "string") map.set(`--rarity${key.capitalize()}`, rarities[key]);
  }
}
}