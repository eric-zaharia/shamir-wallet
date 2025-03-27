package com.licenta.backend.controller;

import com.licenta.backend.model.PasswordRequest;
import com.licenta.backend.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/password")
@RequiredArgsConstructor
public class PasswordController {
    private final PasswordService passwordService;

    @PostMapping
    public ResponseEntity<?> addPassword(@RequestBody PasswordRequest passwordRequest) {
        passwordService.addPassword(passwordRequest);
        return ResponseEntity.ok(passwordRequest.toString());
    }
}
