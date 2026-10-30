/**
 * The features backed by OpenFront's closed-source API: public lobbies,
 * ranked, accounts, the shop, news and streams. Dominia has no access to that
 * API, so every one of their entry points checks this flag. Private lobbies
 * do not need it: they run on Dominia's own server and show whenever the page
 * knows one (ClientEnv.hasGameServer).
 */
export const ONLINE_FEATURES = false;
