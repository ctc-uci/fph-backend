DROP TABLE IF EXISTS public.fair_market_value;

CREATE TABLE IF NOT EXISTS public.fair_market_value
(
    item_id integer NOT NULL DEFAULT nextval('fair_market_value_item_id_seq'::regclass),
    item_name character varying(200) COLLATE pg_catalog."default" NOT NULL,
    quantity_type character varying(100) COLLATE pg_catalog."default",
    price numeric,
    category character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT fair_market_value_pkey PRIMARY KEY (item_id)
)