Package.describe({
  name: 'rjgb:microsoft-contacts',
  version: '1.0.0',
  summary: 'Microsoft Contacts package',
  git: 'https://github.com/rjgb/meteor-microsoft-contacts',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('0.9.0');
  api.addFiles('index.js', 'server');
  api.export('MicrosoftContacts');
});

Npm.depends({
  'underscore': '1.5.2'
});
