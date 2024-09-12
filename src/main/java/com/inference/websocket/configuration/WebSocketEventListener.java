package com.inference.websocket.configuration;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpAttributes;
import org.springframework.messaging.simp.SimpAttributesContextHolder;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Component
@Slf4j
public class WebSocketEventListener {

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor stompHeaderAccessor = StompHeaderAccessor.wrap(event.getMessage());
        List<String> sessionIds = stompHeaderAccessor.getNativeHeader("sessionId");
        if (sessionIds != null && !sessionIds.isEmpty()) {
            String sessionId = sessionIds.get(0);
            System.out.println("Nueva sesión establecida: " + sessionId);
            SimpAttributes simpAttributes = SimpAttributesContextHolder.currentAttributes();
            simpAttributes.setAttribute("sessionId", sessionId);
        } else {
            System.out.println("Nueva conexión WebSocket sin sessionId.");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpAttributes simpAttributes = SimpAttributesContextHolder.currentAttributes();
        String sessionId = (String) simpAttributes.getAttribute("sessionId");
        System.out.println("SessionId recuperado: " + sessionId);
    }

}
