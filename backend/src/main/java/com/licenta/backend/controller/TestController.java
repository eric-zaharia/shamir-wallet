package com.licenta.backend.controller;

import com.licenta.backend.dto.MailDetails;
import com.licenta.backend.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class TestController {
    private final MailService mailService;

    @GetMapping("/jwt")
    public String testJwt() {
        return "secured";
    }

    @GetMapping("/mail")
    public ResponseEntity<?> testMail() {
        MailDetails mailDetails = new MailDetails(
                "zahariaericus@gmail.com",
                "Test licenta",
                "Test"
        );
        mailService.sendSimpleMail(mailDetails);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/sendZip")
    public ResponseEntity<?> send() throws Exception {
        mailService.sendEncryptedZip("Test password", "test parola zip 2", "1234", "zahariaeric@gmail.com");
        return ResponseEntity.accepted().build();
    }
}
