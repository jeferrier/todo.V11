Commands as they will appear when done:

/list format                                 -- lists all todos with the format provided (see formats below)
/plan -p[--place] todoID startTime endTime   -- adds/updates a todo to the plan
/plan -p[--place] todoID duration            -- adds/updates a todo to the plan
/plan -r[--remove] todoID                    -- removes a todo from the plan
/plan -X[--reset]                            -- completely chucks the plan for today
/plan planFormat                             -- shows the current plan with planFormat (see formats below)

Done currently:
/todo -a[--add] title estimatedTime          -- adds a todo with this title and estimated completion time
/todo -a[--add] title                        -- adds a todo with this title
/todo -e[--edit] todoID title estimatedTime  -- updates a todo with this title and estimated completion time
/todo -e[--edit] todoID title                -- updates a todo with this title
/todo -s[--show] todoID                      -- displays the title, estimated vs completed times, and the notes for this todo
/todo -t[--time] todoID completedTime        -- updates the completedTime for the todo
/todo -m[--mark] todoID (done|todo)          -- marks a todo as 'done' or not
/todo -c[--connect] parentTodoID childTodoID -- marks the relationship between two todos
/todo -D[--delete] todoID                    -- deletes the todo with todoID
/track todoID                                -- starts time tracking on this todoID
/notes todoID                                -- starts an REPL that records notes you enter onto that todo
/notes                                       -- ends the notes REPL
/track                                       -- stops time tracking
/tree                                        -- shows all todos as a tree from parent to child
/exit                                        -- exits the process
