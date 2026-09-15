-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Bookings"
ADD CONSTRAINT "bookings_no_overlapping_dates"
EXCLUDE USING gist (
  car_id WITH =,
  tsrange(pickup_at, return_at, '[)') WITH &&
)
WHERE (status IN ('PENDING', 'CONFIRMED'));