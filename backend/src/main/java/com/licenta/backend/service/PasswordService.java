package com.licenta.backend.service;

import com.licenta.backend.client.EncryptionKeyClient;
import com.licenta.backend.entity.Password;
import com.licenta.backend.entity.Shard;
import com.licenta.backend.entity.User;
import com.licenta.backend.model.EncryptionKey;
import com.licenta.backend.model.PasswordRequest;
import com.licenta.backend.model.PasswordResponse;
import com.licenta.backend.repository.PasswordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordService {
    private final PasswordRepository passwordRepository;
    private final EncryptionKeyClient encryptionKeyClient;

    @Transactional
    public void addPassword(PasswordRequest passwordRequest) {
        Password password = new Password();
        List<Shard> shards = new ArrayList<>();

        for (String s : passwordRequest.getShards()) {
            Shard shard = new Shard();
            shard.setShard(s);
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

        String mockKey = "abcdefgh";
        encryptionKeyClient.save(new EncryptionKey(mockKey, password.getId()));
    }

    public PasswordResponse getPassword(long passwordId) {
        Password password = passwordRepository.findById(passwordId)
                .orElseThrow(() -> new RuntimeException("Password not found"));

        String keyString = encryptionKeyClient.getEncryptionKey(Long.toString(passwordId));
        EncryptionKey key = new EncryptionKey(keyString, passwordId);

        password.setEncryptionKey(key);

        return new PasswordResponse(
                password.getLabel(),
                password.getShards().stream().map(Shard::getShard).toList(),
                password.getShardsNo() / 2 + 1
        );
    }
}
