package com.licenta.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PasswordResponse {
    private String label;
    private List<String> shards;
    private int required;
}
