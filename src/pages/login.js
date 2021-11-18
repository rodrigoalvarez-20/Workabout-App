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
import CustomNavbar from "../components/navbar";

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPwd] = useState("")
    const [isLoading, setLoadingState] = useState(false);
    const [cookies, setCookie] = useCookies(['watk']);
    let navigate = useNavigate();

    const navTags = [
        {
            "name": "Inicio",
            "path": "/"
        },
        {
            "name": "Registro",
            "path": "/register"
        }
    ]



    useEffect(() => {
        if (cookies["token"]) {
            navigate("/home", { replace: true })
        }
    }, [cookies, navigate]);


    const submitForm = (e) => {
        e.preventDefault();
        setLoadingState(true);
        if (email.trim() === "" || password.trim() === "") {
            toast.warn("No puede dejar los campos vacíos");
            setLoadingState(false);
        } else {
            axios.post("/api/users/login", { email, password }).then(r => {
                //console.log(r.data);
                const message = r.data.message;
                const tk = r.data.token;

                toast.success(message);

                setCookie("token", tk, { path: "/" });
                setCookie("email", email, { path: "/" });

                navigate("/home", { replace: true });

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
                <h2>Identificarse</h2>
                <hr className="hrStyle" />
                <p style={{ color: "gray" }}>Ingresa tu usuario y contraseña para poder administrar tus intercambios.</p>

                <Card border="dark" style={{ width: "80%", margin: "24px auto", textAlign: "start" }}>
                    <Card.Body>
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Correo electronico</Form.Label>
                                <Form.Control type="email" placeholder="test@example.com" onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Contraseña</Form.Label>
                                <Form.Control type="password" placeholder="********" onChange={(e) => setPwd(e.target.value)} />
                            </Form.Group>

                            {
                                isLoading ? <Spinner animation="grow" style={{ display: "flex", margin: "auto" }} /> : <Button variant="primary" type="submit" onClick={submitForm}>
                                    Iniciar Sesión
                                </Button>
                            }

                        </Form>
                    </Card.Body>
                </Card>

            </Container>
        </div>
    )
}

export default Login;