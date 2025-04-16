package com.licenta.backend.service;

import com.licenta.backend.dto.EmailRecipientDto;
import com.licenta.backend.entity.EmailRecipient;
import com.licenta.backend.entity.User;
import com.licenta.backend.repository.EmailRecipientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailRecipientService {
    private final EmailRecipientRepository emailRecipientRepository;

    public void addEmailRecipient(EmailRecipientDto recipient) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (emailRecipientRepository.existsEmailRecipientByUserAndEmail(user, recipient.getEmail())) {
            throw new RuntimeException("Email recipient already exists");
        }

        EmailRecipient emailRecipient = new EmailRecipient();
        emailRecipient.setUser(user);
        emailRecipient.setEmail(recipient.getEmail());

        emailRecipientRepository.save(emailRecipient);

    }

    public List<EmailRecipientDto> findAllEmailRecipientsByUser() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return emailRecipientRepository.findEmailRecipientByUser(user);
    }

    public void deleteEmailRecipient(String email) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        emailRecipientRepository.removeEmailRecipientByUserAndEmail(user, email);
    }
}
