CREATE OR REPLACE FUNCTION scrooge.tau_accounts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO account_transactions (account_id, previous_balance, new_balance)
  VALUES (NEW.id, OLD.balance, NEW.balance);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tau_accounts ON scrooge.accounts;
CREATE OR REPLACE TRIGGER tau_accounts
    AFTER UPDATE ON scrooge.accounts
    FOR EACH ROW
    EXECUTE FUNCTION scrooge.tau_accounts();
