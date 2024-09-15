import { getInput, setOutput } from '@actions/core';
import { context } from '@actions/github';
import { exec, ExecOptions } from '@actions/exec';
import { filterByContext } from './filterByContext';
import { generateBuildParams } from './buildParams';
import { loadGlobalConfig, loadLocalConfigs } from './config';

export async function run() {
  const rootDir = getInput('root-dir');
  const globalConfigFile = getInput('global-config-file');
  const datetimeTagTimeZone = getInput('datetime-tag-timezone') || 'UTC';
  const globalConfig = loadGlobalConfig(globalConfigFile);
  const lastCommittedAt = await getLastCommittedAt();
  const allLocalConfigs = loadLocalConfigs(rootDir);
  const localConfigs = filterByContext(allLocalConfigs, context);
  const buildParams = generateBuildParams(
    globalConfig,
    localConfigs,
    lastCommittedAt,
    context,
    datetimeTagTimeZone,
  );
  setOutput('build-params', buildParams);
}

async function getLastCommittedAt(): Promise<number> {
  let output = '';
  let errorOutput = '';

  const options: ExecOptions = {};
  options.listeners = {
    stdout: (data: Buffer) => {
      output += data.toString();
    },
    stderr: (data: Buffer) => {
      errorOutput += data.toString();
    },
  };

  await exec('git', ['show', '-s', '--format=%ct'], options);

  if (errorOutput) {
    throw new Error(`Failed to get last committed timestamp: ${errorOutput}`);
  }

  return Number(output.trim());
}
