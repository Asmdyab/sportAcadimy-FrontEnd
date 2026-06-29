import { apiFetch } from "@/lib/api";
import { ApiResult } from "@/types/api";
import type {
  ChatConversationDto,
  ChatMessageDto,
  CreateConversationRequest,
  SendMessageToBotRequest,
} from "@/types/chat";

export const createConversation = async (
  payload?: CreateConversationRequest,
): Promise<ApiResult<ChatConversationDto>> => {
  return apiFetch<ApiResult<ChatConversationDto>>("/api/Chat/conversation", {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
};

export const sendMessageToBot = async (
  payload: SendMessageToBotRequest,
): Promise<ApiResult<ChatMessageDto>> => {
  return apiFetch<ApiResult<ChatMessageDto>>("/api/Chat/bot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getConversationHistory = async (
  conversationId: string,
): Promise<ApiResult<ChatConversationDto>> => {
  return apiFetch<ApiResult<ChatConversationDto>>(
    `/api/Chat/history/${conversationId}`,
  );
};

export const getAllConversations = async (): Promise<
  ApiResult<ChatConversationDto[]>
> => {
  return apiFetch<ApiResult<ChatConversationDto[]>>("/api/Chat/conversations");
};
