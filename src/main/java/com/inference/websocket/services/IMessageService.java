package com.inference.websocket.services;

import com.inference.websocket.dto.InferenceAPIRequest;
import com.inference.websocket.dto.InferenceAPIResponse;

public interface IMessageService {
    void sendToUser(InferenceAPIResponse inferenceAPIResponse);
    void sendToInferenceAPI(InferenceAPIRequest inferenceAPIRequest);
}
