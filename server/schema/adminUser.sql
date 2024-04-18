-- Table: public.admin_users

-- DROP TABLE IF EXISTS public.admin_users;

CREATE TABLE IF NOT EXISTS public.admin_users
(
    name character varying(500) COLLATE pg_catalog."default" NOT NULL,
    email character varying(500) COLLATE pg_catalog."default" NOT NULL,
    last_updated date NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.admin_users
    OWNER to postgres;