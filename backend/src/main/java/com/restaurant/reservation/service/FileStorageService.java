package com.restaurant.reservation.service;

import com.restaurant.reservation.config.UploadProperties;
import com.restaurant.reservation.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final UploadProperties uploadProperties;

    /**
     * Saves image under menu/ and returns relative path (e.g. menu/uuid.png).
     */
    public String storeMenuImage(MultipartFile file) {
        validateImage(file);
        String ext = extensionFrom(file);
        String relativePath = "menu/" + UUID.randomUUID() + ext;
        store(file, relativePath);
        return relativePath;
    }

    public void deleteIfExists(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            Path target = resolve(relativePath);
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new BusinessException("Failed to delete file");
        }
    }

    private void store(MultipartFile file, String relativePath) {
        try {
            Path target = resolve(relativePath);
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new BusinessException("Failed to store file: " + e.getMessage());
        }
    }

    private Path resolve(String relativePath) {
        Path root = Path.of(uploadProperties.getDirectory()).toAbsolutePath().normalize();
        Path target = root.resolve(relativePath).normalize();
        if (!target.startsWith(root)) {
            throw new BusinessException("Invalid file path");
        }
        return target;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Image file is required");
        }
        if (file.getSize() > uploadProperties.getMaxFileSizeBytes()) {
            throw new BusinessException("Image must be smaller than 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException("Only JPEG, PNG, WebP or GIF images are allowed");
        }
    }

    private String extensionFrom(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null && name.contains(".")) {
            String ext = name.substring(name.lastIndexOf('.')).toLowerCase();
            if (ext.matches("\\.(jpe?g|png|webp|gif)")) {
                return ext;
            }
        }
        return switch (file.getContentType()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
