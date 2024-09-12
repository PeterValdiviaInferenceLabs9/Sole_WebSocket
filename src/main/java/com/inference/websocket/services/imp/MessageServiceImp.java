package com.inference.websocket.services.imp;

import com.inference.websocket.dto.InferenceAPIRequest;
import com.inference.websocket.dto.InferenceAPIResponse;
import com.inference.websocket.services.IMessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class MessageServiceImp implements IMessageService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessageServiceImp.class);

    public static final Set<Integer> SUCCESS_STATUS_CODES = new HashSet<>(Arrays.asList(200, 201, 202, 204));
    private SimpMessagingTemplate simpMessagingTemplate;

    @Value("${property.inference.url}")
    private String inferenceAPIUrl;

    public MessageServiceImp(SimpMessagingTemplate simpMessagingTemplate){
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Async
    public void sendToUser(InferenceAPIResponse inferenceAPIResponse) {
        simpMessagingTemplate.convertAndSendToUser(inferenceAPIResponse.getSessionId(), "/private", inferenceAPIResponse.getContentMessage());
    }

    @Override
    public void sendToInferenceAPI(InferenceAPIRequest inferenceAPIRequest) {
        LOGGER.info("Starting sending message to Inference API");
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<InferenceAPIRequest> entity = new HttpEntity<>(inferenceAPIRequest, headers);
            ResponseEntity<Void> widgetResponseEntity = restTemplate.postForEntity(inferenceAPIUrl, entity, Void.class);

            if (SUCCESS_STATUS_CODES.contains(widgetResponseEntity.getStatusCode().value())){
                LOGGER.info("Success to send message to Inference API (Webhook)");
            } else {
                LOGGER.error("Error while sending message Inference API (Webhook)");
            }
        } catch(Exception ex){
            LOGGER.warn("Exception while sending message to Inference API (Webhook): {}", ex.getMessage());
        } finally{
            LOGGER.info("Finish sending message to Inference API (Webhook)");
        }
    }
}
