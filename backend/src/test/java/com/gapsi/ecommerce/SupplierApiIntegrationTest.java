package com.gapsi.ecommerce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gapsi.ecommerce.dto.CreateSupplierRequest;
import com.gapsi.ecommerce.dto.SupplierDTO;
import com.gapsi.ecommerce.error.DuplicateSupplierException;
import com.gapsi.ecommerce.repository.SupplierRepository;
import com.gapsi.ecommerce.service.SupplierService;
import com.gapsi.ecommerce.validation.UniqueNameValidationStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:api-tests;DB_CLOSE_ON_EXIT=FALSE",
        "gapsi.seed.enabled=false",
        "gapsi.app.welcome-message=Hola de prueba",
        "gapsi.app.version=9.8.7",
        "gapsi.app.candidate-image=/assets/prueba.png"
})
@AutoConfigureMockMvc
class SupplierApiIntegrationTest {

    private static final String CREATE_MUTATION =
            "mutation($input: CreateSupplierInput!) { "
                    + "createSupplier(input: $input) { id nombre razonSocial direccion fechaCreacion } }";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private SupplierService supplierService;

    @SpyBean
    private UniqueNameValidationStrategy validationStrategy;

    @BeforeEach
    void clearSuppliers() {
        supplierRepository.deleteAll();
    }

