import { filterByContext } from './filterByContext';
import { Context } from '@actions/github/lib/context';
import { LocalConfig } from './config';

describe('filterByContext', () => {
  it('should match push event to specified branch', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                branches: ['main'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'push';
    context.ref = 'refs/heads/main';
    const result = filterByContext(configs, context);

    expect(result).toEqual(configs);
  });

  it('should not match push event to non-specified branch', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                branches: ['develop'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'push';
    context.ref = 'refs/heads/main';
    const result = filterByContext(configs, context);

    expect(result).toEqual([]);
  });

  it('should match push event to branch with branches_ignore not matching', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                branches: ['main'],
                branches_ignore: ['develop'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'push';
    context.ref = 'refs/heads/main';

    const result = filterByContext(configs, context);

    expect(result).toEqual(configs);
  });

  it('should not match push event to branch with branches_ignore matching', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                branches_ignore: ['main'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'push';
    context.ref = 'refs/heads/main';

    const result = filterByContext(configs, context);

    expect(result).toEqual([]);
  });

  it('should match push event to tag', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                tags: ['v*'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'push';
    context.ref = 'refs/tags/v1.0.0';
    const result = filterByContext(configs, context);

    expect(result).toEqual(configs);
  });

  it('should not match push event to tag with non-matching tag pattern', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                tags: ['v2.*'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'push';
    context.ref = 'refs/tags/v1.0.0';
    const result = filterByContext(configs, context);

    expect(result).toEqual([]);
  });

  it('should match pull_request event to specified branch', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              pull_request: null,
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'pull_request';
    context.ref = 'refs/heads/main';
    const result = filterByContext(configs, context);

    expect(result).toEqual(configs);
  });

  it('should handle unsupported event types', () => {
    const configs: LocalConfig[] = [
      {
        appName: 'app1',
        path: 'apps/app1',
        build: [
          {
            on: {
              push: {
                branches: ['main'],
              },
            },
          },
        ],
      },
    ];

    const context = new Context();
    context.eventName = 'unknown_event';
    context.ref = 'refs/heads/main';

    expect(() => filterByContext(configs, context)).toThrow(
      'Unsupported event type: unknown_event',
    );
  });
});
