//Remove Resources under Attributes
Hooks.on("renderActorSheet5e", (sheet, html, sheetData) => {
    const resources = html[0].querySelector("section > form > section > div.tab.attributes.flexrow > section > ul");
    if(resources) resources.remove();
  });

//Rename Short & Long Rests
Hooks.on("renderActorSheet5e", (sheet, html, sheetData) => {
  const SR = html[0].querySelector(".sheet-header .attributes a.rest.short-rest");
  const LR = html[0].querySelector(".sheet-header .attributes a.rest.long-rest");
  if (SR) SR.innerHTML = "SR";
  if (LR) LR.innerHTML = "LR";
});

//Disable Initative Button
Hooks.on("renderActorSheet5e", (sheet, html, sheetData) => {
  const initButton = html[0].querySelector(".dnd5e.sheet.actor .sheet-header .attributes .attribute.initiative > h4");
    if (initButton) {
      initButton.classList.remove("rollable");
      initButton.removeAttribute("data-action");
    }})