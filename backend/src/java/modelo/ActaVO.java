package modelo;

import java.util.List;

public class ActaVO {
    private int id_acta;
    private String nombre_completo;
    private String cedula;
    private List<String> n_inventario;
    private String fecha;

    public ActaVO() {}

    public ActaVO(int id_acta, String nombre_completo, String cedula, List<String> n_inventario, String fecha) {
        this.id_acta = id_acta;
        this.nombre_completo = nombre_completo;
        this.cedula = cedula;
        this.n_inventario = n_inventario;
        this.fecha = fecha;
    }

    public int getId_acta() {
        return id_acta;
    }

    public void setId_acta(int id_acta) {
        this.id_acta = id_acta;
    }

    public String getNombre_completo() {
        return nombre_completo;
    }

    public void setNombre_completo(String nombre_completo) {
        this.nombre_completo = nombre_completo;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public List<String> getN_inventario() {
        return n_inventario;
    }

    public void setN_inventario(List<String> n_inventario) {
        this.n_inventario = n_inventario;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
}
