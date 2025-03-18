package com.licenta.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class EncryptionKey {
    private String key;
    private long passwordId;
}
