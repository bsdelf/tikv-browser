interface Config {
  rpcHost: string;
}

let config: Config;

const getenv = (name: string) => {
  const value = process.env[name];
  if (typeof value !== 'string') {
    throw new Error(`process.env.${name} not found`);
  }
  return value;
};

export const loadConfig = () => {
  return {
    rpcHost: getenv('REACT_APP_RPC_HOST'),
  };
};

export const getConfig = () => {
  if (!config) {
    config = loadConfig();
  }
  return config;
};

export default { getConfig };
