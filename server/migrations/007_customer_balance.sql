-- =========================================================
-- 007_customer_balance.sql
-- Adds: customers.outstanding_balance — backs the Paid/Unpaid status
-- shown on the Customers page and settable from the Add Customer modal.
-- A customer with outstanding_balance > 0 is "Unpaid" (they owe that
-- amount); 0 means "Paid" (or no orders recorded yet). This is separate
-- from total_spent, which only ever reflects money actually received.
-- =========================================================

alter table public.customers
  add column if not exists outstanding_balance numeric(12, 2) not null default 0;
