create table if not exists scrooge.loans (
    id integer primary key generated always as identity,
    user_id integer not null,
    amount numeric not null,
    interest_rate numeric not null default 0.00,
    remaining numeric not null,
    status text not null default 'approved',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone
);