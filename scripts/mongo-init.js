/* eslint-disable no-undef */
productionsDb = db.getSiblingDB('live-gui');

productionsDb.createUser({
  user: 'api',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'live-gui' }]
});
