package com.gapsi.ecommerce;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "spring.datasource.url=jdbc:h2:mem:java11-http-tests;DB_CLOSE_ON_EXIT=FALSE")
class Java11HttpIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void servesRestEndpointsOverHttpOnJava11() {
        assertThat(Runtime.version().feature()).isEqualTo(11);

        ResponseEntity<JsonNode> info = restTemplate.getForEntity("/api/info", JsonNode.class);
        assertThat(info.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(info.getBody()).isNotNull();
        assertThat(info.getBody().path("welcomeMessage").asText()).isEqualTo("Bienvenido Candidato 01");
        assertThat(info.getBody().path("version").asText()).isEqualTo("0.0.1");

        ResponseEntity<JsonNode> suppliers = restTemplate.getForEntity("/api/suppliers", JsonNode.class);
        assertThat(suppliers.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(suppliers.getBody()).isNotNull();
        assertThat(suppliers.getBody().path("totalElements").asInt()).isEqualTo(35);
        assertThat(suppliers.getBody().path("content").size()).isEqualTo(10);
    }
}
