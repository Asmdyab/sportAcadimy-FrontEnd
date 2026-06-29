import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  createConversation,
  sendMessageToBot,
  getAllConversations,
  getConversationHistory,
} from "@/services/chat.service";
import type { ChatMessageDto, ChatConversationDto } from "@/types/chat";
import {
  Bot,
  Send,
  Plus,
  MessageCircle,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";

const CONVERSATION_KEY = "chat-active-conversation";

function getStoredConversationId(): string | null {
  try {
    return localStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

function setStoredConversationId(id: string | null) {
  try {
    if (id) localStorage.setItem(CONVERSATION_KEY, id);
    else localStorage.removeItem(CONVERSATION_KEY);
  } catch { /* noop */ }
}

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    getStoredConversationId,
  );
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessageDto[]>([]);

  // ── Queries ───────────────────────────────────────────────────────────

  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
  } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: getAllConversations,
    select: (res) => (res.isSuccess ? res.data : []),
  });

  const {
    data: conversationDetail,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
  } = useQuery({
    queryKey: ["chat-conversation", activeConversationId],
    queryFn: () => getConversationHistory(activeConversationId!),
    enabled: !!activeConversationId,
    select: (res) => (res.isSuccess ? res.data : null),
  });

  const conversations = useMemo(() => conversationsData ?? [], [conversationsData]);
  const messages = conversationDetail?.messages ?? [];
  const allMessages = optimisticMessages.length > 0
    ? [...messages, ...optimisticMessages]
    : messages;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length, optimisticMessages]);

  // Clear optimistic messages when real data arrives from refetch
  const prevFetching = useRef(isFetchingHistory);
  useEffect(() => {
    if (prevFetching.current && !isFetchingHistory && conversationDetail) {
      setOptimisticMessages([]);
    }
    prevFetching.current = isFetchingHistory;
  }, [isFetchingHistory, conversationDetail]);

  // ── Mutations ─────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: () => createConversation({ title: "New Chat" }),
    onSuccess: (res) => {
      if (res.isSuccess && res.data) {
        setActiveConversationId(res.data.id);
        setStoredConversationId(res.data.id);
        setOptimisticMessages([]);
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      } else {
        toast({ title: "Error", description: res.message, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (payload: SendMessageToBotRequest) =>
      sendMessageToBot(payload),
    onMutate: (payload) => {
      const optimisticMsg: ChatMessageDto = {
        id: `optimistic-${Date.now()}`,
        role: "user",
        content: payload.message,
        createdAt: new Date().toISOString(),
      };
      setOptimisticMessages((prev) => [...prev, optimisticMsg]);
      setInput("");
      return { userInput: payload.message };
    },
    onSuccess: (res, _payload, context) => {
      if (res.isSuccess && res.data) {
        setOptimisticMessages([
          {
            id: `msg-${Date.now()}`,
            role: "user",
            content: context?.userInput ?? "",
            createdAt: new Date().toISOString(),
          },
          {
            id: `msg-${res.data.id}`,
            role: res.data.role,
            content: res.data.content,
            createdAt: res.data.createdAt,
          },
        ]);
        queryClient.invalidateQueries({ queryKey: ["chat-conversation", activeConversationId] });
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      } else {
        setOptimisticMessages([]);
        toast({ title: "Error", description: res.message, variant: "destructive" });
      }
    },
    onError: () => {
      setOptimisticMessages([]);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    createMutation.mutate();
  }, [createMutation]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setStoredConversationId(id);
    setOptimisticMessages([]);
  }, []);

  const handleDeleteConversation = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setStoredConversationId(null);
      }
      toast({ title: "Info", description: "Conversation removal not implemented on server" });
    },
    [activeConversationId, toast],
  );

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !activeConversationId || sendMutation.isPending) return;
    sendMutation.mutate({
      conversationId: activeConversationId!,
      message: trimmed,
    });
  }, [input, activeConversationId, sendMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Auto-create first conversation
  useEffect(() => {
    if (!isLoadingConversations && !activeConversationId && conversations.length === 0) {
      handleNewChat();
    } else if (!isLoadingConversations && !activeConversationId && conversations.length > 0) {
      handleSelectConversation(conversations[0].id);
    }
  }, [isLoadingConversations, activeConversationId, conversations, handleNewChat, handleSelectConversation]);

  const isLoading = createMutation.isPending || (isLoadingConversations && !activeConversationId);

  // ── Render helpers ────────────────────────────────────────────────────

  function renderMessage(msg: ChatMessageDto) {
    const isUser = msg.role === "user";
    const isOptimistic = msg.id.startsWith("optimistic-");
    return (
      <div
        key={msg.id}
        className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} ${isOptimistic ? "opacity-60" : ""}`}
      >
        {!isUser && (
          <Avatar className="h-8 w-8 mt-0.5 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`max-w-[75%] ${isUser ? "order-first" : ""}`}>
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted rounded-bl-md"
            }`}
          >
            {msg.content}
          </div>
          <p className={`text-[10px] text-muted-foreground mt-1 ${isUser ? "text-right" : "text-left"}`}>
            {isOptimistic ? "Sending..." : new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 mt-0.5 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              U
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-4 p-6">
      {/* Conversations Sidebar */}
      <Card className="card-athletic w-72 shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            onClick={handleNewChat}
            disabled={createMutation.isPending}
            variant="hero"
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoadingConversations ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No conversations yet
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">
                    {conv.title || "New Chat"}
                  </span>
                  <div
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    role="button"
                    tabIndex={0}
                    className={`shrink-0 ml-auto hover:text-destructive transition-opacity ${
                      activeConversationId === conv.id
                        ? "text-primary-foreground/70 hover:text-primary-foreground"
                        : "text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="card-athletic flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                {activeConversationId ? "Ask me anything about sports training" : "Start a new conversation"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Powered
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          {isLoadingHistory && activeConversationId ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                  <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-1/2" : "w-2/3"}`} />
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                </div>
              ))}
            </div>
          ) : !activeConversationId ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <div className="p-5 rounded-full bg-primary/10">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Click "New Chat" to begin</p>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <div className="p-5 rounded-full bg-primary/10">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium">How can I help you?</p>
              <p className="text-sm">Ask me about training, exercises, or sports techniques</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allMessages.map(renderMessage)}
              {sendMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={!activeConversationId || sendMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || !activeConversationId || sendMutation.isPending}
              variant="hero"
              size="icon"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
