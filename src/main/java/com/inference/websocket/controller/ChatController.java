package com.inference.websocket.controller;

import com.inference.websocket.dto.InferenceAPIRequest;
import com.inference.websocket.mapper.WidgetMapper;
import com.inference.websocket.model.ChatMessage;
import com.inference.websocket.services.IMessageService;
import com.inference.websocket.util.Util;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private IMessageService messageService;
    public ChatController(IMessageService messageService){
        this.messageService = messageService;
    }

    @MessageMapping("/message/private")
    public void receivePrivateMessage(SimpMessageHeaderAccessor headerAccessor, @Payload ChatMessage chatMessage) {
        String sessionId = headerAccessor.getFirstNativeHeader("sessionId");
        String receiverId = headerAccessor.getFirstNativeHeader("receiverId");
        System.out.println("SessionId: " + sessionId);
        System.out.println("ReceiverId: " + receiverId);
        String message = Util.replaceBreakLines(chatMessage.getContent());
        InferenceAPIRequest inferenceAPIRequest = WidgetMapper.widgetToInferenceAPIRequest(receiverId, sessionId
                , message);
        messageService.sendToInferenceAPI(inferenceAPIRequest);
    }

    @MessageMapping("/message/create-conversation")
    public void receiveCreateConversation(SimpMessageHeaderAccessor headerAccessor, @Payload ChatMessage chatMessage) {
        String sessionId = headerAccessor.getFirstNativeHeader("sessionId");
        String receiverId = headerAccessor.getFirstNativeHeader("receiverId");
        System.out.println("SessionId: " + sessionId);
        System.out.println("ReceiverId: " + receiverId);
        InferenceAPIRequest inferenceAPIRequest = WidgetMapper.widgetToInferenceAPIRequest(receiverId, sessionId
                , chatMessage.getContent());
        messageService.sendToInferenceAPI(inferenceAPIRequest);

    }
}
