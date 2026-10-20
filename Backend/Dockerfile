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
# PDF de los expedientes de prueba (script 18). Al arrancar se copian a ./documentos sin
# reemplazar los que ya existan, así también llegan a un volumen montado en /app/documentos.
COPY documentos-pruebas /app/documentos-pruebas
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "mkdir -p documentos; cp -r --update=none documentos-pruebas/. documentos/; exec java -jar sim.jar"]
