Commands as they will appear when done:

/todo -a[--add] title estimatedTime          -- adds a todo with this title and estimated completion time
/todo -a[--add] title                        -- adds a todo with this title
/todo -e[--edit] todoID title estimatedTime  -- updates a todo with this title and estimated completion time
/todo -e[--edit] todoID title                -- updates a todo with this title
/todo -s[--show] todoID                      -- displays the title, estimated vs completed times, and the notes for this todo
/todo -t[--time] completedTime               -- updates the completedTime for the todo
/todo -c[--connect] parentTodoID childTodoID -- marks the relationship between two todos
/list format                                 -- lists all todos with the format provided (see formats below)
/tree                                        -- shows all todos as a tree from parent to child
/track todoID                                -- starts time tracking on this todoID
/track                                       -- stops time tracking
/notes todoID                                -- starts an REPL that records notes you enter onto that todo
/notes                                       -- ends the notes REPL
/plan -p[--place] todoID startTime endTime   -- adds/updates a todo to the plan
/plan -p[--place] todoID duration            -- adds/updates a todo to the plan
/plan -r[--remove] todoID                    -- removes a todo from the plan
/plan -X[--reset]                            -- completely chucks the plan for today
/plan planFormat                             -- shows the current plan with planFormat (see formats below)

Done currently:
