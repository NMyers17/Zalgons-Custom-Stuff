import {_performSheetEdits} from "./scripts/modules/sheetEdits.mjs"

Hooks.on("renderActorSheet", _performSheetEdits);