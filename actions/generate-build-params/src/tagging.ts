import { DateTime } from 'luxon';
import { TaggingStrategy } from './config';
import { Context } from '@actions/github/lib/context';

export function generateTags(
  taggingStrategy: TaggingStrategy,
  context: Context,
  lastCommittedAt: number,
  timeZone: string,
): string[] {
  if (taggingStrategy === 'always_latest') {
    return ['latest'];
  } else if (taggingStrategy === 'semver_datetime') {
    const datetime = DateTime.fromSeconds(lastCommittedAt, { zone: timeZone });
    return [`1.0.0-${datetime.toFormat('yyyyMMddHHmmss')}`];
  } else if (taggingStrategy === 'pull_request') {
    return [`pr-${context.payload.pull_request?.number}`];
  }

  throw new Error(`Unknown tagging strategy: ${taggingStrategy}`);
}
