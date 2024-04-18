-- Table: public.business_users

-- DROP TABLE IF EXISTS public.business_users;

CREATE TABLE IF NOT EXISTS public.business_users
(
    id integer,
    uid character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT business_users_pkey PRIMARY KEY (uid),
    CONSTRAINT id FOREIGN KEY (id)
        REFERENCES public.business (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.business_users
    OWNER to postgres;