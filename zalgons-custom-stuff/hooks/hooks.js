Hooks.on("renderActorSheet5e", (sheet, html, sheetData) => {
    const resources = html[0].querySelector("section > form > section > div.tab.attributes.flexrow > section > ul");
    if(resources) resources.remove();
  });