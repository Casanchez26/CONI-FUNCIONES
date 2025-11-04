package controlador;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import dao.ActaDAO;

@WebServlet("/DescargarPDFServlet")
public class DescargarPDFServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        String cedula = request.getParameter("cedula");
        ActaDAO dao = new ActaDAO();

        try {
            String ruta = dao.obtenerRutaPDFPorCedula(cedula);
            if (ruta != null) {
                File file = new File(ruta);
                if (file.exists()) {
                    response.setContentType("application/pdf");
                    response.setHeader("Content-Disposition", "attachment; filename=Acta_" + cedula + ".pdf");

                    try (FileInputStream fis = new FileInputStream(file); OutputStream os = response.getOutputStream()) {

                        byte[] buffer = new byte[4096];
                        int bytesRead;
                        while ((bytesRead = fis.read(buffer)) != -1) {
                            os.write(buffer, 0, bytesRead);
                        }
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("Archivo no encontrado.");
                }
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("Ruta de archivo no registrada.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error al descargar PDF.");
        }
    }
}