    @Test
    void infoUsesConfiguredValues() throws Exception {
        mockMvc.perform(get("/api/info"))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"welcomeMessage\":\"Hola de prueba\","
                        + "\"version\":\"9.8.7\",\"candidateImage\":\"/assets/prueba.png\"}", true));
    }

    @Test
    void createsAndRejectsDuplicateNamesIgnoringCaseAndAllSpaces() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supplierJson("  Acme Servicios  ")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombre").value("Acme Servicios"))
                .andExpect(jsonPath("$.razonSocial").value("Razón Social, S.A."))
                .andExpect(jsonPath("$.direccion").value("Av. Reforma 100"))
                .andExpect(jsonPath("$.fechaCreacion").isString())
                .andExpect(jsonPath("$.nombreNormalizado").doesNotExist())
                .andReturn();

        JsonNode created = readResponse(result);
        assertThat(LocalDateTime.parse(created.get("fechaCreacion").asText())).isNotNull();

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supplierJson("a c M e\u00a0Se R V i c I o S")))
                .andExpect(status().isConflict())
                .andExpect(content().json(
                        "{\"error\":\"El proveedor con ese nombre ya existe en la lista.\"}", true));

        assertThat(supplierRepository.count()).isEqualTo(1);
    }

    @Test
    void validatesBodiesParametersAndMissingSuppliers() throws Exception {
        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supplierJson(" ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("El nombre es obligatorio."));

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supplierJson(" \u00a0\t ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("El nombre es obligatorio."));

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSupplierRequest("Válido", " ", "Dirección"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("La razón social es obligatoria."));

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSupplierRequest("Válido", "\u00a0", "Dirección"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("La razón social es obligatoria."));
        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSupplierRequest("Válido", "Empresa", "\u00a0"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("La dirección es obligatoria."));

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("El cuerpo de la solicitud no es válido."));

        mockMvc.perform(get("/api/suppliers").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("La página debe ser mayor o igual a 0."));
        mockMvc.perform(get("/api/suppliers").param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("El tamaño de página debe ser mayor que 0."));
        mockMvc.perform(get("/api/suppliers").param("page", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
        mockMvc.perform(delete("/api/suppliers/no-es-un-id"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
        mockMvc.perform(delete("/api/suppliers/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No se encontró el proveedor con id 99999."));
    }

    @Test
    void paginatesAndDeletesThroughRest() throws Exception {
        SupplierDTO first = supplierService.create(request("Primer proveedor"));
        supplierService.create(request("Segundo proveedor"));
        SupplierDTO third = supplierService.create(request("Tercer proveedor"));

        mockMvc.perform(get("/api/suppliers").param("page", "1").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id").value(third.getId().intValue()))
                .andExpect(jsonPath("$.number").value(1))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.last").value(true));

        mockMvc.perform(delete("/api/suppliers/{id}", first.getId()))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
        mockMvc.perform(delete("/api/suppliers/{id}", first.getId()))
                .andExpect(status().isNotFound());
        assertThat(supplierRepository.count()).isEqualTo(2);
    }

    @Test
    void graphqlSharesDataValidationPaginationAndDeletionWithRest() throws Exception {
        MvcResult creation = graphql(CREATE_MUTATION, Map.of("input", request("Graph Proveedor")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.data.createSupplier.nombre").value("Graph Proveedor"))
                .andExpect(jsonPath("$.data.createSupplier.fechaCreacion").isString())
                .andReturn();
        JsonNode created = readResponse(creation).path("data").path("createSupplier");
        String id = created.path("id").asText();
        assertThat(LocalDateTime.parse(created.path("fechaCreacion").asText())).isNotNull();

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supplierJson("g r a p h proveedor")))
                .andExpect(status().isConflict());
        graphql(CREATE_MUTATION, Map.of("input", request("GRAPH\tproveedor")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors[0].message")
                        .value("El proveedor con ese nombre ya existe en la lista."))
                .andExpect(jsonPath("$.errors[0].extensions.code").value("CONFLICT"));

        String query = "query($page: Int, $size: Int) { suppliers(page: $page, size: $size) { "
                + "content { id nombre fechaCreacion } number size numberOfElements totalElements "
                + "totalPages first last empty } }";
        graphql(query, Map.of("page", 0, "size", 10))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.data.suppliers.content", hasSize(1)))
                .andExpect(jsonPath("$.data.suppliers.content[0].id").value(id))
                .andExpect(jsonPath("$.data.suppliers.number").value(0))
                .andExpect(jsonPath("$.data.suppliers.totalElements").value(1))
                .andExpect(jsonPath("$.data.suppliers.first").value(true))
                .andExpect(jsonPath("$.data.suppliers.last").value(true))
                .andExpect(jsonPath("$.data.suppliers.empty").value(false));

        graphql("mutation($id: ID!) { deleteSupplier(id: $id) }", Map.of("id", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deleteSupplier").value(true));
        mockMvc.perform(get("/api/suppliers"))
                .andExpect(jsonPath("$.totalElements").value(0));
        graphql("mutation($id: ID!) { deleteSupplier(id: $id) }", Map.of("id", id))
                .andExpect(jsonPath("$.errors[0].extensions.code").value("NOT_FOUND"));
    }

    @Test
    void graphqlReportsInvalidInputAndPagination() throws Exception {
        graphql(CREATE_MUTATION, Map.of("input", request(" ")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors[0].message").value("El nombre es obligatorio."))
                .andExpect(jsonPath("$.errors[0].extensions.code").value("BAD_REQUEST"));

        graphql("{ suppliers(page: -1) { totalElements } }", Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors[0].message").value("La página debe ser mayor o igual a 0."))
                .andExpect(jsonPath("$.errors[0].extensions.code").value("BAD_REQUEST"));

        graphql("mutation($id: ID!) { deleteSupplier(id: $id) }", Map.of("id", "no-numérico"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors[0].message")
                        .value("El identificador del proveedor no es válido."))
                .andExpect(jsonPath("$.errors[0].extensions.code").value("BAD_REQUEST"));
    }

    @Test
    void corsCoversRestAndGraphqlForBothConfiguredOrigins() throws Exception {
        mockMvc.perform(options("/api/suppliers")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        mockMvc.perform(options("/graphql")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mockMvc.perform(options("/api/info")
                        .header("Origin", "http://example.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void openApiDescribesRestEndpoints() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/info'].get").exists())
                .andExpect(jsonPath("$.paths['/api/suppliers'].get").exists())
                .andExpect(jsonPath("$.paths['/api/suppliers'].post").exists())
                .andExpect(jsonPath("$.paths['/api/suppliers/{id}'].delete").exists());
    }

    @Test
    void databaseConstraintRejectsConcurrentDuplicateCreation() throws Exception {
        CountDownLatch bothValidated = new CountDownLatch(2);
        doAnswer(invocation -> {
            invocation.callRealMethod();
            bothValidated.countDown();
            if (!bothValidated.await(10, TimeUnit.SECONDS)) {
                throw new IllegalStateException("Las dos solicitudes no alcanzaron la validación.");
            }
            return null;
        }).when(validationStrategy).validate(anyString());

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<SupplierDTO> first = executor.submit(() -> supplierService.create(request("Simultáneo")));
            Future<SupplierDTO> second = executor.submit(() -> supplierService.create(request("simul táneo")));
            int successes = 0;
            int conflicts = 0;
            for (Future<SupplierDTO> future : Arrays.asList(first, second)) {
                try {
                    assertThat(future.get(20, TimeUnit.SECONDS)).isNotNull();
                    successes++;
                } catch (ExecutionException exception) {
                    assertThat(exception.getCause()).isInstanceOf(DuplicateSupplierException.class);
                    conflicts++;
                }
            }
            assertThat(successes).isEqualTo(1);
            assertThat(conflicts).isEqualTo(1);
            assertThat(supplierRepository.count()).isEqualTo(1);
        } finally {
            executor.shutdownNow();
            assertThat(executor.awaitTermination(5, TimeUnit.SECONDS)).isTrue();
        }
    }

    private CreateSupplierRequest request(String nombre) {
        return new CreateSupplierRequest(nombre, "Razón Social, S.A.", "Av. Reforma 100");
    }

    private String supplierJson(String nombre) throws Exception {
        return objectMapper.writeValueAsString(request(nombre));
    }

    private ResultActions graphql(String query, Map<String, ?> variables) throws Exception {
        MvcResult result = mockMvc.perform(post("/graphql")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("query", query, "variables", variables))))
                .andExpect(MockMvcResultMatchers.request().asyncStarted())
                .andReturn();
        return mockMvc.perform(asyncDispatch(result));
    }

    private JsonNode readResponse(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
    }
}
