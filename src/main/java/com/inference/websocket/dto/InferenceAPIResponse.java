package com.inference.websocket.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class InferenceAPIResponse {
    private String subject;
    private String receiverId;
    private String sessionId;
    private String contentMessage;
    private String conversationId;
}
