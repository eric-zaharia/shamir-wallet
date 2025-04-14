package com.licenta.backend.client;

import com.licenta.backend.dto.EncryptionKey;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "password-store", url = "${enc_service.api.base.url}")
public interface EncryptionKeyClient {
    @PostMapping(value="/api/v1/key")
    void save(EncryptionKey encryptionKey);

    @GetMapping("/api/v1/key/{passwordId}")
    String getEncryptionKey(@PathVariable String passwordId);

    @DeleteMapping("/api/v1/key/{passwordId}")
    void deleteEncryptionKey(@PathVariable String passwordId);
}
