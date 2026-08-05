-- Fix missing tables/types from migration: create only if absent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('tourist', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bookingstatus') THEN
        CREATE TYPE bookingstatus AS ENUM ('pending', 'confirmed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymenttype') THEN
        CREATE TYPE paymenttype AS ENUM ('full', 'deposit');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
        CREATE TYPE paymentstatus AS ENUM ('pending', 'succeeded', 'failed');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    reduction FLOAT NOT NULL,
    date_expiration DATE NOT NULL,
    actif BOOLEAN NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ix_promo_codes_code') THEN
        CREATE UNIQUE INDEX ix_promo_codes_code ON promo_codes (code);
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role userrole NOT NULL,
    preferences TEXT,
    date_inscription TIMESTAMP DEFAULT now() NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ix_users_email') THEN
        CREATE UNIQUE INDEX ix_users_email ON users (email);
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    CONSTRAINT uq_user_activity_fav UNIQUE (user_id, activity_id),
    FOREIGN KEY (activity_id) REFERENCES activities (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    note INTEGER NOT NULL,
    commentaire TEXT,
    date TIMESTAMP DEFAULT now() NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    montant FLOAT NOT NULL,
    type paymenttype NOT NULL,
    methode VARCHAR(50) NOT NULL,
    statut paymentstatus NOT NULL,
    stripe_intent_id VARCHAR(255),
    date_paiement TIMESTAMP DEFAULT now() NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings (id)
);
