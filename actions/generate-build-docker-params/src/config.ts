import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { globSync } from 'glob';
import { dirname, join, normalize } from 'path';

const TaggingStrategySchema = z.enum([
  'always_latest',
  'semver_datetime',
  'pull_request',
]);

export type TaggingStrategy = z.infer<typeof TaggingStrategySchema>;

const DockerBuildConfigSchema = z.object({
  tagging: TaggingStrategySchema,
  registry: z.string(),
  platforms: z.array(z.string()),
});

const GitHubFilterPatternsSchema = z.union([z.string(), z.array(z.string())]);

export type GitHubFilterPatterns = z.infer<typeof GitHubFilterPatternsSchema>;

const PushEventSchema = z.object({
  branches: GitHubFilterPatternsSchema.optional(),
  branches_ignore: GitHubFilterPatternsSchema.optional(),
  tags: GitHubFilterPatternsSchema.optional(),
  tags_ignore: GitHubFilterPatternsSchema.optional(),
});

export type PushEvent = z.infer<typeof PushEventSchema>;

const PullRequestEventSchema = z.object({
  branches: GitHubFilterPatternsSchema.optional(),
  branches_ignore: GitHubFilterPatternsSchema.optional(),
});

export type PullRequestEvent = z.infer<typeof PullRequestEventSchema>;

const TriggerRuleSchema = z.object({
  push: z.union([z.literal(null), z.boolean(), PushEventSchema]).optional(),
  pull_request: z
    .union([z.literal(null), z.boolean(), PullRequestEventSchema])
    .optional(),
  pull_request_target: z
    .union([z.literal(null), z.boolean(), PullRequestEventSchema])
    .optional(),
});

export type TriggerRule = z.infer<typeof TriggerRuleSchema>;

const BuildConfigSchema = z.object({
  on: TriggerRuleSchema,
  docker: DockerBuildConfigSchema.optional(),
});

export const GlobalConfigSchema = z.object({
  build: z.object({
    docker: z.object({
      identities: z.record(
        z.string(),
        z.object({
          aws: z.object({
            'iam-role': z.string(),
            region: z.string(),
          }),
        }),
      ),
      registries: z.record(
        z.string(),
        z.object({
          aws: z.object({
            identity: z.string(),
            type: z.enum(['private', 'public']).default('private').optional(),
            region: z.string(),
            'repository-base': z.string(),
          }),
        }),
      ),
    }),
  }),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

export const LocalConfigSchema = z.object({
  build: z.array(BuildConfigSchema),
});

export type LocalConfig = z.infer<typeof LocalConfigSchema> & {
  appName: string;
  path: string;
};

export function loadGlobalConfig(filePath: string): GlobalConfig {
  const data = load(readFileSync(filePath, 'utf8'));
  return GlobalConfigSchema.parse(data);
}

export function loadLocalConfigs(rootDir: string): LocalConfig[] {
  const files = globSync('**/modjo.yaml', { cwd: rootDir });

  return files.map(file => {
    const appName = normalize(dirname(file));
    const path = normalize(join(rootDir, dirname(file)));
    const configFile = normalize(join(rootDir, file));
    return {
      appName,
      path,
      ...loadLocalConfig(configFile),
    };
  });
}

function loadLocalConfig(filePath: string) {
  const data = load(readFileSync(filePath, 'utf8'));
  return LocalConfigSchema.parse(data);
}
