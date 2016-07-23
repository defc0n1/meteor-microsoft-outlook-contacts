Meteor Microsoft Contacts

Based on mrt:google-contacts (can't find repo, search mrt:google-contacts on atmosphere.com)

This post was very helpful...
https://techjoomla.com/invitex/how-to-use-hotmailrest-api-to-import-contacts.html

# Install

    meteor add rjgb:microsfoft-contacts

# Usage

You must request at least the following permissions (scope) when logging in through OAuth
```javascript
requestPermissions: ['wl.emails', 'wl.basic', 'wl.contacts_emails'],
```

And then...
  
```javascript
opts =
  consumerKey: microsoftId
  consumerSecret: microsoftSecret
  token: microsoftAccessToken
  refreshToken: microsoftRefreshToken

mcontacts = new MicrosoftContacts opts

mcontacts.refreshAccessToken opts.refreshToken, (err, accessToken) ->
  if err
    console.log 'gcontact.refreshToken, ', err
    return false
  else
    console.log 'mcontact.access token success!'
    mcontacts.token = accessToken
    mcontacts.getContacts (err, contacts) ->
      // Do what you want to do with contacts
      // console.log(contacts);

    mcontacts.getPhoto contact.photoUrl, (err, binaryData) ->
      // Save binaryData to you DB or file.
```