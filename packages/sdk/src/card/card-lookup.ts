import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { GenericSerializedBlueprint, SerializedBlueprint } from './card-blueprint';
import { f1General } from './cards/faction_1/general';
import { f2General } from './cards/faction_2/general';
import { neutralHealingMystic } from './cards/neutral/healing_mystic';
import { neutralRiftWalker } from './cards/neutral/rift_walker';
import { f1TrueStrike } from './cards/faction_1/true_strike';
import { f1SunstoneBracers } from './cards/faction_1/sunstone_bracers';
import { f1WindbladeAdept } from './cards/faction_1/windblade_adept';
import { neutralPrimusShieldMaster } from './cards/neutral/primus-shieldmaster';
import { f1SilverguardKnight } from './cards/faction_1/silverguard_knight';
import { f1AzuriteLion } from './cards/faction_1/azurite_lion';
import { f1Martyrdom } from './cards/faction_1/martyrdom';
import { f1LionheartBlessing } from './cards/faction_1/lionheart_blessing';
import { f1IroncliffeGuardian } from './cards/faction_1/ironcliffe_guardian';
import { f1SilverguardSquire } from './cards/faction_1/silverguard_squire';
import { f1ArclyteSentinel } from './cards/faction_1/arclyte_sentinel';
import { f1Lightchaser } from './cards/faction_1/lightchaser';
import { f1Sunriser } from './cards/faction_1/sunriser';
import { f1SuntideMaiden } from './cards/faction_1/suntide_mainden';
import { f1LysianBrawler } from './cards/faction_1/lysian_brawler';
import { f1SecondSun } from './cards/faction_1/second_sun';
import { f1Tempest } from './cards/faction_1/tempest';
import { f1HolyImmolation } from './cards/faction_1/holy_immolation';
import { f1DivineBond } from './cards/faction_1/divine_bond';
import { f1SundropElixir } from './cards/faction_1/sundrop_elixir';
import { f1LastingJudgement } from './cards/faction_1/lasting_judgment';
import { f1ArclyteRegalia } from './cards/faction_1/arclyte_regalia';
import { f1CircleOfLife } from './cards/faction_1/circle_of_life';
import { f1WarSurge } from './cards/faction_1/war_surge';
import { f1SunBloom } from './cards/faction_1/sun_bloom';
import { f1ElyxStormblade } from './cards/faction_1/elyx_stormBlade';
import { f2InnerFocus } from './cards/faction_2/inner_focus';
import { f2KaidoAssassin } from './cards/faction_2/kaido_assassin';
import { f2TuskBoar } from './cards/faction_2/tusk_boar';
import { f2ManaVortex } from './cards/faction_2/mana_vortex';
import { f2ChakriAvatar } from './cards/faction_2/chakri_avatar';
import { f2CelestialPhantom } from './cards/faction_2/celestial_phantom';
import { f2Rythmweaver } from './cards/faction_2/rythmweaver';
import { f2KeshraiFanblade } from './cards/faction_2/keshrai_fanblade';
import { f2HammonBladeseeker } from './cards/faction_2/hammon_bladeseeker';
import { f2Gorehorn } from './cards/faction_2/gorehorn';
import { f2Heartseeker } from './cards/faction_2/heartseeker';
import { f2FourWindsMagus } from './cards/faction_2/four_winds_magus';
import { f2PhoenixFire } from './cards/faction_2/phoenix_fire';
import { f2SpiralTechnique } from './cards/faction_2/spiral_technique';
import { f2LanternFox } from './cards/faction_2/lantern_fox';
import { f2GhostLightning } from './cards/faction_2/ghost_lightning';
import { f2Gotatsu } from './cards/faction_2/gotatsu';
import { f2HeavensEclipse } from './cards/faction_2/heavens_eclipse';
import { f2KillingEdge } from './cards/faction_2/killing_edge';
import { f2SaberspineSeal } from './cards/faction_2/saberspine_seal';
import { f2MistDragonSeal } from './cards/faction_2/mist_dragon_seal';
import { f2Juxtaposition } from './cards/faction_2/juxtaposition';
import { f1Magnetize } from './cards/faction_1/magnetize';
import { f2KageLightning } from './cards/faction_2/kage_lightning';
import { f2StormKage } from './cards/faction_2/storm_kage';
import { neutralArakiHeadhunter } from './cards/neutral/araki_headhunter';
import { neutralAethermaster } from './cards/neutral/aethermaster';
import { f2Widowmaker } from './cards/faction_2/widowmaker';
import { neutralRepulsorBeast } from './cards/neutral/repulsor_beast';
import { f2JadeMonk } from './cards/faction_2/jade_monk';
import { f2ScarletViper } from './cards/faction_2/scarlet_viper';
import { neutralDreamgazer } from './cards/neutral/dreamgazer';
import { neutralEphemeralShroud } from './cards/neutral/ephemeral_shroud';
import { neutralDancingBlades } from './cards/neutral/dancing-blades';
import { neutralValeHunter } from './cards/neutral/vale-hunter';
import { neutralPutridMindflayer } from './cards/neutral/putrid_mindflayer';
import { neutralSaberspineTiger } from './cards/neutral/saberspine-tiger';
import { neutralProphetOfTheWhitePalm } from './cards/neutral/prophet_of_the_white_palm';
import { neutralBloodtearAlchemist } from './cards/neutral/bloodtear-alchemist';
import { neutralPrimusFist } from './cards/neutral/primus-first';
import { neutralVenomToth } from './cards/neutral/venom-toth';
import { neutralBonereaper } from './cards/neutral/bone-reaper';
import { neutralWingsOfParadise } from './cards/neutral/wings_of_paradise';
import { neutralPiercingMantis } from './cards/neutral/piercing-mantis';
import { neutralArchonSpellbinder } from './cards/neutral/archon-spellbinder';
import { neutralLightbender } from './cards/neutral/lightbender';
import { neutralFlamebloodWarlock } from './cards/neutral/flameblood_warlock';
import { neutralAzureHornShaman } from './cards/neutral/azure-horn-shaman';
import { neutralFrostboneNaga } from './cards/neutral/frostbone-naga';
import { f3General2 } from './cards/faction_3/general2';
import { f3WindDervish } from './cards/faction_3/wind-dervish';
import { f3EtherealObelysk } from './cards/faction_3/ethereal-obelysk';
import { f3PortalGuardian } from './cards/faction_3/portal-guardiant';
import { f3AymaraHealer } from './cards/faction_3/aymara_healer';
import { f3Chronomancer } from './cards/faction_3/chronomancer';
import { f3Dunecaster } from './cards/faction_3/dunecaster';
import { f3SandHowler } from './cards/faction_3/sand-howler';
import { f3StaffOfYkir } from './cards/faction_3/staff-of-ykir';
import { f3WindShrike } from './cards/faction_3/wind-shrike';
import { f3Blindscorch } from './cards/faction_3/blindscorch';
import { f3StarsFury } from './cards/faction_3/stars_fury';
import { f3ZenuiTheBlghtspawned } from './cards/faction_3/zenrui-the-blightspawned';
import { f3ScionsFirstWish } from './cards/faction_3/scions-first-wish';
import { f3ScionssSecondWish } from './cards/faction_3/scions-second-wish';
import { f3ScionsThirdWish } from './cards/faction_3/scions-third-wish';
import { f3BoneSwarm } from './cards/faction_3/boneswarm';
import { neutralSyvrelTheExile } from './cards/neutral/syvrel-the-exile';
import { neutralMiniJax } from './cards/neutral/mini-jax';
import { neutralJaxTruesight } from './cards/neutral/jax-truesight';
import { neutralTombstone } from './cards/neutral/tombstone';
import { neutralDioltas } from './cards/neutral/dioltas';
import { f3OrbWeaver } from './cards/faction_3/orb-weaver';
import { f3Pyromancer } from './cards/faction_3/pyromancer';
import { f3FusionBanshee } from './cards/faction_3/fusion-banshee';
import { f3StarfireScarab } from './cards/faction_3/starfire-scarab';
import { neutralRedSynja } from './cards/neutral/red-synja';
import { neutralLuxIgnis } from './cards/neutral/lux-ignis';
import { neutralEmeraldRejuvenator } from './cards/neutral/emeral_rejuvenator';
import { f1SunstoneTemplar } from './cards/faction_1/sunstone-templar';
import { neutralSwornAvenger } from './cards/neutral/sworn-avenger';
import { neutralVoidHunter } from './cards/neutral/void-hunter';
import { f3FireblazeObelisk } from './cards/faction_3/fireblaze-obelisk';
import { neutralSpellspark } from './cards/neutral/spellspark';
import { neutralFlameAcolyte } from './cards/neutral/flame-acolyte';
import { neutralJaxi } from './cards/neutral/jaxi';
import { f3SiphonEnergy } from './cards/faction_3/siphon-energy';
import { neutralGhostLynx } from './cards/neutral/ghost-lynx';
import { f3InnerOasis } from './cards/faction_3/inner-oasis';
import { f3CosmicFlesh } from './cards/neutral/cosmic_flesh';
import { f3DominateWill } from './cards/faction_3/dominate-will';
import { f3EntropicDecay } from './cards/faction_3/entropic-decay';
import { f3RashasCurse } from './cards/faction_3/rashas_curse';
import { f3FountainOfYouth } from './cards/faction_3/fountain_of_youth';
import { f3Hexblade } from './cards/faction_3/hexblade';

