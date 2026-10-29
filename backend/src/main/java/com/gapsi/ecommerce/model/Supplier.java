package com.gapsi.ecommerce.model;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "suppliers", uniqueConstraints = @UniqueConstraint(
        name = Supplier.UNIQUE_NAME_CONSTRAINT, columnNames = "nombre_normalizado"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Supplier {

    public static final String UNIQUE_NAME_CONSTRAINT = "uk_supplier_nombre_normalizado";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(name = "nombre_normalizado", nullable = false, length = 1024)
    private String nombreNormalizado;

    @Column(name = "razon_social", nullable = false, length = 255)
    private String razonSocial;

    @Column(nullable = false, length = 500)
    private String direccion;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    public Supplier(String nombre, String nombreNormalizado, String razonSocial, String direccion) {
        this.nombre = nombre;
        this.nombreNormalizado = nombreNormalizado;
        this.razonSocial = razonSocial;
        this.direccion = direccion;
    }

    @PrePersist
    private void assignCreationDate() {
        fechaCreacion = LocalDateTime.now();
    }
}
