DROP TABLE IF EXISTS public.notification;

CREATE TABLE IF NOT EXISTS public.notification
(
    business_id integer NOT NULL DEFAULT nextval('notification_business_id_seq'::regclass),
    notification_id integer NOT NULL DEFAULT nextval('notification_notification_id_seq'::regclass),
    message character varying(2000) COLLATE pg_catalog."default" NOT NULL,
    "timestamp" date NOT NULL,
    been_dismissed boolean NOT NULL,
    CONSTRAINT notification_pkey PRIMARY KEY (notification_id),
    CONSTRAINT business_id FOREIGN KEY (business_id)
        REFERENCES public.business (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)