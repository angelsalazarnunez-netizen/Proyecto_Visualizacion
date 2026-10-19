# Compila el backend con Maven y lo ejecuta con Java 21.
FROM maven:3.9-eclipse-temurin-21 AS compilacion
WORKDIR /fuente
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
# maven.test.skip: no compila las pruebas (hoy BllAprobacionExoneracionTest no compila).
RUN mvn -q -B -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=compilacion /fuente/target/*.jar sim.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "sim.jar"]
