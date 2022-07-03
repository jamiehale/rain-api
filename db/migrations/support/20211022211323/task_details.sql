DROP VIEW IF EXISTS task_details;
CREATE VIEW task_details AS
  WITH task_states AS (
    SELECT
      task_id,
      state,
      created_at,
      ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY created_at DESC) AS row_number
    FROM task_state_changes
  )
  SELECT
    t.id,
    t.name,
    t.description,
    t.due,
    t.parent_id,
    t.user_id,
    t.created_at,
    t.updated_at,
    ts.state,
    ts.created_at AS state_updated_at
  FROM tasks AS t
    INNER JOIN task_states AS ts
      ON ts.task_id = t.id
      AND ts.row_number = 1
;
