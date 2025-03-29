package com.licenta.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PasswordRequest {
    private String label;
    private List<String> shards;
    private int shardsNo;
    private int selfCustodyShardsNo;
    private List<String> mailRecipients;
}
