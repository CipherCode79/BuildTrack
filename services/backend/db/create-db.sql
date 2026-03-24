SELECT 'CREATE ROLE buildtrack LOGIN PASSWORD ''buildtrack_pass'''
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'buildtrack')
\gexec

SELECT 'CREATE DATABASE buildtrack_db OWNER buildtrack'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'buildtrack_db')
\gexec
