const randomstring = require('randomstring');

module.exports = (oauth2) => {
  // Authorization uri definition
  const redirect_uri = process.env.REDIRECT_URL;
  console.log(`auth.js > redirect URI: ${redirect_uri}`);

  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri,
    scope: process.env.SCOPES || 'repo,user',
    state: randomstring.generate(32),
  });

  return (req, res, next) => {
    res.redirect(authorizationUri);
  };
};
