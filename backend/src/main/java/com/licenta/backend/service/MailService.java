package com.licenta.backend.service;

import com.licenta.backend.dto.MailDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Async
    public void sendSimpleMail(MailDetails mailDetails) {

        SimpleMailMessage mailMessage
                = new SimpleMailMessage();

        mailMessage.setFrom(sender);
        mailMessage.setTo(mailDetails.getRecipient());
        mailMessage.setText(mailDetails.getBody());
        mailMessage.setSubject(mailDetails.getSubject());

        mailSender.send(mailMessage);
    }
}
