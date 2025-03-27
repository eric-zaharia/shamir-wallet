package com.licenta.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PasswordRequest {
    private List<String> shards;
    private int shardsNo;
    private int selfCustodyShardsNo;
}
