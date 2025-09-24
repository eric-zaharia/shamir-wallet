package com.licenta.password_store.controller;

import com.licenta.password_store.dto.EncryptionKeyDto;
import com.licenta.password_store.entity.EncryptionKey;
import com.licenta.password_store.repository.EncryptionKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/key")
@RequiredArgsConstructor
public class EncryptionKeyController {
    private final EncryptionKeyRepository encryptionKeyRepository;

    @DeleteMapping("{passwordId}")
    public ResponseEntity<?> deletePassword(@PathVariable String passwordId) {
        EncryptionKey enc = encryptionKeyRepository
                .findByPasswordId(Long.parseLong(passwordId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        encryptionKeyRepository.delete(enc);
        return ResponseEntity.ok().build();
    }

    @GetMapping("{passwordId}")
    public ResponseEntity<?> findByPasswordId(@PathVariable String passwordId) {
        String enc = encryptionKeyRepository
                .findByPasswordId(Long.parseLong(passwordId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
                .getKey();

        return ResponseEntity.ok(enc);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody EncryptionKeyDto encryptionKeyDto) {
        EncryptionKey key = new EncryptionKey();
        key.setPasswordId(encryptionKeyDto.getPasswordId());
        key.setKey(encryptionKeyDto.getKey());

        if (encryptionKeyRepository.existsByPasswordId(encryptionKeyDto.getPasswordId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Password id already exists");
        }

        encryptionKeyRepository.save(key);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
