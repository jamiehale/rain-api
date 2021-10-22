#! /bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER rain_api WITH PASSWORD 'rain';
    CREATE DATABASE rain;
    GRANT ALL PRIVILEGES ON DATABASE rain TO rain_api;
    \c rain;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

