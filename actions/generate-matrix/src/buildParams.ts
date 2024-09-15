import { z } from 'zod';
import { Context } from '@actions/github/lib/context';
import { generateTags } from './tagging';
import { GlobalConfig, LocalConfig } from './config';

const IdentitySchema = z.object({
  aws: z.object({
    'iam-role': z.string(),
    region: z.string(),
  }),
});

const RegistrySchema = z.object({
  aws: z.object({
    type: z.enum(['private', 'public']),
    region: z.string(),
    repository: z.string(),
  }),
});

const BuildParamsDockerSchema = z.object({
  context: z.string(),
  tags: z.array(z.string()),
  platforms: z.array(z.string()),
  identity: IdentitySchema,
  registry: RegistrySchema,
});

export const BuildParamsSchema = z.object({
  target: z
    .object({
      path: z.string(),
      ref: z.string(),
    })
    .and(z.record(z.string(), z.string())),
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
      const identity = globalConfig.identities[build.docker.identity];
      if (!identity) {
        throw new Error(`Identity not found: ${build.docker.identity}`);
      }

      const registry = globalConfig.registries[build.docker.registry];
      if (!registry) {
        throw new Error(`Registry not found: ${build.docker.registry}`);
      }

      results.push({
        target: {
          path: config.path,
          ref: context.ref,
        },
        label: 'hoge',
        'last-committed-at': lastCommittedAt,
        value: {
          docker: {
            context: config.path,
            tags: generateTags(
              build.docker.tagging,
              context,
              lastCommittedAt,
              datetimeTagTimeZone,
            ),
            platforms: build.docker.platforms,
            identity,
            registry,
          },
        },
      });
    }
  }

  return results;
}
