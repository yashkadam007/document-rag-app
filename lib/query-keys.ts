export const queryKeys = {
  auth: {
    user: ["auth", "user"],
  },
  chats: {
    all: ["chats"],
    detail: (id: string) => ["chats", id],
    messages: (chatId: string) => ["chats", chatId, "messages"],
    documents: (chatId: string) => ["chats", chatId, "documents"],
  },
}
