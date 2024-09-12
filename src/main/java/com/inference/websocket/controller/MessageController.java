package com.inference.websocket.controller;

import com.inference.websocket.dto.InferenceAPIResponse;
import com.inference.websocket.services.IMessageService;
import com.inference.websocket.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class MessageController {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessageController.class);

    private IMessageService messageService;

    public MessageController(IMessageService messageService){
        this.messageService = messageService;
    }

    @PostMapping("/chat/messages")
    public ResponseEntity<Void> receivePrivateMessage(@RequestBody InferenceAPIResponse inferenceAPIResponse) {
        LOGGER.info("Receive private message interaction");
        Util.logAsJson(LOGGER, inferenceAPIResponse, "InferenceAPIResponse");
        messageService.sendToUser(inferenceAPIResponse);
        return ResponseEntity.ok().build();
    }
}
