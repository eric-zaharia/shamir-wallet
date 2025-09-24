package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResetPasswordDto {
    private String email;
    private String password;
    private String resetToken;
}
