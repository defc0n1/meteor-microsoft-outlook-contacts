Package.describe({
  name: 'rjgb:microsoft-outlook-contacts',
  version: '1.0.4',
  summary: 'Microsoft Outlook Contacts package',
  git: 'https://github.com/rjgb/meteor-microsoft-outlook-contacts',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('0.9.0');
  api.addFiles('index.js', 'server');
  api.export('MicrosoftOutlookContacts');
});

Npm.depends({
  'underscore': '1.5.2'
});
