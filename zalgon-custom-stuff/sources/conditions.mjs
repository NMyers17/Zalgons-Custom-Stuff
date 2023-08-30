/**
 * <-- Conditions -->
 * 100: Dead,
 * 200: Charmed,
 * 250: Frightened,
 * 280: Poisoned,
 * 300: Blinded,
 * 330: Deafened,
 * 360: Muted,
 * 400: Prone,
 * 430: Grappled,
 * 450: Restrained,
 * 500: Incapacitated,
 * 540: Stunned,
 * 560: Unconscious,
 * 600: Paralyzed,
 * 650: Petrified,
 * 700: Invisible,
 * 1600: Reaction,
 */

export const STATUS_EFFECTS = [
    {
        id: "blind", name: "ZALGON.StatusConditionBlind", sort: 300,
        icon: "icons/svg/blind.svg",
        description: "<p>You cannot see, and you automatically fail any ability checks that require sight.</p>"
          + "<p>Attack rolls against you have advantage, and your attack rolls have disadvantage.</p>"
      },
      {
        id: "invisible", name: "ZALGON.StatusConditionInvisible", sort: 1500,
        icon: "icons/svg/invisible.svg",
        duration: {seconds: 3600},
        description: "<p>You are invisible.</p>"
          + "<p>You are impossible to see, and are considered heavily obscured.</p>"
          + "<p>Attack rolls against you have disadvantage, and your attack rolls have advantage.</p>"
      },
      {
        id: "reaction", name: "ZALGON.StatusConditionReaction", sort: 1600,
        icon: "icons/svg/wing.svg",
        duration: {rounds: 1},
        description: "<p>You have spent your reaction. You cannot take another reaction until the start of your next turn.</p>",
        flags: {
          effectmacro: {
            onCombatEnd: {script: "return effect.delete();"},
            onCombatStart: {script: "return effect.delete();"},
            onTurnStart: {script: "return effect.delete();"}
          }
        }
      },
      {
        id: "charm", name: "ZALGON.StatusConditionCharm", sort: 200,
        icon: "icons/svg/daze.svg",
        description: "<p>You cannot attack the charmer or target them with harmful abilities or magical effects.</p>"
          + "<p>The charmer has advantage on any ability check to interact socially with you.</p>"
      },
      {
        id: "dead", name: "ZALGON.StatusConditionDead", sort: 100,
        icon: "icons/svg/skull.svg",
        description: "<p>You have met an unfortunate end.</p>"
      },
      {
        id: "deaf", name: "ZALGON.StatusConditionDeaf", sort: 330,
        icon: "icons/svg/deaf.svg",
        description: "<p>You cannot hear and automatically fail any ability checks that require hearing.</p>"
      },
      {
        id: "mute", name: "ZALGON.StatusConditionMute", sort: 360,
        icon: "icons/svg/silenced.svg",
        description: "<p>You cannot speak and cannot cast spells with a verbal component.</p>"
          + "<p>You automatically fail any ability checks that require speech.</p>"
      },
      {
        id: "fear", name: "ZALGON.StatusConditionFear", sort: 250,
        icon: "icons/svg/terror.svg",
        description: "<p>You have disadvantage on all attack rolls and ability checks while the source of your fear is within your line of sight.</p>"
          + "<p>You cannot willingly move closer to the source of your fear.</p>"
      },
      {
        id: "grappled", name: "ZALGON.StatusConditionGrappled", sort: 430,
        icon: "icons/svg/trap.svg",
        description: "<p>Your speed is zero.</p>",
        changes: [
          {key: "system.attributes.movement.walk", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.fly", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.swim", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.climb", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.burrow", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60}
        ]
      },
      {
        id: "incapacitated", name: "ZALGON.StatusConditionIncapacitated", sort: 500,
        icon: "icons/svg/sleep.svg",
        description: "<p>You cannot take actions or reactions.</p>"
      },
      {
        id: "paralysis", name: "ZALGON.StatusConditionParalysis", sort: 600,
        icon: "icons/svg/stoned.svg",
        description: "<p>You are incapacitated, and you cannot move or speak.</p>"
          + "<p>You automatically fail Strength and Dexterity saving throws.</p>"
          + "<p>Attack rolls against you have advantage, and any attacks against you is a critical hit if the attacker is within 5 feet of you.</p>",
        changes: [
          {key: "system.attributes.movement.walk", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.fly", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.swim", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.climb", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.burrow", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60}
        ]
      },
      {
        id: "petrified", name: "ZALGON.StatusConditionPetrified", sort: 650,
        icon: "icons/svg/statue.svg",
        description: "<p>You are inanimate, incapacitated, and unaware of your surroundings.</p>"
          + "<p>Your weight is increased by a factor of ten, you cannot move or speak, and attack rolls against you have advantage.</p>"
          + "<p>You automatically fail all Strength and Dexterity saving throws.</p>"
          + "<p>You have resistance to all damage, and you are immune to poison and disease.</p>"
      },
      {
        id: "poison", name: "ZALGON.StatusConditionPoison", sort: 280,
        icon: "icons/svg/radiation.svg",
        description: "<p>You have disadvantage on all attack rolls and ability checks.</p>"
      },
      {
        id: "prone", name: "ZALGON.StatusConditionProne", sort: 400,
        icon: "icons/svg/falling.svg",
        description: "<p>You can only crawl unless you expend half your movement to stand up.</p>"
          + "<p>You have disadvantage on attack rolls, and any attack roll has advantage against you if the attacker is within 5 feet of you; it otherwise has disadvantage.</p>"
      },
      {
        id: "restrain", name: "ZALGON.StatusConditionRestrain", sort: 450,
        icon: "icons/svg/net.svg",
        description: "<p>Your speed is zero, attack rolls against you have advantage, and your attack rolls have disadvantage.</p>"
          + "<p>You have disadvantage on Dexterity saving throws.</p>",
        changes: [
          {key: "system.attributes.movement.walk", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.fly", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.swim", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.climb", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.burrow", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60}
        ]
      },
      {
        id: "stun", name: "ZALGON.StatusConditionStun", sort: 540,
        icon: "icons/svg/paralysis.svg",
        description: "<p>You are incapacitated, cannot move, and can speak only falteringly.</p>"
          + "<p>You automatically fail Strength and Dexterity saving throws, and attack rolls against you have advantage.</p>",
        changes: [
          {key: "system.attributes.movement.walk", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.fly", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.swim", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.climb", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.burrow", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60}
        ]
      },
      {
        id: "unconscious", name: "ZALGON.StatusConditionUnconscious", sort: 560,
        icon: "icons/svg/unconscious.svg",
        description: "<p>You are incapacitated, cannot move or speak, you fall prone, and you automatically fail all Strength and Dexterity saving throws.</p>"
          + "<p>Attack rolls against you have advantage, and any attack that hits you is a critical hit if the attacker is within 5 feet of you.</p>",
        changes: [
          {key: "system.attributes.movement.walk", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.fly", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.swim", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.climb", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60},
          {key: "system.attributes.movement.burrow", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 0, priority: 60}
        ]
      }
    ];