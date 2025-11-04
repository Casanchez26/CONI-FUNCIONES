package controlador;

import com.google.gson.Gson;
import dao.ActaDAO;
import modelo.ActaVO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@WebServlet("/ActasServlet")
public class ActasServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse response) throws ServletException, IOException {
        // Permitir CORS
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        try {
        BufferedReader reader = req.getReader();
        Gson gson = new Gson();
        ActaVO acta = gson.fromJson(reader, ActaVO.class);

        String fecha = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        acta.setFecha(fecha);

        String rutaPdf = "pdfs/Acta_" + acta.getCedula() + ".pdf";

        ActaDAO dao = new ActaDAO();
        boolean resultado = dao.insertarActa(acta, rutaPdf);

        if (resultado) {
            dao.actualizarEstadoEquipos(acta.getN_inventario(), "asignado");
            response.setContentType("application/json");
            response.getWriter().write("{\"mensaje\": \"Acta registrada correctamente\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"mensaje\": \"Error al registrar el acta\"}");
        }
    } catch (Exception e) { // <--- INICIO DEL BLOQUE CATCH
        e.printStackTrace(System.err); // Esto imprimirá la pila de la excepción en la consola de Tomcat
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setContentType("application/json");
        response.getWriter().write("{\"mensaje\": \"Error interno del servidor: " + e.getMessage() + "\"}");
    }
}

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        String cedula = request.getParameter("cedula");
        response.setContentType("application/json");
        ActaDAO dao = new ActaDAO();

        try {
            List<ActaVO> actas = dao.consultarPorCedula(cedula);

            Gson gson = new Gson();
            String json = gson.toJson(actas);
            response.getWriter().write(json);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"mensaje\":\"Error al consultar acta\"}");
        }
    }

}
