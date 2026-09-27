# NAS auto-deploy - runner setup

One-time setup for the self-hosted GitHub Actions runner that auto-deploys this stack (static site +
PHP API + MariaDB + phpMyAdmin) to a NAS, plus how the pipeline works day to day. The deploy itself
is `.github/workflows/deploy-nas.yml`; what it deploys is the repo's own `compose.yml`.

> This runbook is deliberately host-agnostic (this repo is public). The concrete host, deploy user,
> and absolute paths for the operator's own NAS live in their private notes, not here. Placeholders
> below: `$NAS_DEPLOY_DIR` (the repo Variable), `$RUNNER_USER` (the account the runner runs as).

## How it works

```
push to main
  └─▶ Deploy to NAS (.github/workflows/deploy-nas.yml, self-hosted runner on the NAS)
        checkout this commit
        rsync the tree ▶ $NAS_DEPLOY_DIR   (excludes .env, private/db-config.php, db/ - host-only state)
        chmod the synced tree world-readable (skips the three excluded paths)
        docker compose up -d --build --remove-orphans
        wait for api.php?action=health over the internal `npm` Docker network
```

Nothing is compiled or pulled from a registry - the two custom images (nginx + PHP-FPM) build
directly on the NAS from the repo's own Dockerfiles. MariaDB and phpMyAdmin are public images from
Docker Hub.

Manual deploy: **Actions → Deploy to NAS → Run workflow**.

## One-time setup

### 1. Give the runner user Docker access

The deploy runs `docker` directly (no sudo inside the workflow). The runner account must already be
able to reach the Docker socket:

```bash
getent group docker
sudo usermod -aG docker "$RUNNER_USER"   # only if not already a member
```

Verify: `sudo -u "$RUNNER_USER" docker ps` succeeds with no permission error. A group change needs a
fresh login for that user - restart the runner service after this if you just added it.

### 2. Register this repo's runner

GitHub personal-account runners are per-repo - a runner registered to another repo cannot be reused
here, even on the same NAS.

1. This repo → **Settings → Actions → Runners → New self-hosted runner** → Linux/x64. Download and
   extract as shown, **running every command as `$RUNNER_USER` from the start** (not as an admin
   account you `chown` afterwards - registering as the wrong user leaves root/admin-owned files the
   runner process can't touch, and the listener crashes on its own diagnostic log).
2. Configure with the `minor` label:

   ```bash
   ./config.sh --url https://github.com/<owner>/<repo> --token <TOKEN> \
     --name <runner-name> --labels minor --unattended
   ```

   `--labels minor` is what `runs-on: [self-hosted, minor]` matches. The registration token is
   short-lived and single-use - get a fresh one from the same GitHub page if it's expired.
3. Install and start it as a service so it survives reboots. `svc.sh install`/`start`/`status` need a
   real admin sudo password, which `$RUNNER_USER` may not have - run these as whichever account
   *does* have one, passing `$RUNNER_USER` as the argument so systemd knows which account should run
   the service (the runner process itself still runs as `$RUNNER_USER`, only the install step needs
   an admin's sudo):

   ```bash
   sudo ./svc.sh install "$RUNNER_USER"
   sudo ./svc.sh start
   sudo ./svc.sh status
   ```

Confirm it shows **Idle** under Settings → Actions → Runners.

### 3. Repo Variable

GitHub → **Settings → Secrets and variables → Actions → Variables**:

| Variable | Value |
|---|---|
| `NAS_DEPLOY_DIR` | absolute path of the deploy directory on the NAS |

### 4. Prepare the deploy directory

```bash
sudo mkdir -p "$NAS_DEPLOY_DIR/private"
sudo chown -R "$RUNNER_USER" "$NAS_DEPLOY_DIR"   # the deploy runs as $RUNNER_USER and chmods the tree
```

Create the two files the workflow refuses to run without, both **outside git**:

- `$NAS_DEPLOY_DIR/.env` - one line, `DB_ROOT_PASSWORD=<a strong password>`.
- `$NAS_DEPLOY_DIR/private/db-config.php` - copy `private/db-config.example.php`, fill in the DSN
  host (the `minor-db` service name, not `localhost`), the `spel` user, its password, and `origin`
  (the exact public HTTPS URL, no trailing slash).

**Ownership matters:** `docker compose --env-file`/bind-mounts read these as `$RUNNER_USER`. If you
created them with `sudo`, fix ownership up after:

```bash
sudo chown -R "$RUNNER_USER" "$NAS_DEPLOY_DIR"
chmod 600 "$NAS_DEPLOY_DIR/.env"
chmod 640 "$NAS_DEPLOY_DIR/private/db-config.php"
```

Both files are excluded from the workflow's `rsync --delete`, so redeploys never touch them. Same
goes for `$NAS_DEPLOY_DIR/db/` (MariaDB's data directory) once it exists - never created by git, and
excluded from both the rsync and the post-sync chmod pass.

### 5. The `npm` network, and a stale container name

`minor` joins the external `npm` Docker network so Nginx Proxy Manager can reach it by container
name, and so the workflow's own health check can reach it the same way. It must already exist:
`docker network inspect npm >/dev/null && echo ok` - if not, `docker network create npm`.

If a container named `minor` (or `minor-php`/`minor-db`/`minor-pma`) already exists from an earlier
manual setup, remove it once before the first automated deploy - `docker compose up` will otherwise
fail with a name conflict rather than adopting it:

```bash
cd "$NAS_DEPLOY_DIR" && sudo docker compose down 2>/dev/null || true
sudo docker rm -f minor minor-php minor-db minor-pma 2>/dev/null || true
```

## First deploy

1. Finish steps 1-5.
2. **Actions → Deploy to NAS → Run workflow** on `main`.
3. "Wait for the API to report ready" going green means MariaDB, PHP-FPM and nginx all came up and
   `api.php` can at least reach the database (it does not yet mean the schema exists - see below).
4. The database and its restricted `spel` user, and the `game_results` table, are created **once**
   directly in phpMyAdmin (`docker compose exec` or the phpMyAdmin container, LAN/VPN-only, not part
   of this pipeline) - the deploy never runs SQL or creates schema.

From here every push to `main` redeploys automatically.

## Troubleshooting

- **Run doesn't start** - runner Offline, or wrong repo/label. Check `svc.sh status` and that the
  runner is registered to this repo with the `minor` label.
- **`NAS_DEPLOY_DIR is not set` / missing `.env` or `private/db-config.php`** - step 3/4 not done yet.
- **`permission denied … /var/run/docker.sock`** - step 1 not done, or the runner service wasn't
  restarted after `usermod`.
- **`docker compose up` fails with a name conflict** - an old, non-compose-managed container is
  still using that name (step 5).
- **API never reports healthy** - `docker compose logs minor-php` for the PHP error log (it logs the
  exception class + code, never the config or password); common causes are a wrong password in
  `private/db-config.php`, `host=` not matching the MariaDB service name, or the table not created
  yet (see "First deploy" step 4).
- **Postgres/Dapr-style "permission denied" on a bind-mounted config file** - this NAS's umask
  produced modes the container (running as its own UID, e.g. php-fpm's `www-data`) can't read. The
  deploy's sync step chmods the tree world-readable after rsync; if it still happens, the deploy dir
  has files owned by `root` (from a `sudo mkdir`) that `$RUNNER_USER` couldn't chmod - re-run step 4's
  `chown -R`.
- **Deploy overwrote something on the NAS** - `rsync --delete` mirrors the repo into
  `$NAS_DEPLOY_DIR`. Only `.env`, `private/db-config.php` and `db/` are excluded; keep no other
  hand-edited state there.
