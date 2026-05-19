package com.restaurant.reservation.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {

    /** Root folder for uploaded files (relative or absolute). */
    private String directory = "uploads";

    private long maxFileSizeBytes = 5 * 1024 * 1024;
}
