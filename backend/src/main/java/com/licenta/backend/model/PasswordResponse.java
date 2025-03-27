package com.licenta.backend.model;

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
