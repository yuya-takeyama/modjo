import { loadGlobalConfig, loadLocalConfigs } from './config';

describe('loadloadGlobalConfig', () => {
  it('should load valid config file', () => {
    const config = loadGlobalConfig('fixtures/apps/modjo-global.yaml');
    expect(config).toMatchSnapshot();
  });
});

describe('loadLocalConfigs', () => {
  it('should load valid config files', () => {
    const configs = loadLocalConfigs('fixtures/apps');
    expect(configs).toMatchSnapshot();
  });
});
