-- Fix generate_account_number to produce 7-digit numbers, matching the
-- existing account numbers (1000001-1000006). The previous version padded
-- to 10 digits, which produced inconsistent numbers like 0001000007.
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN LPAD(nextval('public.account_number_seq')::text, 7, '0');
END;
$$;
