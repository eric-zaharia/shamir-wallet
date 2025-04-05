package com.licenta.backend.controller;

import com.licenta.backend.dto.PasswordRequest;
import com.licenta.backend.dto.PasswordResponse;
import com.licenta.backend.dto.PublicPasswordResponse;
import com.licenta.backend.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/{passwordId}")
    public ResponseEntity<?> getPassword(@PathVariable String passwordId) {
        PasswordResponse passwordResponse = passwordService.getPassword(Long.parseLong(passwordId));
        return ResponseEntity.ok(passwordResponse);
    }

    @GetMapping("/all/user")
    public ResponseEntity<?> getAllPasswordsByUser() {
        List<PublicPasswordResponse> passwords = passwordService.getAllPasswordsByUser();
        return ResponseEntity.ok(passwords);
    }

}
