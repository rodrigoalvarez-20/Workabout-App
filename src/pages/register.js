import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
import ballons from "../images/globosguirnalda.jpg";
import CustomNavbar from "../components/navbar";

const Register = () => {

    const [name, setName] = useState("");
    const [alias, setAlias] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPwd] = useState("");
    const [cpassword, setcPwd] = useState("");
    const [isLoading, setLoadingState] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [cookies] = useCookies(['watk']);
    let navigate = useNavigate();

    const navTags = [
        {
            "name": "Inicio",
            "path": "/"
        },
        {
            "name": "Iniciar sesión",
            "path": "/login"
        }
    ]

    useEffect(() => {
        if (cookies["token"]) {
            navigate("/home", { replace: true })
        }
    }, [cookies, navigate]);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const submitForm = (e) => {
        e.preventDefault();
        setLoadingState(true);
        if (email.trim() === "" || password.trim() === "" || name.trim() === "" || alias.trim() === "" || cpassword.trim() === "") {
            toast.warn("No puede dejar los campos vacíos");
            setLoadingState(false);
        } else if (password !== cpassword) {
            toast.error("Las contraseñas no coinciden");
            setLoadingState(false);
        } else {
            axios.post("/api/users/register", { name, alias, email, password }).then(r => {
                //console.log(r.data);
                const message = r.data.message;

                toast.success(message);
                setIsWaiting(true);

                sleep(5000).then(() => navigate("/", { replace: true }))

            }).catch(e => {
                if (e.response.data.error) {
                    toast.error(e.response.data.error);
                } else {
                    toast.error("Ha ocurrido un error al realizar la peticion")
                }
            }).finally(() => setLoadingState(false));
        }
    }

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false} />

            <CustomNavbar links={navTags} />

            <Container className="centerContainer" style={{ margin: "5% auto" }}>
                <h2>Registro</h2>
                <hr className="hrStyle" />
                <p style={{ color: "gray" }}>Registrate en nuestra plataforma para poder utilizar nuestros servicios, rellena el siguiente formulario.</p>

                <img src={ballons} className="imageBalloons" alt="ballons" />

                <Card border="dark" style={{ width: "80%", margin: "24px auto", textAlign: "start" }}>
                    <Card.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" placeholder="Jane Doe" onChange={(e) => setName(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Alias</Form.Label>
                                <Form.Control type="text" placeholder="janeDoe02" onChange={(e) => setAlias(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Correo electronico</Form.Label>
                                <Form.Control type="email" placeholder="jane@example.com" onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control type="password" placeholder="********" onChange={(e) => setPwd(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Confirmar contraseña</Form.Label>
                                <Form.Control type="password" placeholder="********" onChange={(e) => setcPwd(e.target.value)} />
                            </Form.Group>

                            {
                                isLoading ? <Spinner animation="grow" style={{ display: "flex", margin: "auto" }} /> : <Button variant="primary" disabled={isWaiting} type="submit" onClick={submitForm}>
                                    Registrarse
                                </Button>
                            }

                        </Form>
                    </Card.Body>
                </Card>

            </Container>
        </div>
    )
}

export default Register;