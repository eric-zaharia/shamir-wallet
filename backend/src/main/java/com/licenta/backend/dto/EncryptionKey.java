package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class EncryptionKey {
    private String key;
    private long passwordId;
}
