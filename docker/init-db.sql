-- Create databases
CREATE DATABASE tedrisat_db;
CREATE DATABASE teskilat_db;

-- Create user for tedrisat service
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tedrisat') THEN
    CREATE USER tedrisat WITH PASSWORD 'tedrisat';
  END IF;
END
$$;

-- Create user for teskilat service
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'teskilat') THEN
    CREATE USER teskilat WITH PASSWORD 'teskilat';
  END IF;
END
$$;

-- Grant privileges to tedrisat user
GRANT ALL PRIVILEGES ON DATABASE tedrisat_db TO tedrisat;
ALTER DATABASE tedrisat_db OWNER TO tedrisat;
\c tedrisat_db
GRANT ALL ON SCHEMA public TO tedrisat;
ALTER SCHEMA public OWNER TO tedrisat;

-- Grant privileges to teskilat user
GRANT ALL PRIVILEGES ON DATABASE teskilat_db TO teskilat;
ALTER DATABASE teskilat_db OWNER TO teskilat;
\c teskilat_db
GRANT ALL ON SCHEMA public TO teskilat;
ALTER SCHEMA public OWNER TO teskilat;