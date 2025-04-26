import * as presets from "./preset-wallets";

export const AllDefaultWallets = [
  presets.SuiWallet,
  presets.OKXWallet,
  presets.BitgetWallet,
  presets.GateWallet,
  presets.SuietWallet,
  presets.SurfWallet,
  presets.NightlyWallet,
  presets.SlushWallet,
  ...[
    presets.EthosWallet,
    presets.MartianWallet,
    presets.MorphisWallet,
    presets.GlassWallet,
    presets.OneKeyWallet,
    // presets.SpacecyWallet,
    presets.SensuiWallet,
    presets.ElliWallet,
    presets.TokenPocketWallet,
    presets.FrontierWallet,
    presets.PhantomWallet,
  ].sort((a, b) => (a.name < b.name ? -1 : 1)),
];
