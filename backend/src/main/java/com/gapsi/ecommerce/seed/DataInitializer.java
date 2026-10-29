package com.gapsi.ecommerce.seed;

import java.util.List;

import com.gapsi.ecommerce.dto.CreateSupplierRequest;
import com.gapsi.ecommerce.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "gapsi.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SupplierService supplierService;

    @Override
    public void run(String... args) {
        List<CreateSupplierRequest> suppliers = List.of(
                new CreateSupplierRequest("Abarrotes La Esperanza", "Abarrotes La Esperanza, S.A. de C.V.", "Av. Juárez 125, Ciudad de México"),
                new CreateSupplierRequest("Aceites del Centro", "Aceites del Centro, S.A. de C.V.", "Calle Reforma 230, Querétaro"),
                new CreateSupplierRequest("Alimentos Sierra Verde", "Alimentos Sierra Verde, S. de R.L. de C.V.", "Av. Hidalgo 45, Puebla"),
                new CreateSupplierRequest("Artesanías del Bajío", "Artesanías del Bajío, S.A. de C.V.", "Calle Aldama 78, León"),
                new CreateSupplierRequest("Azúcares del Valle", "Azúcares del Valle, S.A. de C.V.", "Av. Independencia 190, Toluca"),
                new CreateSupplierRequest("Bebidas Río Claro", "Bebidas Río Claro, S.A. de C.V.", "Calle Morelos 64, Guadalajara"),
                new CreateSupplierRequest("Cafés Montaña Azul", "Cafés Montaña Azul, S. de R.L. de C.V.", "Av. Las Flores 312, Xalapa"),
                new CreateSupplierRequest("Carnes La Hacienda", "Carnes La Hacienda, S.A. de C.V.", "Calle Madero 102, Monterrey"),
                new CreateSupplierRequest("Cereales del Altiplano", "Cereales del Altiplano, S.A. de C.V.", "Av. Central 526, Pachuca"),
                new CreateSupplierRequest("Chocolates del Sol", "Chocolates del Sol, S. de R.L. de C.V.", "Calle Allende 84, Oaxaca"),
                new CreateSupplierRequest("Conservas La Huerta", "Conservas La Huerta, S.A. de C.V.", "Av. Universidad 420, Morelia"),
                new CreateSupplierRequest("Distribuidora El Roble", "Distribuidora El Roble, S.A. de C.V.", "Calle Roble 19, Aguascalientes"),
                new CreateSupplierRequest("Dulces Tradición", "Dulces Tradición, S. de R.L. de C.V.", "Calle Colón 167, Puebla"),
                new CreateSupplierRequest("Empaques del Pacífico", "Empaques del Pacífico, S.A. de C.V.", "Av. del Puerto 248, Mazatlán"),
                new CreateSupplierRequest("Especias La Cosecha", "Especias La Cosecha, S.A. de C.V.", "Calle Mercado 33, Mérida"),
                new CreateSupplierRequest("Frutas de Temporada", "Frutas de Temporada, S. de R.L. de C.V.", "Av. del Campo 76, Cuernavaca"),
                new CreateSupplierRequest("Granos San Miguel", "Granos San Miguel, S.A. de C.V.", "Calle San Miguel 415, Celaya"),
                new CreateSupplierRequest("Herramientas del Norte", "Herramientas del Norte, S.A. de C.V.", "Av. Industrial 920, Saltillo"),
                new CreateSupplierRequest("Higiene Nueva Vida", "Higiene Nueva Vida, S. de R.L. de C.V.", "Calle Salud 55, Ciudad de México"),
                new CreateSupplierRequest("Insumos La Estación", "Insumos La Estación, S.A. de C.V.", "Av. Ferrocarril 117, San Luis Potosí"),
                new CreateSupplierRequest("Jabones del Bosque", "Jabones del Bosque, S.A. de C.V.", "Calle Encino 200, Toluca"),
                new CreateSupplierRequest("Lácteos Santa Elena", "Lácteos Santa Elena, S. de R.L. de C.V.", "Av. Los Pinos 89, Chihuahua"),
                new CreateSupplierRequest("Limpieza Brisa", "Limpieza Brisa, S.A. de C.V.", "Calle Norte 146, Veracruz"),
                new CreateSupplierRequest("Maderas del Sur", "Maderas del Sur, S.A. de C.V.", "Av. Forestal 350, Tuxtla Gutiérrez"),
                new CreateSupplierRequest("Mieles del Campo", "Mieles del Campo, S. de R.L. de C.V.", "Calle Primavera 63, Campeche"),
                new CreateSupplierRequest("Molinos La Rivera", "Molinos La Rivera, S.A. de C.V.", "Av. Molino 281, Irapuato"),
                new CreateSupplierRequest("Papelería Horizonte", "Papelería Horizonte, S.A. de C.V.", "Calle Escolar 12, Guadalajara"),
                new CreateSupplierRequest("Panadería Los Trigos", "Panadería Los Trigos, S. de R.L. de C.V.", "Av. del Trigo 104, Querétaro"),
                new CreateSupplierRequest("Pescados Costa Azul", "Pescados Costa Azul, S.A. de C.V.", "Calle Marina 305, Ensenada"),
                new CreateSupplierRequest("Productos El Nopal", "Productos El Nopal, S.A. de C.V.", "Av. del Nopal 72, Ciudad de México"),
                new CreateSupplierRequest("Semillas Buen Surco", "Semillas Buen Surco, S. de R.L. de C.V.", "Calle Agricultura 41, Culiacán"),
                new CreateSupplierRequest("Servicios Logísticos del Centro", "Servicios Logísticos del Centro, S.A. de C.V.", "Av. Transporte 615, Querétaro"),
                new CreateSupplierRequest("Textiles Luna", "Textiles Luna, S.A. de C.V.", "Calle Industria Textil 98, Tlaxcala"),
                new CreateSupplierRequest("Verduras Tierra Fértil", "Verduras Tierra Fértil, S. de R.L. de C.V.", "Av. Huertos 137, Zamora"),
                new CreateSupplierRequest("Vinos Cosecha Antigua", "Vinos Cosecha Antigua, S.A. de C.V.", "Calle Viñedos 24, Ensenada")
        );
        suppliers.forEach(supplierService::create);
        log.info("Se cargaron {} proveedores de prueba.", suppliers.size());
    }
}
