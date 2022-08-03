# eCommerce Web Application

![Deploy to Production](https://github.com/standout-specialties/ecommerce/workflows/Deploy%20to%20Production/badge.svg)

Wordpress + WooCommerce running headlessly + Next.js/Typescript to power the UI.

See [here](https://postlight.com/trackchanges/introducing-postlights-wordpress-react-starter-kit) for more information.

## Developing New Feature

### Running Project Locally

#### Prerequisites

You must have [Docker](https://docs.docker.com/get-docker/) installed and running locally.

First run:

```bash
sudo ./docker/modify_etc_hosts.sh
```

This script will update your `/etc/hosts` file.

Next run:

```bash
./docker/install_certs.sh
```

This script will:

- install `mkcert` (if not already installed)
- generate the necessary certs for you and place them in the local `./caddy` directory

Lastly, run:

```bash
make run-local
```

#### Running Project Locally on Windows

As the MakeFile cannot be run on Windows, you need to run the docker-compose command manually.

1. Determine docker container IP
   - In command prompt, run `ipconfig`
   - Look for 'Ethernet adapter vEthernet (WSL):' then copy the 'IPv4 Address' value
2. Run `DOCKERHOST="docker_container_IP_here" docker-compose -f docker-compose.yaml up`

#### Web App

Once `docker-compose` is up and running, can be accessed at `https://standoutspecialties.local`.

#### Woocommerce

Once `docker-compose` is up and running, can be accessed at `https://wordpress.standoutspecialties.local/wp-admin/` (default user is `sos` with password `sos`);

#### Local issues

Should you have any issues running locally and wish to rebuild your local setup simply run:

```bash
make nuke-local-setup
make run-local
```

This will delete all of your Docker containers, images, and volumes that are associated with this project then rebuild everything from scratch.

#### Media Uploads

When running via `docker-compose`, local uploads are handled by WordPress and stored in the volume. WP-Stateless plugin is installed but not activated locally as it is not needed. Staging and production are configured to use this plugin for storing media on Google Cloud Storage (GCS).

#### Email

Emails are sent via SendGrid API. The SendGrid plugin handles the bulk of this work. Each environment (local, ~~staging~~, production) uses a different API key.

### Git Workflow

NOTE: currently no `staging` environment

<!-- 1. Create a feature branch off of `staging` branch with the following nomenclature `<github-issue-id>-summary-of-my-feature`.
2. Push commits to your branch and to GitHub
3. Open pull request against `staging`
4. Once approved and merged, a build will be triggered against staging environment
5. Once approved manually on staging, merging `staging` branch to `master` will trigger a deployment to production environment. -->

### Linting

`web-app` is configured to use ESlint + prettier. `wordpress` is configured to use `phpcs`. If using Visual Studio Code it's recommended you download the `phpcs` and `php-cs-fixer` extensions. These extensions have already been configured for you in `.vscode/settings.json`.

### Deployments

#### CI/CD

CI/CD is handled by Github Actions. See [`./.github/workflows`](./.github/workflows) directory for configuration. Note that a lot of sensitive information (ex. passwords) used during these workflows are stored as [GitHub secrets](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

**Note**: if for some reason you need access to the raw values of these secrets, reach out to [Joey](https://github.com/joeyorlando).

**Creating a new Github actions workflow**

1. Copy existing deploy-to-production.yml under .github/workflows and rename it accordingly
2. Inside the new yaml file, change the name (this will be displayed in github actions)
3. Change the branch name (on > push > branches) and also the ref (jobs > checkout-build-deploy > steps > name: checkout > with > ref )
4. Go to the github repository. Then navigate to Settings > Secrets.
5. Create a new repositoiry secret for each env variable under env that starts with secrets. (e.g. ${{ secrets.PRODUCTION_DB_NAME }}, you would create PRODUCTION_DB_NAME secret in github) The values can be provided by [Joey](https://github.com/joeyorlando) or can be determined from wp-config.php file if already set there.
6. Create SSH key to deploy to the google cloud VM instance. For windows, you can use openssh.
   - Open cmd as administrator
   - Type ssh-keygen -C 'email of the user'
   - Press enter when prompted for a password, to not set a password
7. Add the SSH public key to the google cloud VM instance metadata
   - Click on the instance name to view details
   - Click on EDIT button
   - Scroll down to SSH keys and click Show and edit
   - Click on Add item and paste the public ssh key (should follow this format ssh-rsa <key> <email>)
8. Create 4 github secrets for the SSH key
   - SSH HOST (e.g. for dev is DEV_WORDPRESS_LAMP_SSH_HOST) should be the VM instance external IP address.
   - SSH PORT (e.g. for dev is DEV_WORDPRESS_LAMP_SSH_PORT) should be default port 22.
   - SSH PRIVATE KEY (e.g. for dev is DEV_WORDPRESS_LAMP_SSH_PRIVATE_KEY) can be found in the generated pricate key file in step 6. Make sure to copy all of the file's contents.
   - SSH PORT (e.g. for dev is DEV_WORDPRESS_LAMP_SSH_PORT) should be default port 22.
   - SSH USER (e.g. for dev is DEV_WORDPRESS_LAMP_SSH_USER) should be the email used for the ssh key (e.g. for gmail daniil@gmail.com, you would simply put daniil)
9. Deployment failure fix: if you are getting the error "rsync: failed to set times on "/var/www/html/.": Operation not permitted", it is because the owner of the directory is not the same as the ssh user. So you must set the ownership of the directory to the ssh user with chown command "sudo chown -R username:group directory" (e.g. sudo chown -R daniilkarpov.dk93:devs /var/www/html where daniilkarpov.dk93 is the user and devs is the user group)

#### WordPress

WordPress is deployed on a GCP Cloud Instance. See [`./wordpress/build.sh`](./wordpress/build.sh) for a more in depth explaination of the build process.

#### Next.js Frontend

The Next.js frontend is being deployed on [Vercel](https://vercel.com/standout-specialties). Deployments are configured inside of Vercel. There is a deployment linked to ~~`staging` and~~ `master` branches.

### Versioning

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). To bump the version simply run:

```bash
make bump-version type=<major|minor|patch>
```

**Note** you must have the `git` `semver` plugin installed, see [here](https://github.com/markchalloner/git-semver) for installation instructions.

## Useful References

- [Deploying Wordpress on GCP GAE](https://cloud.google.com/community/tutorials/run-wordpress-on-appengine-standard)
- [Headless WordPress/React Starter Kit](https://github.com/postlight/headless-wp-starter)
- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/#create-a-product)
- [WordPress REST API - Adding Custom Endpoints](https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/)

## Running product import

### Tire import /wp-content/themes/standout-specialties/migrations/add_tires.php

### Wheel import /wp-content/themes/standout-specialties/migrations/add_wheels.php

To see logs from the import you can ssh into the machine and execute tail -f
`tail -f /var/log/sos_https/error.log`
