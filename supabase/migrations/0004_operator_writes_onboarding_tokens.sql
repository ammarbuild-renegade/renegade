-- ===========================================================================
-- onboarding_tokens had a SELECT policy and nothing else, so no operator
-- could create one and the accept action failed with "Could not create the
-- onboarding link."
--
-- Migration 0003 wrote this table from the reader's point of view: the public
-- onboarding route reads it with the service role, which bypasses RLS, so the
-- missing write path was invisible until something tried to use it.
--
-- The operator who owns the client is exactly who should be issuing that
-- client's onboarding link, so the fix is a policy rather than reaching for
-- the admin client. Using the service role here would have hidden the gap
-- instead of closing it.
-- ===========================================================================

create policy "operator issues own client tokens"
  on onboarding_tokens for insert
  with check ( operator_owns_client(client_id) );

-- Marking a token used happens in the public route handler under the service
-- role, so no update policy is needed for that. This one lets an operator
-- revoke a link they issued - expiring it by hand if it went to the wrong
-- address.
create policy "operator revokes own client tokens"
  on onboarding_tokens for update
  using    ( operator_owns_client(client_id) )
  with check ( operator_owns_client(client_id) );
