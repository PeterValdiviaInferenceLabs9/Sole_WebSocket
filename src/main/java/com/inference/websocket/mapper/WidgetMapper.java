package com.inference.websocket.mapper;

import com.inference.websocket.dto.InferenceAPIRequest;

public class WidgetMapper {

    private static String defaultMessage = "INICIAR DESDE WEB WIDGET";

    public static InferenceAPIRequest widgetToInferenceAPIRequest(String receiverId, String sessionId
            , String message){
        return InferenceAPIRequest.builder().contentMessage(isNotEmptyStringValidation(message) ? message : defaultMessage)
                .receiverId(receiverId)
                .sessionId(sessionId)
                .subject("WIDGET")
                .build();
    }

    public static boolean isNotEmptyStringValidation(String cadena) {
        return cadena != null && !cadena.trim().isEmpty();
    }

}
