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
    if (this.sheet.document.type === "character") this._createHeroPoints();
  }

 /** Create a button for Hero Points. */
 async _createHeroPoints() {
  const div = document.createElement("div");
  const templateData = {
      name: `flags.${MODULE}.hero-points.value`,
      value: this.sheet.document.flags[MODULE]?.["hero-points"].value ?? 0
  };
  const templateContent = await renderTemplate(`modules/${MODULE}/templates/heropointsButton.hbs`, templateData);
  
  div.innerHTML = templateContent;
  
  const input = div.querySelector(`[name="flags.${MODULE}.hero-points.value"]`);
  this.html[0].querySelector("div.counter.flexrow.exhaustion").after(div.firstChild);
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
}