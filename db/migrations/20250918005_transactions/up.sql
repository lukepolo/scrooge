create table if not exists scrooge.account_transactions (
    id uuid primary key default gen_random_uuid(),
    account_id integer not null,
    previous_balance numeric not null,
    new_balance numeric not null,
    created_at timestamp with time zone not null default now()
);

create table if not exists scrooge.loan_transactions (
    id uuid primary key default gen_random_uuid(),
    loan_id integer not null,
    previous_balance numeric not null,
    new_balance numeric not null,
    created_at timestamp with time zone not null default now()
);