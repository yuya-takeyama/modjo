import { z } from 'zod';
import { Context } from '@actions/github/lib/context';
import { generateTags } from './tagging';
import { GlobalConfig, LocalConfig } from './config';
import { join } from 'path';

const BuildParamsDockerAwsSchema = z.object({
  identity: z.object({
    'iam-role': z.string(),
    region: z.string(),
  }),
  registry: z.object({
    type: z.enum(['private', 'public']).default('private').optional(),
    region: z.string(),
    'repository-base': z.string(),
  }),
});

const BuildParamsDockerSchema = z.object({
  context: z.string(),
  tags: z.string(),
  platforms: z.string(),
  aws: BuildParamsDockerAwsSchema,
});

const TargetSchema = z
  .object({
    path: z.string(),
    ref: z.string(),
  })
  .and(z.record(z.string(), z.string()));

type Target = z.infer<typeof TargetSchema>;

export const BuildParamsSchema = z.object({
  target: TargetSchema,
  'last-committed-at': z.number(),
  label: z.string(),
  value: z.object({
    docker: BuildParamsDockerSchema,
  }),
});

export type BuildParams = z.infer<typeof BuildParamsSchema>;

export function generateBuildParams(
  globalConfig: GlobalConfig,
  localConfigs: LocalConfig[],
  lastCommittedAt: number,
  context: Context,
  datetimeTagTimeZone: string,
): BuildParams[] {
  const results: BuildParams[] = [];

  for (const config of localConfigs) {
    for (const build of config.build) {
      const identity = globalConfig.identities[build.docker!.identity];
      if (!identity) {
        throw new Error(`Identity not found: ${build.docker!.identity}`);
      }

      const registry = globalConfig.registries[build.docker!.registry];
      if (!registry) {
        throw new Error(`Registry not found: ${build.docker!.registry}`);
      }

      const target = {
        path: config.path,
        ref: context.ref,
      };

      results.push({
        target,
        label: generateLabel(config.appName, target),
        'last-committed-at': lastCommittedAt,
        value: {
          docker: {
            context: config.path,
            tags: generateTags(
              join(registry.aws['repository-base'], config.appName),
              build.docker!.tagging,
              context,
              lastCommittedAt,
              datetimeTagTimeZone,
            ).join(','),
            platforms: build.docker!.platforms.join(','),
            aws: {
              identity: identity.aws,
              registry: registry.aws,
            },
          },
        },
      });
    }
  }

  return results;
}

function generateLabel(appName: string, target: Target): string {
  const targetStr = Object.keys(target)
    .sort()
    .map(key => `${key}:${target[key]}`)
    .join(',');
  return `${appName} (${targetStr})`;
}
