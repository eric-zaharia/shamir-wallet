package com.licenta.backend.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.SignatureVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.licenta.backend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.access.minutes}")
    private long JWT_ACCESS_MINUTES;

    public String extractUsername(String token) throws JWTDecodeException {
        try {
            return JWT.decode(token).getSubject();
        } catch (JWTDecodeException e) {
            throw new JWTDecodeException("Invalid JWT token");
        }
    }

    private String generateAccessToken(Map<String, Object> extraClaims, User userDetails) {
        return JWT.create()
                .withPayload(extraClaims)
                .withClaim("token_type", "access")
                .withClaim("name", userDetails.getFirstName() + " " + userDetails.getLastName())
                .withClaim("email", userDetails.getEmail())
                .withSubject(userDetails.getUsername())
                .withIssuedAt(new Date(System.currentTimeMillis()))
                .withExpiresAt(new Date(System.currentTimeMillis() + 1000 * 60 * JWT_ACCESS_MINUTES))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public String generateAccessToken(User userDetails) {
        return generateAccessToken(new HashMap<>(), userDetails);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) throws SignatureVerificationException, TokenExpiredException {
        try {
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(SECRET_KEY)).build();

            DecodedJWT decodedJWT = verifier.verify(token);
            String username = decodedJWT.getSubject();

            return username.equals(userDetails.getUsername())
                    && !isTokenExpired(token);
        } catch (SignatureVerificationException e) {
            throw new SignatureVerificationException(Algorithm.HMAC256(SECRET_KEY));
        }
    }

    public boolean isTokenExpired(String token) throws TokenExpiredException {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(SECRET_KEY)).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        Date expirationDate = decodedJWT.getExpiresAt();

        if (expirationDate.before(new Date())) {
            throw new TokenExpiredException("Expired JWT", expirationDate.toInstant());
        }

        return false;
    }
}
