package com.restaurant.reservation.controller;

import com.restaurant.reservation.config.UploadProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class UploadedFileController {

    private final UploadProperties uploadProperties;

    /** URL из API: /api/v1/files/menu/{uuid}.jpg */
    @GetMapping("/menu/{fileName}")
    public ResponseEntity<Resource> serveMenuImage(@PathVariable String fileName) {
        if (fileName == null || fileName.isBlank() || fileName.contains("..") || fileName.contains("/")) {
            return ResponseEntity.notFound().build();
        }
        return serveFile("menu/" + fileName);
    }

    private ResponseEntity<Resource> serveFile(String relativePath) {
        Path root = Path.of(uploadProperties.getDirectory()).toAbsolutePath().normalize();
        Path file = root.resolve(relativePath).normalize();
        if (!file.startsWith(root) || !Files.isRegularFile(file)) {
            return ResponseEntity.notFound().build();
        }

        String contentType;
        try {
            contentType = Files.probeContentType(file);
        } catch (Exception e) {
            contentType = null;
        }
        if (contentType == null) {
            contentType = guessContentType(relativePath);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .contentType(MediaType.parseMediaType(contentType))
                .body(new FileSystemResource(file));
    }

    private static String guessContentType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG_VALUE;
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF_VALUE;
        return MediaType.IMAGE_JPEG_VALUE;
    }
}
