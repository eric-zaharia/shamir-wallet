package com.licenta.backend.controller;

import com.licenta.backend.dto.EmailRecipientDto;
import com.licenta.backend.service.EmailRecipientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/v1/recipient")
@RequiredArgsConstructor
public class EmailRecipientController {
    private final EmailRecipientService emailRecipientService;

    @PostMapping
    public ResponseEntity<?> saveEmailRecipient(@RequestBody EmailRecipientDto emailRecipientDto) {
        emailRecipientService.addEmailRecipient(emailRecipientDto);

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<?> getAllEmailRecipientsByUser() {
        return ResponseEntity.ok(emailRecipientService.findAllEmailRecipientsByUser());
    }

    @DeleteMapping
    public ResponseEntity<?> deleteEmailRecipient(@RequestBody EmailRecipientDto emailRecipientDto) {
        emailRecipientService.deleteEmailRecipient(emailRecipientDto.getEmail());

        return ResponseEntity.ok().build();
    }

}
