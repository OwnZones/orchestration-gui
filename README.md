# Ateliere Live GUI

## Requirements

- Node.js 18.x

## Installation / Usage

For single server installation on Ubuntu 22 see instructions [here](docs/installation.md).

## Development

Start mongodb docker container using `docker-compose up`. It will initialize the db with some test data.

If you want to run the GUI and mongodb docker containers add this to the `docker-compose.yml` file:

```
 liveui:
    build: .
    environment:
      MONGODB_URI: mongodb://api:<API_PASSWORD>@host.docker.internal:27017/live-gui
      LIVE_URL: https://<SYSTEM_CONTROLLER_IP>:8080
      LIVE_CREDENTIALS: <USERNAME>:<PASSWORD>
      NODE_TLS_REJECT_UNAUTHORIZED: 0
      NEXTAUTH_SECRET: <NEXT_AUTH_SECRET>
      NEXTAUTH_URL: http://localhost:3000
      BCRYPT_SALT_ROUNDS: 10
      UI_LANG: en
    ports:
      - 3000:3000
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Then copy the `.env.sample` file and name it `.env`, it will contain env variables:

- `MONGODB_URI` - The mongodb connection string including credentials eg. `mongodb://user123:pass123@127.0.0.1:27017/live-gui`

- `LIVE_URL` - The URL to the Ateliere Live system controller REST API
- `LIVE_CREDENTIALS` - Credentials for the Ateliere Live system controller REST API
- `CONTROL_PANEL_WS` - Specifies the IP address or hostname and port for the control panel WebSocket server.

- `NEXTAUTH_SECRET` - The secret used to encrypt the JWT Token
- `NEXTAUTH_URL` - The base url for the service, eg. `http://localhost:3000`, used internally by NextAuth.
- `BCRYPT_SALT_ROUNDS` - The number of salt rounds the bcrypt hashing function will perform, you probably don't want this higher than 13 ( 13 = ~1 hash/second )
- `UI_LANG` - Set language for the user interface (`en|sv`). Default is `en`
- `DB_OUTPUT_OVERRIDES` - Override and initiate DB presets on startup. Comma-separated list in the form `<pipeline|multiview>[<name>].<setting>=<value>`, where `<setting>` is one of:

  - `port`
  - `local_ip`
  - `remote_ip`
  - `srt_mode`
  - `srt_passphrase`

  for example:

  ```
  DB_PRESET_OVERRIDES=pipeline[LD_Pipeline].port=9200,pipeline[HQ_Pipeline].srt_mode=caller,multiview[default].port=4567
  ```

Run following to run application in development environment:

1. `npm install`
2. `npm run dev`

### External Documentation

https://help.ateliere.com/live/docs/reference/7-0-0/rest_api/

### Contributing

See [CONTRIBUTING](CONTRIBUTING.md)

## Licence

    Copyright (C) 2024 Ateliere Creative Technologies

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
