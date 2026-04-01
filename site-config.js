const isLocalStaticPreview =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
  ['4173', '4174'].includes(window.location.port);

window.MAISON_PANTHERA_CONFIG = {
  apiBaseUrl: isLocalStaticPreview ? '' : window.location.origin
};
