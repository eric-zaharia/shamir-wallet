package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailRecipientDto {
    private String email;
    private String name;
}
