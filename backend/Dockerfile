# Usamos una imagen oficial de Tomcat que ya incluye un servidor web
FROM tomcat:9.0-jre17-temurin

# Copiamos el archivo .war a la carpeta de despliegue de Tomcat
COPY dist/CONI1.0.war /usr/local/tomcat/webapps/coni.war

# El puerto por defecto de Tomcat es el 8080
EXPOSE 8080