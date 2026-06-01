package com.salon.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 4, message = "Password must be at least 4 characters")
    private String password;

    @NotBlank(message = "Full Name is required")
    @Size(min = 2, max = 100, message = "Full Name must be between 2 and 100 characters")
    private String displayName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email; // Dynamically added signup email field

    @NotBlank(message = "Role is required")
    private String role; // "ADMIN" or "STAFF"
}
