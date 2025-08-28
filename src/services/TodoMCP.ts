import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp";
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { Todo, TodoService } from "@/src/services/TodoService";
import { z } from "zod";
import * as stytch from "stytch";

const client = new stytch.Client({
  project_id: process.env.STYTCH_PROJECT_ID as string,
  secret: process.env.STYTCH_SECRET as string,
  custom_base_url: process.env.STYTCH_DOMAIN,
});

export const initializeMCPServer = (server: McpServer) => {
    const todoService = (authInfo: AuthInfo | undefined) =>  {
      if(!authInfo) throw new Error("No authInfo provided")
      const { subject } = authInfo.extra as { subject: string };

      return new TodoService({
      get: () =>
        client.users
          .get({ user_id: subject })
          .then((user) => user.untrusted_metadata?.todos || []),
      set: async (todos: Todo[]) =>
        void client.users.update({ user_id: subject, untrusted_metadata: { todos } }),
    });
  }

    const formatResponse = (
      description: string,
      newState: Todo[],
    ): {
      content: Array<{ type: "text"; text: string }>;
    } => {
      return {
        content: [
          {
            type: "text",
            text: `Success! ${description}\n\nNew state:\n${JSON.stringify(newState, null, 2)}}`,
          },
        ],
      };
    };

    server.tool("whoami", "Who am i anyway", async ({authInfo}) => ({
      content: [
        {
          type: "text",
          text: `AuthInfo Contents: ${JSON.stringify(authInfo, null, 2)}`,
        },
      ],
    }));

    server.resource(
      "Todos",
      new ResourceTemplate("todoapp://todos/{id}", {
        list: async ({authInfo}) => {
          const todos = await todoService(authInfo).get();

          return {
            resources: todos.map((todo) => ({
              name: todo.text,
              uri: `todoapp://todos/${todo.id}`,
            })),
          };
        },
      }),
      async (uri, { id }, {authInfo}) => {
        const todos = await todoService(authInfo).get();
        const todo = todos.find((todo) => todo.id === id);
        return {
          contents: [
            {
              uri: uri.href,
              text: todo
                ? `text: ${todo.text} completed: ${todo.completed}`
                : "NOT FOUND",
            },
          ],
        };
      },
    );

    server.tool(
      "createTodo",
      "Add a new TODO task",
      { todoText: z.string() },
      async ({ todoText }, {authInfo}) => {
        const todos = await todoService(authInfo).add(todoText);
        return formatResponse("TODO added successfully", todos);
      },
    );

    server.tool(
      "markTodoComplete",
      "Mark a TODO as complete",
      { todoID: z.string() },
      async ({ todoID }, {authInfo}) => {
        const todos = await todoService(authInfo).markCompleted(todoID);
        return formatResponse("TODO completed successfully", todos);
      },
    );

    server.tool(
      "deleteTodo",
      "Mark a TODO as deleted",
      { todoID: z.string() },
      async ({ todoID }, {authInfo}) => {
        const todos = await todoService(authInfo).delete(todoID);
        return formatResponse("TODO deleted successfully", todos);
      },
    );
  };
