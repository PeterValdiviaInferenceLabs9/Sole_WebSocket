package com.inference.websocket.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ChatMessage {

    private MessageType type;
    private String content;
    private String sender;
    private String receiverId;
    private String status;
    private String timestamp;

}
