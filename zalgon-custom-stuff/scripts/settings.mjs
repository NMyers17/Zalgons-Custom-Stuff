import {
  COLOR_DEFAULTS,
  MODULE,
  RARITY_DEFAULTS,
  WORLD_DEFAULTS
} from "./const.mjs";
import {refreshColors} from "./modules/sheetEdits.mjs";

export function registerSettings() {
  _registerSettings();
  _registerSettingsMenus();
}

function _registerSettings() {
  game.settings.register("zalgon-custom-stuff", "rules", {
    name: "Rules",
    hint: "Custom rules",
    scope: "world",
    config: false,
    type: Object,
    default: {}
});

game.settings.register("zalgon-custom-stuff", "setting-name", {
  name: "Setting Name",
  hint: "Setting Hint",
  scope: "world",
  config: true,
  type: String,
  default: "",
  onChange: value => {
    // do something when the setting changes
  }
});
}

function _registerSettingsMenus() {
  // game additions, replacements, and tweaks.
  game.settings.register(MODULE, "worldSettings", {
    scope: "world",
    config: false,
    type: Object,
    default: WORLD_DEFAULTS,
    onChange: () => SettingsConfig.reloadConfirm({world: true})
  });

  game.settings.registerMenu(MODULE, "worldSettings", {
    name: "ZALGON.SettingsMenuWorldSettingsName",
    hint: "ZALGON.SettingsMenuWorldSettingsHint",
    label: "Settings Menu",
    icon: "fa-solid fa-atlas",
    type: SettingsSubmenu,
    restricted: true
  });

  // sheet color settings.
  game.settings.register(MODULE, "colorSettings", {
    scope: "client",
    config: false,
    type: Object,
    default: COLOR_DEFAULTS,
    onChange: refreshColors
  });

  game.settings.registerMenu(MODULE, "colorSettings", {
    name: "ZALGON.SettingsMenuColorSettingsName",
    hint: "ZALGON.SettingsMenuColorSettingsHint",
    label: "Sheet Color Settings",
    icon: "fa-solid fa-paint-roller",
    type: ColorPickerSubmenu,
    restricted: false
  });

  // item rarity color settings.
  game.settings.register(MODULE, "rarityColorSettings", {
    scope: "client",
    config: false,
    type: Object,
    default: RARITY_DEFAULTS,
    onChange: refreshColors
  });

  game.settings.registerMenu(MODULE, "rarityColorSettings", {
    name: "ZALGON.SettingsMenuRarityColorsName",
    hint: "ZALGON.SettingsMenuRarityColorsHint",
    label: "Item Rarity Color Settings",
    icon: "fa-solid fa-paint-roller",
    type: RarityColorsSubmenu,
    restricted: false
  });
}

class SettingsSubmenu extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      popOut: true,
      width: 550,
      height: "auto",
      template: `modules/${MODULE}/templates/settingsMenu.hbs`,
      id: "zalgon-settings-submenu-additions-and-replacements",
      title: "Additions and Replacements",
      resizable: false,
      classes: [MODULE, "settings-menu"]
    });
  }

  async _updateObject(event, formData) {
    return game.settings.set(MODULE, "worldSettings", formData, {diff: false});
  }

  async getData() {
    const data = foundry.utils.mergeObject(
      WORLD_DEFAULTS,
      game.settings.get(MODULE, "worldSettings"),
      {insertKeys: false}
    );
    const settings = Object.entries(data).map(s => {
      return {
        id: s[0],
        checked: s[1],
        name: `ZALGON.SettingsWorld${s[0].capitalize()}Name`,
        hint: `ZALGON.SettingsWorld${s[0].capitalize()}Hint`
      }
    });
    return {settings};
  }
}

class ColorPickerSubmenu extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [MODULE, "settings-menu"],
      popOut: true,
      width: 550,
      height: "auto",
      template: `modules/${MODULE}/templates/settingsColorpickers.hbs`,
      id: "zalgon-settings-submenu-colorpickers",
      title: "Character Sheet Color Adjustments",
      resizable: false
    });
  }

  async _updateObject(event, formData) {
    return game.settings.set(MODULE, "colorSettings", formData, {diff: false});
  }

  async getData() {
    const data = foundry.utils.mergeObject(
      foundry.utils.deepClone(COLOR_DEFAULTS),
      game.settings.get(MODULE, "colorSettings"),
      {insertKeys: false}
    );
    const checks = Object.entries({
      showLimitedUses: data.showLimitedUses,
      showSpellSlots: data.showSpellSlots
    }).map(s => {
      return {
        id: s[0],
        checked: s[1],
        name: `ZALGON.SettingsColor${s[0].capitalize()}Name`,
        hint: `ZALGON.SettingsColor${s[0].capitalize()}Hint`
      };
    });
    delete data.showLimitedUses;
    delete data.showSpellSlots;

    const colors = Object.entries(data).map(s => {
      return {
        id: s[0],
        value: s[1],
        name: `ZALGON.SettingsColor${s[0].capitalize()}Name`,
        hint: `ZALGON.SettingsColor${s[0].capitalize()}Hint`
      }
    });
    return {checks, colors};
  }
}

class RarityColorsSubmenu extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [MODULE, "settings-menu"],
      popOut: true,
      width: 550,
      height: "auto",
      template: `modules/${MODULE}/templates/settingsRaritycolors.hbs`,
      id: "zalgon-settings-submenu-raritycolors",
      title: "Item Rarity Color Adjustments",
      resizable: false
    });
  }

  async _updateObject(event, formData) {
    const set = await game.settings.set(MODULE, "rarityColorSettings", formData, {diff: false});
    refreshColors();
    return set;
  }

  async getData() {
    return {
      settings: Object.entries(foundry.utils.mergeObject(
        RARITY_DEFAULTS,
        game.settings.get(MODULE, "rarityColorSettings"),
        {insertKeys: false}
      )).map(d => {
        const label = CONFIG.DND5E.itemRarity[d[0]].titleCase();
        const name = d[0];
        const color = d[1];
        return {label, name, color};
      })
    };
  }
}
