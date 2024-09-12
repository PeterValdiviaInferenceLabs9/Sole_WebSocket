package com.inference.websocket.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;

public class Util {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void logAsJson(Logger logger, Object obj, String prefixMessage) {
        try {
            String json = OBJECT_MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
            logger.info("{}: {}", prefixMessage, json);
        } catch (JsonProcessingException e) {
            logger.error("Error convirtiendo objeto a JSON", e);
        }
    }

    public static String replaceBreakLines(String message){
        return message.replaceAll("(?i)<br ?/?>", "\n");
    }
}
