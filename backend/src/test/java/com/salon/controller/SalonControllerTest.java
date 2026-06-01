package com.salon.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salon.dto.LoginRequest;
import com.salon.dto.SignUpRequest;
import com.salon.dto.VisitRequest;
import com.salon.model.SalonService;
import com.salon.model.User;
import com.salon.model.Visit;
import com.salon.repository.ServiceRepository;
import com.salon.repository.UserRepository;
import com.salon.repository.VisitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class SalonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private VisitRepository visitRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        visitRepository.deleteAll();
        userRepository.deleteAll();
        // Keep standard seeded services, but clear custom ones if any
    }

    @Test
    public void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/services/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }

    @Test
    public void testUserSignupAndLogin() throws Exception {
        SignUpRequest signup = new SignUpRequest("priya_shah", "mysecretpassword", "Priya Shah", "priya@livssalon.com", "STAFF");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("priya_shah")))
                .andExpect(jsonPath("$.displayName", is("Priya Shah")))
                .andExpect(jsonPath("$.email", is("priya@livssalon.com")))
                .andExpect(jsonPath("$.role", is("STAFF")));

        // Duplicate signup should fail
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Username already exists. Try another."));

        // Login with valid credentials
        LoginRequest login = new LoginRequest("priya_shah", "mysecretpassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("priya_shah")))
                .andExpect(jsonPath("$.role", is("STAFF")));

        // Login with invalid credentials
        LoginRequest invalidLogin = new LoginRequest("priya_shah", "wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password. Please Sign Up first!"));
    }

    @Test
    public void testGetActiveServices() throws Exception {
        // Assert that the 14 Indian services are pre-loaded
        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(14))))
                .andExpect(jsonPath("$[0].name", is("Haircut")))
                .andExpect(jsonPath("$[0].price", is(399.0)));
    }

    @Test
    public void testCreateAndUpdateService() throws Exception {
        SalonService newService = new SalonService(null, "De-tan Glow Facial", 1199.0, "Skin Care", "Brightening cleanup.", true);

        String responseContent = mockMvc.perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newService)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("De-tan Glow Facial")))
                .andExpect(jsonPath("$.price", is(1199.0)))
                .andReturn().getResponse().getContentAsString();

        SalonService created = objectMapper.readValue(responseContent, SalonService.class);
        assertNotNull(created.getId());

        // Update service
        created.setPrice(1299.0);
        created.setDescription("Extra bright de-tan pack.");

        mockMvc.perform(put("/api/services/" + created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(created)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price", is(1299.0)))
                .andExpect(jsonPath("$.description", is("Extra bright de-tan pack.")));

        // Clean up
        serviceRepository.delete(created);
    }

    @Test
    public void testDeactivateService() throws Exception {
        SalonService newService = new SalonService(null, "Temporary Wax", 499.0, "Grooming", "Test deactivation.", true);
        SalonService saved = serviceRepository.save(newService);

        mockMvc.perform(delete("/api/services/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("Service deactivated successfully."));

        // Retrieve service and assert it is inactive
        SalonService fetched = serviceRepository.findById(saved.getId()).orElseThrow();
        assertFalse(fetched.getActive());

        serviceRepository.delete(fetched);
    }

    @Test
    public void testCreateVisitWithCommission() throws Exception {
        VisitRequest visitRequest = new VisitRequest(
                "Ananya Sen",
                Instant.now(),
                "priya_shah",
                "Priya Shah",
                2500.0, // Total
                250.0,  // Commission (passed, but controller will auto-enforce 10% calculated value)
                "Hair Spa, Pedicure",
                "Likes soft pressure massage."
        );

        mockMvc.perform(post("/api/visits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(visitRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerName", is("Ananya Sen")))
                .andExpect(jsonPath("$.staffUsername", is("priya_shah")))
                .andExpect(jsonPath("$.totalAmount", is(2500.0)))
                .andExpect(jsonPath("$.commissionAmount", is(250.0))) // Auto calculated/enforced 10%
                .andExpect(jsonPath("$.services", is("Hair Spa, Pedicure")));

        List<Visit> visits = visitRepository.findAll();
        assertEquals(1, visits.size());
        assertEquals("Ananya Sen", visits.get(0).getCustomerName());
        assertEquals(250.0, visits.get(0).getCommissionAmount());
    }
}
