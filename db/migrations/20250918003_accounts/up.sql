create table if not exists scrooge.accounts (
    id integer primary key generated always as identity,
    user_id integer not null,
    balance numeric not null default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone
);

insert into scrooge.accounts (user_id, balance) values (1, 250000);