package com.licenta.backend.service;

import com.licenta.backend.dto.MailDetails;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import net.lingala.zip4j.io.outputstream.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.model.enums.CompressionMethod;
import net.lingala.zip4j.model.enums.EncryptionMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

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

    @Async
    public void sendEncryptedZip(String passwordName,
                                 String text,
                                 String password,
                                 String to) throws IOException, MessagingException {

        byte[] zipBytes = buildZip(text, password.toCharArray());

        MimeMessage mime = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, StandardCharsets.UTF_8.name());
        helper.setTo(to);
        helper.setSubject("Shard " + passwordName);
        helper.setText("Encrypted ZIP attached – use your selected password to open it.");

        ByteArrayDataSource ds = new ByteArrayDataSource(zipBytes, "application/zip");
        helper.addAttachment("shard.zip", ds);

        mailSender.send(mime);
    }

    private byte[] buildZip(String text, char[] pwd) throws IOException {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos, pwd)) {

            ZipParameters p = new ZipParameters();
            p.setFileNameInZip("shard.txt");
            p.setCompressionMethod(CompressionMethod.DEFLATE);
            p.setEncryptFiles(true);
            p.setEncryptionMethod(EncryptionMethod.ZIP_STANDARD);

            zos.putNextEntry(p);
            zos.write(text.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

}