const allCards: SerializedBlueprint<any>[] = [
  f1General,
  f1IroncliffeGuardian,
  f1TrueStrike,
  f1LionheartBlessing,
  f1Martyrdom,
  f1SunstoneBracers,
  f1SilverguardKnight,
  f1WindbladeAdept,
  f1AzuriteLion,
  f1SilverguardSquire,
  f1ArclyteSentinel,
  f1Lightchaser,
  f1Sunriser,
  f1LysianBrawler,
  f1SecondSun,
  f1Tempest,
  f1HolyImmolation,
  f1DivineBond,
  f1SundropElixir,
  f1SuntideMaiden,
  f1LastingJudgement,
  f1ArclyteRegalia,
  f1CircleOfLife,
  f1WarSurge,
  f1SunBloom,
  f1ElyxStormblade,
  f1Magnetize,
  f1SunstoneTemplar,

  f2General,
  f2InnerFocus,
  f2KaidoAssassin,
  f2TuskBoar,
  f2ManaVortex,
  f2ChakriAvatar,
  f2CelestialPhantom,
  f2Rythmweaver,
  f2KeshraiFanblade,
  f2HammonBladeseeker,
  f2Gorehorn,
  f2Heartseeker,
  f2FourWindsMagus,
  f2PhoenixFire,
  f2SpiralTechnique,
  f2LanternFox,
  f2GhostLightning,
  f2Gotatsu,
  f2HeavensEclipse,
  f2KillingEdge,
  f2SaberspineSeal,
  f2MistDragonSeal,
  f2Juxtaposition,
  f2KageLightning,
  f2StormKage,
  f2Widowmaker,
  f2JadeMonk,
  f2ScarletViper,

  f3General2,
  f3WindDervish,
  f3EtherealObelysk,
  f3PortalGuardian,
  f3AymaraHealer,
  f3Chronomancer,
  f3Dunecaster,
  f3SandHowler,
  f3StaffOfYkir,
  f3WindShrike,
  f3Blindscorch,
  f3StarsFury,
  f3ZenuiTheBlghtspawned,
  f3ScionsFirstWish,
  f3ScionssSecondWish,
  f3ScionsThirdWish,
  f3BoneSwarm,
  f3OrbWeaver,
  f3Pyromancer,
  f3FusionBanshee,
  f3StarfireScarab,
  f3FireblazeObelisk,
  f3SiphonEnergy,
  f3InnerOasis,
  f3CosmicFlesh,
  f3DominateWill,
  f3EntropicDecay,
  f3RashasCurse,
  f3FountainOfYouth,
  f3Hexblade,

  neutralHealingMystic,
  neutralRiftWalker,
  neutralPrimusShieldMaster,
  neutralArakiHeadhunter,
  neutralAethermaster,
  neutralRepulsorBeast,
  neutralDreamgazer,
  neutralEphemeralShroud,
  neutralDancingBlades,
  neutralValeHunter,
  neutralPutridMindflayer,
  neutralSaberspineTiger,
  neutralProphetOfTheWhitePalm,
  neutralBloodtearAlchemist,
  neutralPrimusFist,
  neutralVenomToth,
  neutralBonereaper,
  neutralWingsOfParadise,
  neutralPiercingMantis,
  neutralArchonSpellbinder,
  neutralLightbender,
  neutralFlamebloodWarlock,
  neutralAzureHornShaman,
  neutralFrostboneNaga,
  neutralSyvrelTheExile,
  neutralMiniJax,
  neutralJaxTruesight,
  neutralTombstone,
  neutralDioltas,
  neutralRedSynja,
  neutralLuxIgnis,
  neutralEmeraldRejuvenator,
  neutralSwornAvenger,
  neutralVoidHunter,
  neutralSpellspark,
  neutralFlameAcolyte,
  neutralJaxi,
  neutralGhostLynx
];

export const CARDS = keyBy(allCards, 'id') as Record<
  CardBlueprintId,
  GenericSerializedBlueprint
>;
