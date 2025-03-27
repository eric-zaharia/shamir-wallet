package com.licenta.password_store.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EncryptionKeyDto {
    private String key;
    private long passwordId;
}
