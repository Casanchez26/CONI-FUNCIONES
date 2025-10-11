package controlador;

import dao.UsuarioDAO;
import modelo.Usuario;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import org.json.JSONObject;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    @Override // @Override es una anotación que indica que este método está sobrescribiendo un método de la clase padre (HttpServlet).
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Configuramos la respuesta para que sea en formato JSON y use la codificación UTF-8.
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        JSONObject jsonResponse = new JSONObject();

        try {
            // Leemos el cuerpo de la solicitud (Request Body)
            // StringBuilder es una clase que nos ayuda a construir strings de forma eficiente.
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            String jsonString = sb.toString();
            JSONObject jsonRequest = new JSONObject(jsonString);

            // --- CAMBIO CLAVE 1: Solo extraemos el username y password ---
            String username = jsonRequest.getString("username");
            String password = jsonRequest.getString("password");

            // DAO (Data Access Object) es un patrón de diseño.
            // Es una clase que se encarga de todo lo relacionado con la base de datos,
            // como buscar, guardar o actualizar información.
            UsuarioDAO dao = new UsuarioDAO();
            // Llamamos al método `validar` de tu DAO para verificar las credenciales.
            Usuario usuario = dao.validar(username, password);

            // --- CAMBIO CLAVE 2: Validamos solo la existencia del usuario ---
            // La condición ahora solo verifica si el objeto 'usuario' no es nulo.
            // Esto significa que se encontró un usuario con esas credenciales.
            if (usuario != null) {
                
                // Si el usuario existe, creamos una sesión para mantenerlo autenticado.
                // HttpSession es una clase para manejar sesiones de usuario.
                HttpSession session = request.getSession(true);
                session.setAttribute("idUsuario", usuario.getId());
                
                // Obtenemos el rol del usuario encontrado en la base de datos
                session.setAttribute("rolAutenticacion", usuario.getRol());
                session.setAttribute("cargoEmpleado", usuario.getCargoEmpleado()); // Aquí se define el cargo del empleado encontrado
                session.setAttribute("username", usuario.getUsername());

                // Preparamos la respuesta JSON para el frontend
                jsonResponse.put("success", true);
                jsonResponse.put("message", "Login exitoso");
                
                // Creamos un objeto JSON con los datos del usuario para enviarlo al frontend
                JSONObject userData = new JSONObject();
                userData.put("id", usuario.getId());
                userData.put("rolAutenticacion", usuario.getRol()); // Rol de la tabla usuario
                userData.put("cargoEmpleado", usuario.getCargoEmpleado()); // cargo de la tabla empleados
                userData.put("username", usuario.getUsername());
                jsonResponse.put("user", userData);

                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                // Si no se encontró el usuario, enviamos una respuesta de error.
                jsonResponse.put("success", false);
                jsonResponse.put("message", "Usuario, contraseña o rol incorrectos.");
                // SC_UNAUTHORIZED (401) es el código HTTP para "no autorizado".
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
            
        // Manejo de errores
        // org.json.JSONException: Error si el JSON de la solicitud es incorrecto
        } catch (org.json.JSONException e) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Formato de solicitud JSON inválido o campos faltantes.");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            e.printStackTrace();

        } catch (Exception e) {
            jsonResponse.put("success", false);
            jsonResponse.put("message", "Error interno del servidor: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            //Esto imprime la traza de la pila del error en la consola del servidor (no en el navegador). 
            //La traza de la pila es una lista detallada de dónde y por qué se produjo el error. 
            //Es una herramienta indispensable para que tú, como desarrollador, puedas diagnosticar y solucionar el problema.
            e.printStackTrace();

        } finally {
            // Finalmente, enviamos la respuesta JSON al frontend y cerramos el flujo de salida.
            out.print(jsonResponse.toString());
            out.flush();
        }
    }

}
