
CREATE TABLE IF NOT EXISTS public.spot_price_data
(
    region character varying(255) COLLATE pg_catalog."default" NOT NULL,
    instance_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    spot_price double precision NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.spot_price_data
    OWNER to postgres;