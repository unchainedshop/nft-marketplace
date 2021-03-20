export $(cat .env | xargs)
docker-compose -f docker-compose.production.yml build
docker stack deploy -c docker-compose.production.yml --resolve-image never udf
