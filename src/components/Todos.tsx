"use client";

import { useState, FormEvent } from "react";
import { withLoginRequired } from "./Auth";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { Todo, TodoService } from "@/src/services/TodoService";

const TodoEditor = withLoginRequired(() => {
  const [newTodoText, setNewTodoText] = useState("");
  const stytch = useStytch();
  const { user } = useStytchUser();

  const todos: Todo[] = user?.untrusted_metadata.todos as Todo[] ?? [];

  const svc = new TodoService({
    get: async () => todos,
    set: async (todos: Todo[]) =>
      void stytch.user.update({ untrusted_metadata: { todos } }),
  });

  const onAddTodo = (evt: FormEvent) => {
    evt.preventDefault();
    svc.add(newTodoText);
    setNewTodoText("");
  };
  const onCompleteTodo = (id: string) => svc.markCompleted(id);
  const onDeleteTodo = (id: string) => svc.delete(id);

  return (
    <div className="todoEditor">
      <p>
        The TODO items shown below can be edited via the UI + REST API, or via
        the MCP Server. Connect to the MCP Server running at{" "}
        <span>
          <b>
            <code>{window.location.origin}/mcp</code>
          </b>
        </span>{" "}
        with your MCP Client to try it out.
      </p>
      <ul>
        <form onSubmit={onAddTodo}>
          <li>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
            <button type="submit" className="primary">
              Add TODO
            </button>
          </li>
        </form>
        {todos.map((todo) => (
          <li key={todo.id}>
            <div>
              {todo.completed ? (
                <>
                  ✔️ <s>{todo.text}</s>
                </>
              ) : (
                todo.text
              )}
            </div>
            <div>
              {!todo.completed && (
                <button onClick={() => onCompleteTodo(todo.id)}>
                  Complete
                </button>
              )}
              <button onClick={() => onDeleteTodo(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TodoEditor;
