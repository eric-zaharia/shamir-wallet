package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MailDetails {
    private String recipient;
    private String subject;
    private String body;
}
