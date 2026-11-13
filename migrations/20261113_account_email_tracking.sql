alter table public.notification_outbox
 drop constraint notification_outbox_kind_check,
 add constraint notification_outbox_kind_check check (kind in ('contact','sponsorship','signed_form','account_invite','account_recovery'));