/**
 * Dominia v0.1 ships solo play only: the multiplayer, account, shop and news
 * features all talk to the OpenFront API, which is closed source and not ours
 * to call. Every online entry point checks this flag, so turning multiplayer
 * back on against Dominia's own server is a one-line change.
 */
export const ONLINE_FEATURES = false;
