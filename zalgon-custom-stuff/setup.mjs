import {_performSheetEdits} from "./scripts/modules/sheetEdits.mjs";
import {_activeEffectConfig} from "./scripts/modules/gameChanges.mjs";
import {EXHAUSTION} from "./scripts/modules/zalgon_functions.mjs";

Hooks.on("renderActorSheet", _performSheetEdits);
Hooks.on("dnd5e.restCompleted", EXHAUSTION._longRestExhaustionReduction);
Hooks.on("renderActiveEffectConfig", _activeEffectConfig);