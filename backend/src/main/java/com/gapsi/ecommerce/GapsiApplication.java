package com.gapsi.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GapsiApplication {

    public static void main(String[] args) {
        requireJava11(Runtime.version().feature());
        SpringApplication.run(GapsiApplication.class, args);
    }

    static void requireJava11(int version) {
        if (version != 11) {
            throw new IllegalStateException(
                    "Este backend requiere Java 11, pero se detectó Java " + version + ".");
        }
    }
}
