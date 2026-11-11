module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'perf',
        'test',
        'docs',
        'style',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'header-max-length': [2, 'always', 100],
    // Bot commits (Dependabot) include long URLs in the body and footer.
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
