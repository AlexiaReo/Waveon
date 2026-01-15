FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY gradlew build.gradle settings.gradle /app/
COPY gradle /app/gradle/

COPY src /app/src/

# copy audio folder (inside resources)
COPY src/main/resources/audio /app/audio/

RUN chmod +x gradlew

RUN ./gradlew build --no-daemon -x test

CMD ["java", "-jar", "build/libs/backend-0.0.1-SNAPSHOT.jar"]
