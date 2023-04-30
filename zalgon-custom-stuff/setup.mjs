import {registerSettings} from "./scripts/settings.mjs";
import {refreshColors, _performSheetEdits} from "./scripts/modules/sheetEdits.mjs";
import {EXHAUSTION} from "./scripts/modules/zalgon_functions.mjs";
import {DEPEND, MODULE} from "./scripts/const.mjs";

Hooks.once("init", registerSettings);
Hooks.once("init", () => {
    game.settings.register("zalgon-custom-stuff", "rules", {
        name: "Rules",
        hint: "Custom rules",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });
});
Hooks.once("ready", refreshColors);



Hooks.on("renderActorSheet", _performSheetEdits);
Hooks.on("dnd5e.restCompleted", EXHAUSTION._longRestExhaustionReduction);
