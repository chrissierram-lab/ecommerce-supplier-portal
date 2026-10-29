// PATRÓN DE DISEÑO 1: BUILDER / SINGLETON
// Spring crea un único mapper; Builder construye respuestas inmutables sin exponer entidades.
package com.gapsi.ecommerce.mapping;

import com.gapsi.ecommerce.config.AppProperties;
import com.gapsi.ecommerce.dto.ApplicationInfoDTO;
import com.gapsi.ecommerce.dto.SupplierDTO;
import com.gapsi.ecommerce.model.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicationMapper {

    private final AppProperties properties;

    public ApplicationInfoDTO applicationInfo() {
        return ApplicationInfoDTO.builder()
                .welcomeMessage(properties.getWelcomeMessage())
                .version(properties.getVersion())
                .candidateImage(properties.getCandidateImage())
                .build();
    }

    public SupplierDTO toSupplierDto(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .nombre(supplier.getNombre())
                .razonSocial(supplier.getRazonSocial())
                .direccion(supplier.getDireccion())
                .fechaCreacion(supplier.getFechaCreacion())
                .build();
    }
}
