import Button from 'react-bootstrap/Button';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import globos from "../images/globosguirnalda.jpg";
import gift from "../images/gift.png";
import { Link } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

const Landing = () => {
    const [cookies] = useCookies(['watk']);
    let navigate = useNavigate();

    useEffect(() => {
        if (cookies["token"]) {
            navigate("/home", { replace: true })
        }
    }, [cookies, navigate]);

    return (
        <div>
            <div className="bgImageLanding">
                <div className="centerContainer" style={{ padding: "0 12px" }} >
                    <img className="imageLogo" src={gift} alt="" />
                    <div style={{ color: "white" }}>
                        <h2>Hola, somos <strong>Workabout</strong>, la empresa de intercambio y gestión de regalos.</h2>
                        <p>Hacemos que tus regalos esten al alcance de tus sueños, ¡olvida las desagradables sorpresas y sonrisas fingidas al recibir un paquete de chocolates comprado afuera del metro!.</p>
                    </div>
                    <Row style={{ textAlign: "center", margin: "auto", width: "50%" }}>
                        <Col xs={12} sm={6}>
                            <Link to="/login">
                                <Button className="actionBtn">Iniciar sesion</Button>
                            </Link>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Link to="/register">
                                <Button className="actionBtn">Registrarse</Button>
                            </Link>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="centerContainer">
                <img className="imageBalloons" src={globos} alt="" />
                <div style={{ margin: "12px" }}>
                    <p>Contacta con tus amigos y personas que vayas a realizar un intercambio, obten buenos momentos y recibe lo que siempre quisiste.</p>
                </div>
            </div>
        </div>

    )
}

export default Landing;