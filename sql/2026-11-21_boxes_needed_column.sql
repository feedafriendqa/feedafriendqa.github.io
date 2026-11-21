-- Applied to production 2026-11-21 (migration add_boxes_needed_generated_column).
-- One box feeds up to 4 people, so a household needs ceil(household_size / 4) boxes
-- per distribution (household_size of 0/NULL counts as 1).
ALTER TABLE public.food_box_applications
  ADD COLUMN boxes_needed integer
  GENERATED ALWAYS AS ((ceil(COALESCE(NULLIF(household_size, 0), 1)::numeric / 4))::integer) STORED;

COMMENT ON COLUMN public.food_box_applications.boxes_needed IS
  'Boxes this household needs PER DISTRIBUTION = ceil(household_size / 4); household_size 0/NULL counts as 1. Generated, read-only. Sum over status=confirmed = the "Boxes needed" tile. NOT the same as max_boxes.';
COMMENT ON COLUMN public.food_box_applications.max_boxes IS
  'LIFETIME allowance cap on boxes (default 3; usually 3/6/12, raised via top-ups). NOT the boxes needed per distribution: see boxes_needed.';
COMMENT ON COLUMN public.food_box_applications.boxes_received IS
  'Boxes already delivered to this household so far, counted against max_boxes.';
