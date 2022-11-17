# Netlify-cms-github-oauth-provider

**_External authentication providers were enabled in netlify-cms version 0.4.3.
Check your web console to see your netlify-cms version._**

[netlify-cms](https://www.netlifycms.org/) has its own github OAuth client.
This implementation was created by reverse engineering the results of that
client, so it's not necessary to re-implement client part of
[netlify-cms](https://www.netlifycms.org/).

GitHub, GitHub Enterprise and GitLab are currently supported, but as this is a
general Oauth client, feel free to submit a PR to add other git hosting
providers.

Other implementations: https://www.netlifycms.org/docs/external-oauth-clients/

## Clone Repository

```bash
git clone git@github.com:chrisjsherm/netlify-cms-github-oauth-provider.git
cd netlify-cms-github-oauth-provider
npm install
```

## Create Oauth App

Information is available on the
[GitHub Developer Documentation](https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/registering-oauth-apps/)
or [GitLab Docs](https://docs.gitlab.com/ee/integration/oauth_provider.html).
Fill out the fields however you like, except for **authorization callback URL**.
This is where GitHub or GitLab will send your callback after a user has
authenticated, and should be `https://your.server.com/callback` for use with
this repo.

## Configuration

### Auth Provider Config

Configuration is done with environment variables, which can be supplied as
command line arguments, added in your app hosting interface, or loaded from a
`.env` ([dotenv](https://github.com/motdotla/dotenv)) file.

**Example .env file:**

```ini
NODE_ENV=production
ORIGIN=www.my_organisation.com
OAUTH_CLIENT_ID=f432a9casdff1e4b79c57
OAUTH_CLIENT_SECRET=pampadympapampadympapampadympa
REDIRECT_URL=https://your.server.com/callback
GIT_HOSTNAME=https://github.website.com
PORT=3000
```

**NOTE**: ORIGIN is mandatory and can contain regex, e.g.,
`.*.my_organisation.com`

For GitLab you also have to provide these environment variables:

```ini
OAUTH_PROVIDER=gitlab
SCOPES=api
OAUTH_AUTHORIZE_PATH=/oauth/authorize
OAUTH_TOKEN_PATH=/oauth/token
```

You can also setup an environment variable to configure "\_blank" target when
auth window is opened. Default is "\_self".

```ini
AUTH_TARGET=_blank
```

**Client ID & Client Secret:**
After registering your Oauth app, you will be able to get your client id and
client secret on the next page.

**Redirect URL (optional in github, mandatory in gitlab):**
Include this if you need your callback to be different from what is supplied in your Oauth app configuration.

**Git Hostname (Default github.com):**
This is only necessary for use with GitHub Enterprise or GitLab.

**Port number (Default 3000)**
If you do not want to run the app on 3000.

### CMS Config

You also need to add `base_url` to the backend section of your netlify-cms's
config file. `base_url` is the live URL of this repo with no trailing slashes.

```yaml
backend:
  name: [github | gitlab]
  repo: user/repo # Path to your GitHub/GitLab repository
  branch: master # Branch to update
  base_url: https://your.server.com # Path to ext auth provider
```

## Deploy

### Heroku

Basic instructions for pushing to heroku are available in the [original blog post](http://www.vxk.cz/tips/2017/05/18/netlify-cms/).

### Locally

To integrate with GitHub locally, you will need to change the NODE_ENV to
`development` and configure a certificate and key at `./key.pem` and
`./cert.pem` (root directory of the app), respectively. You will also need to
set up a second
[GitHub Oauth app](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
with the callback URL pointed to `localhost:3000/callback`.

If you configured the `.env` file, run:

```bash
npm start
```

If `.env` is not configured, base the variables via CLI:

```bash
PORT=3111 NODE_ENV=production ORIGIN=www.my_organisation.com OAUTH_CLIENT_ID=... OAUTH_CLIENT_SECRET=... npm start
```

If running behind reverse-proxy (e.g. nginx), the `/auth` and `/callback` paths need to be proxied, e.g. like so:

```nginx
 location /auth {
    proxy_pass http://127.0.0.1:3111;
    proxy_pass_request_headers      on;
    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header Early-Data $ssl_early_data;
}

location /callback {
    proxy_pass http://127.0.0.1:3111;
    proxy_pass_request_headers      on;
    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header Early-Data $ssl_early_data;
}
```

You may want to run this as a systemd service like so:

```bash
$ cat /etc/systemd/system/oauth-github.service
```

```ini
[Unit]
Description=OAuth provider for Netlify CMS and GitHub
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/opt/netlify-cms-github-oauth-provider
ExecStart=/usr/bin/npm run start
Restart=always
Environment=PORT=3111
Environment=ORIGIN=www.my_organisation.com
Environment=OAUTH_CLIENT_ID=...
Environment=OAUTH_CLIENT_SECRET=...

[Install]
WantedBy=multi-user.target
```

### Azure

Deploy an ExpressJS app to Azure:
https://docs.microsoft.com/en-us/azure/developer/javascript/tutorial/deploy-nodejs-azure-app-service-with-visual-studio-code?tabs=bash

Be sure to set up a GitHub Oauth app with the callback URL of the Azure service.
See the "Create OAuth App" section above for the link on setting up an Oauth app.

In the "Configuration" section of your Azure Web App, add the environment
variables from `.env` to your app settings.

Be sure to the change the `base_url` in your Hugo app's `config.yml` file to the
Azure service's URL.
