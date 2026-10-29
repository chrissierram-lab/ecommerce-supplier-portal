package com.gapsi.ecommerce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.stream.Collectors;

import com.gapsi.ecommerce.model.Supplier;
import com.gapsi.ecommerce.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:seed-tests;DB_CLOSE_ON_EXIT=FALSE")
@AutoConfigureMockMvc
class SeedDataIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SupplierRepository supplierRepository;

    @Test
    void defaultInfoMatchesTheRequiredResponse() throws Exception {
        mockMvc.perform(get("/api/info"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"welcomeMessage\":\"Bienvenido Candidato 01\","
                        + "\"version\":\"0.0.1\",\"candidateImage\":\"/assets/candidate.png\"}", true));
    }

    @Test
    void seedsExactlyThirtyFiveSuppliersAndPaginatesThem() throws Exception {
        List<Supplier> suppliers = supplierRepository.findAll();
        assertThat(suppliers).hasSize(35);
        assertThat(suppliers.stream().map(Supplier::getNombreNormalizado).collect(Collectors.toSet()))
                .hasSize(35);
        assertThat(suppliers).allSatisfy(supplier -> {
            assertThat(supplier.getId()).isNotNull();
            assertThat(supplier.getNombre()).isNotBlank();
            assertThat(supplier.getRazonSocial()).isNotBlank();
            assertThat(supplier.getDireccion()).isNotBlank();
            assertThat(supplier.getFechaCreacion()).isNotNull();
        });

        mockMvc.perform(get("/api/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(10)))
                .andExpect(jsonPath("$.content[0].nombre").value("Abarrotes La Esperanza"))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(35))
                .andExpect(jsonPath("$.totalPages").value(4))
                .andExpect(jsonPath("$.first").value(true));

        mockMvc.perform(get("/api/suppliers").param("page", "3").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.number").value(3))
                .andExpect(jsonPath("$.totalElements").value(35))
                .andExpect(jsonPath("$.last").value(true));

        MvcResult graphqlResult = mockMvc.perform(post("/graphql")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"{ suppliers { content { id } number size totalElements totalPages } }\"}"))
                .andExpect(request().asyncStarted())
                .andReturn();
        mockMvc.perform(asyncDispatch(graphqlResult))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.data.suppliers.content", hasSize(10)))
                .andExpect(jsonPath("$.data.suppliers.number").value(0))
                .andExpect(jsonPath("$.data.suppliers.size").value(10))
                .andExpect(jsonPath("$.data.suppliers.totalElements").value(35))
                .andExpect(jsonPath("$.data.suppliers.totalPages").value(4));
    }
}
