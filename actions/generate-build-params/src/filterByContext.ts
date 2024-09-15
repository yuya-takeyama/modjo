import { Context } from '@actions/github/lib/context';
import {
  LocalConfig,
  TriggerRule,
  PushEvent,
  PullRequestEvent,
  GitHubFilterPatterns,
} from './config';
import { minimatch } from 'minimatch';

export function filterByContext(
  configs: LocalConfig[],
  context: Context,
): LocalConfig[] {
  return configs
    .map(config => {
      return {
        ...config,
        build: config.build.filter(build => {
          return shouldTriggerBuild(build.on, context);
        }),
      };
    })
    .filter((config): config is LocalConfig => config.build.length > 0);
}

function shouldTriggerBuild(on: TriggerRule, context: Context): boolean {
  const eventName = context.eventName;

  if (eventName === 'push' && on.push) {
    return matchEvent(on.push, context, 'push');
  } else if (eventName === 'pull_request' && on.pull_request) {
    return matchEvent(on.pull_request, context, 'pull_request');
  } else if (eventName === 'pull_request_target' && on.pull_request_target) {
    return matchEvent(on.pull_request_target, context, 'pull_request_target');
  }

  return false;
}

function matchEvent(
  eventConfig: boolean | null | PushEvent | PullRequestEvent,
  context: Context,
  eventType: 'push' | 'pull_request' | 'pull_request_target',
): boolean {
  if (typeof eventConfig === 'boolean' || eventConfig === null) {
    return true;
  }

  const ref = context.ref; // example: 'refs/heads/main' or 'refs/tags/v1.0.0'
  const refName = ref.replace(/^refs\/(heads|tags)\//, '');

  const isBranch = ref.startsWith('refs/heads/');
  const isTag = ref.startsWith('refs/tags/');

  if (eventType === 'push' && isBranch) {
    return matchBranch(refName, eventConfig as PushEvent);
  } else if (eventType === 'push' && isTag) {
    return matchTag(refName, eventConfig as PushEvent);
  } else if (eventType === 'pull_request') {
    return matchBranch(refName, eventConfig as PullRequestEvent);
  } else if (eventType === 'pull_request_target') {
    return matchBranch(refName, eventConfig as PullRequestEvent);
  }

  throw new Error(`Unsupported event type: ${eventType}`);
}

function matchBranch(
  branchName: string,
  eventConfig: PushEvent | PullRequestEvent,
): boolean {
  const { branches, branches_ignore } = eventConfig;

  if (branches_ignore && matchesPatterns(branchName, branches_ignore)) {
    return false;
  }

  if (branches && matchesPatterns(branchName, branches)) {
    return true;
  }

  // If no branch pattern is specified, build is executed
  return !branches;
}

function matchTag(tagName: string, eventConfig: PushEvent): boolean {
  const { tags, tags_ignore } = eventConfig;

  if (tags_ignore && matchesPatterns(tagName, tags_ignore)) {
    return false;
  }

  if (tags && matchesPatterns(tagName, tags)) {
    return true;
  }

  // If no tag pattern is specified, build is executed
  return !tags;
}

function matchesPatterns(
  name: string,
  patterns: GitHubFilterPatterns,
): boolean {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  return patternList.some(pattern => minimatch(name, pattern));
}
