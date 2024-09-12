package com.inference.websocket.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class InferenceAPIRequest {
    private String subject;
    private String receiverId;
    private String sessionId;
    private String contentMessage;
}
