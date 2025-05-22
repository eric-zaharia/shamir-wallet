package com.licenta.backend.controller;

import com.licenta.backend.dto.AuthenticationRequest;
import com.licenta.backend.dto.ForgotPasswordDto;
import com.licenta.backend.dto.RegisterRequest;
import com.licenta.backend.dto.ResetPasswordDto;
import com.licenta.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final AuthService authService;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok().body("test ok");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest authenticationRequest) {
        return ResponseEntity.ok().body(authService.authenticate(authenticationRequest));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordDto forgotPasswordDto) {
        try {
            authService.forgotPassword(forgotPasswordDto);
            return ResponseEntity.ok().build();
        } catch (UsernameNotFoundException e) {
            return  ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDto resetPasswordDto) {
        try {
            authService.resetPassword(resetPasswordDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
