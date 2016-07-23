/**
 * @todo: recursively send requests until all contacts are fetched
 *
 * @todo: check paging and photos
 *
 *
 * To format JSON nicely:
 *
 * @see http://jsonviewer.stack.hu/
 *
 */
var EventEmitter = Npm.require('events').EventEmitter,
  _ = Npm.require('underscore'),
  qs = Npm.require('querystring'),
  util = Npm.require('util'),
  url = Npm.require('url'),
  https = Npm.require('https'),
  querystring = Npm.require('querystring');

MicrosoftOutlookContacts = function (opts) {
  if (typeof opts === 'string') {
    opts = { token: opts };
  }
  if (!opts) {
    opts = {};
  }

  this.contacts = [];
  this.consumerKey = opts.consumerKey ? opts.consumerKey : null;
  this.consumerSecret = opts.consumerSecret ? opts.consumerSecret : null;
  this.token = opts.token ? opts.token : null;
  this.refreshToken = opts.refreshToken ? opts.refreshToken : null;
};

MicrosoftOutlookContacts.prototype = {};

util.inherits(MicrosoftOutlookContacts, EventEmitter);

MicrosoftOutlookContacts.prototype._get = function (params, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = {};
  }

  var req = {
    host: 'apis.live.net',
    port: 443,
    path: this._buildPath(params),
    method: 'GET'
  };

  https.request(req, function (res) {
    var data = '';

    res.on('end', function () {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        var error = new Error('Bad client request status: ' + res.statusCode);
        return cb(error);
      }
      try {
        data = JSON.parse(data);
        cb(null, data);
      }
      catch (err) {
        cb(err);
      }
    });

    res.on('data', function (chunk) {
      //console.log(chunk.toString());
      data += chunk;
    });

    res.on('error', function (err) {
      cb(err);
    });

    //res.on('close', onFinish);
  }).on('error', function (err) {
    cb(err);
  }).end();
};

MicrosoftOutlookContacts.prototype._getPhotoData = function (params, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = {};
  }

  var req = {
    host: 'apis.live.net',
    port: 443,
    path: this._buildPath(params),
    method: 'GET'
  };

  // console.log(req);

  https.request(req, function (res) {
    var data;
    var dataType = false;
    // var data = new Buffer();

    res.on('end', function () {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        var error = new Error('Bad client request status: ' + res.statusCode);
        return cb(error);
      }
      try {
        // console.log('end: ', data.length);
        cb(null, data);
      }
      catch (err) {
        cb(err);
      }
    });

    res.on('data', function (chunk) {
      // console.log(req.path, " : ", chunk.toString().length, ": ", chunk.length);
      if (dataType) {
        var chunk_buffer = new Buffer(chunk, 'binary');
        // data += chunk;
        data = Buffer.concat([data, chunk_buffer]);
      } else {
        data = new Buffer(chunk, 'binary');
        dataType = true;
        // console.log('start: ');
      }
      // console.log('chunk: ', chunk.length);
    });

    res.on('error', function (err) {
      cb(err);
    });

    //res.on('close', onFinish);
  }).on('error', function (err) {
    cb(err);
  }).end();
};

MicrosoftOutlookContacts.prototype.getPhoto = function (path, cb) {
  this._getPhotoData({path: path}, receivedPhotoData);
  function receivedPhotoData(err, data) {
    cb(err, data);
  }
};

MicrosoftOutlookContacts.prototype.getContacts = function (cb, contacts) {
  var self = this;

  this._get({ type: 'contacts' }, receivedContacts);
  function receivedContacts(err, data) {
    if (err) return cb(err);

    self._saveContactsFromFeed(data.data);

    var next = false;
    /*data.feed.link.forEach(function (link) {
     if (link.rel === 'next') {
     next = true;
     var path = url.parse(link.href).path;
     self._get({ path: path }, receivedContacts);
     }
     });*/
    if (!next) {
      cb(null, self.contacts);
    }
  }
};

MicrosoftOutlookContacts.prototype._saveContactsFromFeed = function (contacts) {
  var self = this;
  //console.log(contacts);
  contacts.forEach(function (entry) {
    try {
      var name = entry.first_name + ' ' + entry.last_name;
      var email = entry.emails.preferred;
      var photoUrl = '';
      var mimeType = '';

      self.contacts.push({name: name, email: email, photoUrl: photoUrl, mime_type: mimeType});
    }
    catch (e) {
      // property not available...
    }
  });
  // console.log(self.contacts);
  //console.log(self.contacts.length);
};

MicrosoftOutlookContacts.prototype._buildPath = function (params) {
  if (params.path) return params.path;

  params = params || {};
  params.type = params.type || 'contacts';
  params.contact_id = params.contact_id || 'me';

  var query = {
    'access_token': this.token
  };

  var path = '/v5.0/';
  path += params.contact_id + '/';
  path += params.type;

  path += '?' + qs.stringify(query);

  return path;
};

MicrosoftOutlookContacts.prototype.refreshAccessToken = function (refreshToken, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = {};
  }

  var data = {
    client_id: this.consumerKey,
    client_secret: this.consumerSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  };

  var body = qs.stringify(data);

  var opts = {
    host: 'login.live.com',
    port: 443,
    path: '/oauth20_token.srf',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': body.length
    }
  };

  var req = https.request(opts, function (res) {
    var data = '';
    res.on('end', function () {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        var error = new Error('Bad client request status: ' + res.statusCode);
        return cb(error);
      }
      try {
        data = JSON.parse(data);
        //console.log(data);
        cb(null, data.access_token);
      }
      catch (err) {
        cb(err);
      }
    });

    res.on('data', function (chunk) {
      //console.log(chunk.toString());
      data += chunk;
    });

    res.on('error', function (err) {
      cb(err);
    });

    //res.on('close', onFinish);
  }).on('error', function (err) {
    cb(err);
  });

  req.write(body);
  req.end();
};
