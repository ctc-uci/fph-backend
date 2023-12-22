DROP TABLE IF EXISTS public.donation_tracking;

CREATE TABLE IF NOT EXISTS public.donation_tracking
(
    business_id integer NOT NULL,
    donation_id integer NOT NULL,
    food_bank_donation character varying(200) COLLATE pg_catalog."default" NOT NULL,
    reporter character varying(200) COLLATE pg_catalog."default" NOT NULL,
    email character varying(256) COLLATE pg_catalog."default" NOT NULL,
    date date NOT NULL,
    canned_dog_food_quantity integer,
    dry_dog_food_quantity integer,
    canned_cat_food_quantity integer,
    dry_cat_food_quantity integer,
    misc_items character varying(2000) COLLATE pg_catalog."default",
    volunteer_hours integer,
    CONSTRAINT donation_tracking_pkey PRIMARY KEY (donation_id),
    CONSTRAINT business_id FOREIGN KEY (business_id)
        REFERENCES public.business (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
