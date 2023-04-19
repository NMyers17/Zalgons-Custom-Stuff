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
    if (this.sheet.document.type === "character") this._renameRestLabels(html);
    if (this.sheet.document.type === "character") this._removeResources(html);
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

}