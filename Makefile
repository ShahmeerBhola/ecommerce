bump-version:
	git semver $(type)

run-local:
	# We manually build the wordpress image because it copies a folder outside of /wordpress (the wp-uploads folder)
	docker build -t sos-wordpress:latest -f wordpress/Dockerfile .

	# https://stackoverflow.com/a/38753971/3902555
	# https://stackoverflow.com/a/15071515/3902555
	DOCKERHOST="$(shell ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $$2 }' | cut -f2 -d: | head -n1)" docker-compose -f docker-compose.yaml up

run-local-wp:
	DOCKERHOST="$(shell ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $$2 }' | cut -f2 -d: | head -n1)" docker-compose -f docker-compose-wp.yaml up -d

nuke-local-setup:
	# See here for why to pipe to "true" https://stackoverflow.com/a/38225298/3902555

	# containers
	docker rm -f $(shell docker inspect --format="{{.Id}}" sos-web-app) || true
	docker rm -f $(shell docker inspect --format="{{.Id}}" sos-wordpress) || true
	docker rm -f $(shell docker inspect --format="{{.Id}}" sos-db) || true
	docker rm -f $(shell docker inspect --format="{{.Id}}" sos-caddy) || true

	# images
	docker rmi -f $(shell docker images --filter=reference=ecommerce_sos-web-app --format "{{.ID}}") || true
	docker rmi -f $(shell docker images --filter=reference=ecommerce_sos-wordpress --format "{{.ID}}") || true
	docker rmi -f $(shell docker images --filter=reference=wordpress:5.5.1-php7.3 --format "{{.ID}}") || true
	docker rmi -f $(shell docker images --filter=reference=mariadb:10.1.47 --format "{{.ID}}") || true
	docker rmi -f $(shell docker images --filter=reference=caddy:2.0.0 --format "{{.ID}}") || true

	# volumes
	docker volume rm ecommerce_sos_db_data || true
