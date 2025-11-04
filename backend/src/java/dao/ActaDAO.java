package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.sql.ResultSet;
import modelo.ActaVO;
import Conexion.Conexion;

public class ActaDAO {

    public boolean insertarActa(ActaVO acta, String rutaPdf) {
        String sql = "INSERT INTO actas (nombre_completo, cedula, n_inventario, fecha, ruta_pdf) VALUES (?, ?, ?, ?, ?)";

        try (Connection con = Conexion.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {

            String inventarios = String.join(",", acta.getN_inventario());

            ps.setString(1, acta.getNombre_completo());
            ps.setString(2, acta.getCedula());
            ps.setString(3, inventarios);
            ps.setString(4, acta.getFecha());
            ps.setString(5, rutaPdf);

            int filas = ps.executeUpdate();

            return filas > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public void actualizarEstadoEquipos(List<String> inventarios, String nuevoEstado) {
        String sql = "UPDATE equipos_perifericos SET estado = ? WHERE n_inventario = ?";

        try (Connection con = Conexion.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {

            for (String id : inventarios) {
                ps.setString(1, nuevoEstado);
                ps.setString(2, id);
                ps.executeUpdate();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public List<ActaVO> consultarPorCedula(String cedula) throws Exception {
        List<ActaVO> lista = new ArrayList<>();
        String sql = "SELECT * FROM actas WHERE cedula = ?";

        try (Connection con = Conexion.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, cedula);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                ActaVO acta = new ActaVO();
                acta.setId_acta(rs.getInt("id_acta"));
                acta.setNombre_completo(rs.getString("nombre_completo"));
                acta.setCedula(rs.getString("cedula"));
                acta.setFecha(rs.getString("fecha"));

                // Convertimos el texto de n_inventario (ej: EQ01,PER02) a lista
                String inventarioStr = rs.getString("n_inventario");
                if (inventarioStr != null && !inventarioStr.isEmpty()) {
                    List<String> inventarios = Arrays.asList(inventarioStr.split(","));
                    acta.setN_inventario(inventarios);
                }

                lista.add(acta);
            }
        }

        return lista;
    }

    public String obtenerRutaPDFPorCedula(String cedula) throws Exception {
        String ruta = null;
        String sql = "SELECT ruta_pdf FROM actas WHERE cedula = ? LIMIT 1";

        try (Connection con = Conexion.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, cedula);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                ruta = rs.getString("ruta_pdf");

            }
        }
        return ruta;
    }

}
