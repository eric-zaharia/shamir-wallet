package com.licenta.backend.service;

import com.licenta.backend.client.EncryptionKeyClient;
import com.licenta.backend.entity.Password;
import com.licenta.backend.entity.Shard;
import com.licenta.backend.entity.User;
import com.licenta.backend.dto.*;
import com.licenta.backend.repository.PasswordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordService {
    private final PasswordRepository passwordRepository;
    private final EncryptionKeyClient encryptionKeyClient;
    private final MailService mailService;

    public List<PublicPasswordResponse> getAllPasswordsByUser() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return passwordRepository.findAllByUser(user).stream()
                .map(pass -> new PublicPasswordResponse(pass.getId(), pass.getLabel()))
                .toList();
    }

    @Transactional
    public void addPassword(PasswordRequest passwordRequest) {
        if (passwordRequest.getSelfCustodyShardsNo() > passwordRequest.getShardsNo()) {
            throw new RuntimeException("Invalid number of shards");
        }

        if (passwordRequest.getSelfCustodyShardsNo() > 0 &&
                (passwordRequest.getMailRecipients().isEmpty()
                        || passwordRequest.getMailRecipients().size() < passwordRequest.getSelfCustodyShardsNo())) {
            throw new RuntimeException("Not enough mail recipients");
        }

        Password password = new Password();
        List<Shard> shards = new ArrayList<>();
        String base64Key;
        SecretKey secretKey;

        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(128);
            secretKey = keyGenerator.generateKey();
            base64Key = Base64.getEncoder().encodeToString(secretKey.getEncoded());

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        for (int i = 0; i < passwordRequest.getSelfCustodyShardsNo(); i++) {
            String shard = passwordRequest.getShards().removeFirst();
            this.sendShardMail(passwordRequest.getMailRecipients().removeFirst(), passwordRequest.getLabel() + " Shard", shard);
        }

        Cipher cipher;
        for (String s : passwordRequest.getShards()) {
            Shard shard = new Shard();
            String encryptedBase64;
            try {
                cipher = Cipher.getInstance("AES");
                cipher.init(Cipher.ENCRYPT_MODE, secretKey);
                byte[] encryptedBytes = cipher.doFinal(s.getBytes(StandardCharsets.UTF_8));
                encryptedBase64 = Base64.getEncoder().encodeToString(encryptedBytes);
            } catch (IllegalBlockSizeException | BadPaddingException | InvalidKeyException | NoSuchPaddingException |
                     NoSuchAlgorithmException e) {
                throw new RuntimeException(e);
            }
            shard.setShard(encryptedBase64);
            shard.setPassword(password);
            shards.add(shard);
        }

        password.setLabel(passwordRequest.getLabel());
        password.setShards(shards);
        password.setShardsNo(passwordRequest.getShardsNo());
        password.setSelfCustodyShardsNo(passwordRequest.getSelfCustodyShardsNo());

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        password.setUser(user);

        passwordRepository.save(password);

        if (passwordRequest.getSelfCustodyShardsNo() != passwordRequest.getShardsNo()) {
            encryptionKeyClient.save(new EncryptionKey(base64Key, password.getId()));
        }
    }

    public PasswordResponse getPassword(long passwordId) {
        Password password = passwordRepository.findById(passwordId)
                .orElseThrow(() -> new RuntimeException("Password not found"));

        if (password.getSelfCustodyShardsNo() != password.getShardsNo()) {
            String keyString = encryptionKeyClient.getEncryptionKey(Long.toString(passwordId));
            byte[] decodedKey = Base64.getDecoder().decode(keyString);

            SecretKey secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");

            for (Shard shard : password.getShards()) {
                try {
                    Cipher cipher = Cipher.getInstance("AES");
                    cipher.init(Cipher.DECRYPT_MODE, secretKey);
                    byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(shard.getShard()));
                    shard.setShard(new String(decryptedBytes, StandardCharsets.UTF_8));
                } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException |
                         IllegalBlockSizeException | BadPaddingException e) {
                    throw new RuntimeException(e);
                }
            }
        }

        return new PasswordResponse(
                password.getLabel(),
                password.getShards().stream().map(Shard::getShard).toList(),
                password.getShardsNo() / 2 + 1
        );
    }

    @Transactional
    public void deletePassword(Long passwordId) {
        Password password = passwordRepository.findById(passwordId)
                .orElseThrow(() -> new RuntimeException("Password not found"));

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String label = password.getLabel();

        this.mailService.sendSimpleMail(new MailDetails(
                user.getEmail(),
                "Deleted password " + label,
                "Your password has been deleted!"
        ));

        passwordRepository.delete(password);
        passwordRepository.flush();

        if (password.getSelfCustodyShardsNo() != password.getShardsNo()) {
            encryptionKeyClient.deleteEncryptionKey(Long.toString(passwordId));
        }
    }

    private void sendShardMail(String recipient, String subject, String body) {
        MailDetails mailDetails = new MailDetails(recipient, subject, body);
        this.mailService.sendSimpleMail(mailDetails);
    }
}
