const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

function withModularHeaders(config) {
  return withDangerousMod(config, 'ios', async (config) => {
    const podfilePath = path.join(
      config.modRequest.platformProjectRoot,
      'Podfile'
    );
    let podfile = fs.readFileSync(podfilePath, 'utf8');

    // Se a diretiva não estiver presente, adicione-a no início do Podfile
    if (!podfile.includes('use_modular_headers!')) {
      podfile = `use_modular_headers!\n${podfile}`;
      fs.writeFileSync(podfilePath, podfile);
    }
    return config;
  });
} 

module.exports = withModularHeaders;
