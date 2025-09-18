CREATE OR REPLACE FUNCTION scrooge.tau_loans()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO loan_transactions (loan_id, previous_balance, new_balance)
  VALUES (NEW.id, OLD.remaining, NEW.remaining);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tau_loans ON scrooge.loans;
CREATE OR REPLACE TRIGGER tau_loans
    AFTER UPDATE ON scrooge.loans
    FOR EACH ROW
    EXECUTE FUNCTION scrooge.tau_loans();
